package familycommandcenter.routes;

import familycommandcenter.points.PointAdjustmentRequest;
import familycommandcenter.points.PointAdjustmentResult;
import familycommandcenter.points.PointsService;
import familycommandcenter.points.PointTransaction;
import familycommandcenter.util.AuthContext;
import io.javalin.Javalin;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class PointsRoutes {

    private PointsRoutes() {
        // Utility class
    }

    public static void register(Javalin api, PointsService pointsService) {

        api.get("/api/points/transactions/recent", ctx -> {
            try {
                UUID householdId = AuthContext.requireHouseholdId(ctx);

                List<PointTransaction> transactions = pointsService.getRecentTransactions(householdId);

                ctx.json(transactions);
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error fetching point history");
            }
        });

        api.get("/api/points/transactions/{username}", ctx -> {
            String username = ctx.pathParam("username");

            try {
                UUID householdId = AuthContext.requireHouseholdId(ctx);

                List<PointTransaction> transactions = pointsService.getRecentTransactionsForKid(
                        username,
                        householdId);

                ctx.json(transactions);
            } catch (IllegalArgumentException e) {
                ctx.status(400).json(Map.of("message", e.getMessage()));
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error fetching kid point history");
            }
        });

        api.get("/api/points/{username}", ctx -> {
            String username = ctx.pathParam("username");

            try {
                UUID householdId = AuthContext.requireHouseholdId(ctx);

                int totalPoints = pointsService.getPoints(
                        username,
                        householdId);

                ctx.json(Map.of(
                        "user_name", username,
                        "total_points", totalPoints));
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error fetching points");
            }
        });

        api.post("/api/points/adjust", ctx -> {
            try {
                AuthContext.requireParent(ctx);

                UUID householdId = AuthContext.requireHouseholdId(ctx);

                PointAdjustmentRequest request = ctx.bodyAsClass(PointAdjustmentRequest.class);

                PointAdjustmentResult result = pointsService.parentAdjustsPoints(
                        request,
                        householdId);

                ctx.json(result);
            } catch (IllegalArgumentException e) {
                ctx.status(400).json(Map.of("message", e.getMessage()));
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error adjusting points");
            }
        });
    }
}