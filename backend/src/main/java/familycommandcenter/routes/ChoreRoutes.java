package familycommandcenter.routes;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import familycommandcenter.chores.ChoreService;
import familycommandcenter.chores.CreateChoreRequest;
import io.javalin.Javalin;

import java.util.List;
import java.util.Map;

public final class ChoreRoutes {

    private static final ObjectMapper JSON = new ObjectMapper();

    private ChoreRoutes() {
        // utility class
    }

    public static void register(Javalin api, ChoreService choreService) {

        api.post("/api/chores/bulk", ctx -> {
            try {
                List<CreateChoreRequest> chores = JSON.readValue(ctx.body(), new TypeReference<>() {
                });

                choreService.addChores(chores);

                ctx.status(201).json(Map.of("saved", chores.size()));
            } catch (Exception e) {
                System.err.println("Error saving chores");
                e.printStackTrace();
                System.err.println("Request body: " + ctx.body());
                ctx.status(500).result("Failed to save chores: " + e.getMessage());
            }
        });

        api.get("/api/chores", ctx -> ctx.json(choreService.getAllChores()));

        api.get("/api/chores/pending", ctx -> ctx.json(choreService.getPendingApprovals()));

        api.get("/api/chores/today", ctx -> ctx.json(choreService.getChoresDueToday()));

        api.get("/api/chores/overdue", ctx -> ctx.json(choreService.getOverdueChores()));

        api.get("/api/chores/kid/{username}", ctx -> {
            String username = ctx.pathParam("username");
            ctx.json(choreService.getChoresForKid(username));
        });

        api.post("/api/chores", ctx -> {
            CreateChoreRequest chore = ctx.bodyAsClass(CreateChoreRequest.class);
            choreService.addChore(chore);
            ctx.status(201).json(Map.of("created", true));
        });

        api.delete("/api/chores/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            choreService.deleteChoreForNow(id);
            ctx.status(204);
        });

        api.patch("/api/chores/{id}/request-complete", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));

            try {
                boolean ok = choreService.kidSaysChoreIsDone(id);

                if (ok) {
                    ctx.status(200).json(Map.of(
                            "id", id,
                            "requestedComplete", true));
                } else {
                    ctx.status(404).result("Chore not found or already waiting for approval");
                }
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Failed to request chore completion");
            }
        });

        api.patch("/api/chores/{id}/approve", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));

            try {
                boolean ok = choreService.parentApprovesChore(id);

                if (ok) {
                    ctx.status(200).json(Map.of(
                            "id", id,
                            "complete", true,
                            "requestedComplete", false,
                            "verified", true));
                } else {
                    ctx.status(404).result("Chore not found or already approved");
                }
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Failed to approve chore");
            }
        });

        api.patch("/api/chores/{id}/reject", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));

            try {
                boolean ok = choreService.parentRejectsChore(id);

                if (ok) {
                    ctx.status(200).json(Map.of(
                            "id", id,
                            "requestedComplete", false));
                } else {
                    ctx.status(404).result("Chore not found or already complete");
                }
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Failed to reject chore");
            }
        });
    }
}