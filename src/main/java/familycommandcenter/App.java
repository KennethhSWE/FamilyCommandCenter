package familycommandcenter;

import io.javalin.Javalin;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

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
            ctx.json(new String[] { "Take out the trash", "Feed the dog", "Clean the living room" });
        });

        app.get("/api/chores/by-user", ctx -> {
            try {
                Map<String, List<Chore>> grouped = ChoreDataService.getChoresGroupedByUser();
                ctx.json(grouped);
            }catch (SQLException e) {
                ctx.status(500).result("Error retrieving chores: " + e.getMessage());
            }
        });

        System.out.println("Registering POST /api/chores");
        // POST endpoint to add a new chore
        app.post("/api/chores", ctx -> {
            Chore newChore = ctx.bodyAsClass(Chore.class);
            try {
                ChoreDataService.addChore(newChore);
                ctx.status(201).result("Chore added successfully");
            } catch (SQLException e) {
                ctx.status(500).result("Error adding chore: " + e.getMessage());
            }
        });

        System.out.println("Removing Chores endpoint");
        app.delete("/api/chores/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            ChoreDataService.deleteChore(id);
            ctx.status(204);
        });

        app.put("/api/chores/{id}/complete", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));

            try {
                ChoreDataService.markChoreComplete(id);
                ctx.status(200).result("Chore marked as complete.");
            } catch (SQLException e) {
                ctx.status(500).result("Error marking chore as complete: " + e.getMessage());
            }
        });

        app.patch("/api/chores/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            System.out.println("Updating chore with ID: " + id);
            Chore updatedChore = ctx.bodyAsClass(Chore.class);

            try {
                ChoreDataService.updateChore(updatedChore);
                ctx.status(200).result("Chore updated successfully");
            } catch (SQLException e) {
                e.printStackTrace();
                ctx.status(500).result("Error updating chore: " + e.getMessage());
            }
        });
    }
}
