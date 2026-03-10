package familycommandcenter.routes;

import com.fasterxml.jackson.databind.ObjectMapper;
import familycommandcenter.model.PointsBankDAO;
import familycommandcenter.model.Redemption; 
import familycommandcenter.model.RedemptionDAO;
import familycommandcenter.model.Reward;
import familycommandcenter.model.RewardDAO;
import io.javalin.Javalin; 

import java.util.Map;


public final class RewardRoutes {
    
    private static final ObjectMapper JSON = new ObjectMapper(); 

    private RewardRoutes() {
        //Utility class
    }

      public static void register(
            Javalin api,
            RewardDAO rewardDAO,
            PointsBankDAO pointsDAO,
            RedemptionDAO redemptionDAO
    ) {
        api.post("/api/rewards/redeem", ctx -> {
            record RedeemReq(String username, int rewardId) {}

            RedeemReq req = JSON.readValue(ctx.body(), RedeemReq.class);

            Reward reward = rewardDAO.getRewardById(req.rewardId()).orElseThrow();
            int userPoints = pointsDAO.getPoints(req.username());

            if (userPoints < reward.getCost()) {
                ctx.status(400).result("Not enough points");
                return;
            }

            if (reward.isRequiresApproval()) {
                redemptionDAO.createRedemption(new Redemption(req.username(), req.rewardId(), "pending"));
            } else {
                pointsDAO.deductPoints(req.username(), reward.getCost());
                redemptionDAO.createRedemption(new Redemption(req.username(), req.rewardId(), "approved"));
            }

            ctx.status(200);
        });

        api.post("/api/rewards/bulk", ctx -> {
            System.out.println("Bulk rewards posted: " + ctx.body());
            ctx.status(200);
        });

        api.put("/api/rewards/approve/{redemptionId}", ctx -> {
            int redemptionId = Integer.parseInt(ctx.pathParam("redemptionId"));

            if (redemptionDAO.approveRedemption(redemptionId)) {
                ctx.status(200);
            } else {
                ctx.status(400).result("Redemption not found");
            }
        });

        api.get("/api/points/{username}", ctx -> {
            String username = ctx.pathParam("username");

            try {
                int totalPoints = pointsDAO.getPoints(username);
                ctx.json(Map.of(
                        "user_name", username,
                        "total_points", totalPoints
                ));
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error fetching points");
            }
        });
    }
}
