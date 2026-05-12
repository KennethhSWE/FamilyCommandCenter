package familycommandcenter.routes;

import familycommandcenter.points.PointAdjustmentRequest;
import familycommandcenter.points.PointAdjustmentResult;
import familycommandcenter.points.PointsService;
import io.javalin.Javalin;

import java.util.Map;

public final class PointsRoutes {

    private PointsRoutes() {
        // Utility class
    }

    public static void register(Javalin api, PointsService pointsService) {

        api.get("/api/points/{username}", ctx -> {
            String username = ctx.pathParam("username");

            try {
                int totalPoints = pointsService.getPoints(username);

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
                PointAdjustmentRequest request = ctx.bodyAsClass(PointAdjustmentRequest.class);

                PointAdjustmentResult result = pointsService.parentAdjustsPoints(request);

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