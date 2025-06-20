package familycommandcenter;

import io.javalin.Javalin;
import java.sql.Connection;
import java.sql.SQLException;

import familycommandcenter.model.Chore;
import familycommandcenter.model.ChoreDataService;

public class App {
    public static void main(String[] args) {
        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> {
                cors.add(it -> {
                    it.anyHost();
                });
            });
        }).start(7070);

        System.out.println("Javalin server started on port 7070");

        try (Connection conn = Database.getConnection()) {
            System.out.println("Connected to PostgreSQL!");
        } catch (SQLException e) {
            System.out.println("Failed to connect to PostgreSQL: " + e.getMessage());
        }

        // Define routes 
        app.get("/", ctx -> ctx.result("Family Command Center is LIVE!"));

        app.get("/api/chores", ctx -> {
            ctx.json(ChoreDataService.getAllChores());
        });

        app.get("/api/family-members", ctx -> {
            ctx.json(new String[]{"Take out the trash", "Feed the dog", "Clean the living room"});
        });

        System.out.println("Registering POST /api/chores");
        // POST endpoint to add a new chore 
        app.post("/api/chores", ctx -> {
            Chore newChore = ctx.bodyAsClass(Chore.class);
            try {
                ChoreDataService.addChore(newChore);
                ctx.status(201).result("Chore added successfully");
            }catch (SQLException e) {
                ctx.status(500).result("Error adding chore: " + e.getMessage());
            } 
        });
    }
}
