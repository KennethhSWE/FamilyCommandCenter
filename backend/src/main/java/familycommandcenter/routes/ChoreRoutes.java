package familycommandcenter.routes;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import familycommandcenter.chores.ChoreService;
import familycommandcenter.chores.CreateChoreRequest;
import familycommandcenter.util.AuthContext;
import io.javalin.Javalin;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class ChoreRoutes {

    private static final ObjectMapper JSON = new ObjectMapper();

    private ChoreRoutes() {
        // Utility class
    }

    public static void register(Javalin api, ChoreService choreService) {

        api.post("/api/chores/bulk", ctx -> {
            AuthContext.requireParent(ctx);

            try {
                List<CreateChoreRequest> chores = JSON.readValue(ctx.body(), new TypeReference<>() {
                });

                UUID householdId = AuthContext.requireHouseholdId(ctx);

                choreService.addChores(chores, householdId);

                ctx.status(201).json(Map.of("saved", chores.size()));
            } catch (Exception e) {
                System.err.println("Error saving chores");
                e.printStackTrace();
                System.err.println("Request body: " + ctx.body());
                ctx.status(500).result("Failed to save chores: " + e.getMessage());
            }
        });

        api.get("/api/chores", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ctx.json(choreService.getAllChores(householdId));
        });

        api.get("/api/chores/pending", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ctx.json(choreService.getPendingApprovals(householdId));
        });

        api.get("/api/chores/today", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ctx.json(choreService.getChoresDueToday(householdId));
        });

        api.get("/api/chores/overdue", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ctx.json(choreService.getOverdueChores(householdId));
        });

        api.get("/api/chores/kid/{username}", ctx -> {
            AuthContext.requireUser(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);
            String username = ctx.pathParam("username");

            ctx.json(choreService.getChoresForKid(username, householdId));
        });

        api.post("/api/chores", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            CreateChoreRequest chore = ctx.bodyAsClass(CreateChoreRequest.class);

            choreService.addChore(chore, householdId);

            ctx.status(201).json(Map.of("created", true));
        });

        api.delete("/api/chores/{id}", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);
            int id = Integer.parseInt(ctx.pathParam("id"));

            choreService.deleteChoreForNow(id, householdId);

            ctx.status(204);
        });

        api.patch("/api/chores/{id}/request-complete", ctx -> {
            UUID householdId = AuthContext.requireHouseholdId(ctx);
            int id = Integer.parseInt(ctx.pathParam("id"));

            try {
                boolean ok = choreService.kidSaysChoreIsDone(
                        id,
                        householdId);

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
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);
            int id = Integer.parseInt(ctx.pathParam("id"));

            try {
                boolean ok = choreService.parentApprovesChore(
                        id,
                        householdId);

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
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);
            int id = Integer.parseInt(ctx.pathParam("id"));

            try {
                boolean ok = choreService.parentRejectsChore(
                        id,
                        householdId);

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