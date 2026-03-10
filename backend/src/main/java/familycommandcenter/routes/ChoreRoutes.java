package familycommandcenter.routes;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import familycommandcenter.model.Chore;
import familycommandcenter.model.ChoreDataService;
import io.javalin.Javalin;

import java.util.List;
import java.util.Map;

public final class ChoreRoutes {

    private static final ObjectMapper JSON = new ObjectMapper();

    private ChoreRoutes() {
        // utility class
    }

    public static void register(Javalin api) {

        api.post("/api/chores/bulk", ctx -> {
            try {
                List<Chore> chores = JSON.readValue(ctx.body(), new TypeReference<>() {});
                for (Chore chore : chores) {
                    ChoreDataService.addChore(chore);
                }
                ctx.status(201).result("Chores added");
            } catch (Exception e) {
                System.err.println("Error saving chores");
                e.printStackTrace();
                System.err.println("Request body: " + ctx.body());
                ctx.status(500).result("Failed to save chores");
            }
        });

        api.get("/api/chores", ctx -> ctx.json(ChoreDataService.getAllChores()));

        api.get("/api/chores/today", ctx ->
                ctx.json(ChoreDataService.getChoresDueToday()));

        api.get("/api/chores/overdue", ctx ->
                ctx.json(ChoreDataService.getOverdueChores()));

        api.get("/api/chores/kid/{username}", ctx -> {
            String username = ctx.pathParam("username");
            ctx.json(ChoreDataService.getIncompleteByKid(username));
        });

        api.post("/api/chores", ctx -> {
            Chore chore = ctx.bodyAsClass(Chore.class);
            ChoreDataService.addChore(chore);
            ctx.status(201);
        });

        api.delete("/api/chores/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            ChoreDataService.deleteChore(id);
            ctx.status(204);
        });

        api.post("/api/chores/complete/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));

            try {
                boolean ok = ChoreDataService.markComplete(id);
                if (ok) {
                    ctx.status(200).json(Map.of("id", id, "complete", true));
                } else {
                    ctx.status(404).result("Chore not found");
                }
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Failed to complete chore");
            }
        });
    }
}