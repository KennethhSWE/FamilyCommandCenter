package familycommandcenter.routes;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import familycommandcenter.rewards.CreateRewardRequest;
import familycommandcenter.rewards.RedeemRewardRequest;
import familycommandcenter.rewards.RewardRedeemResult;
import familycommandcenter.rewards.RewardService;
import io.javalin.Javalin;

import java.util.List;
import java.util.Map;

public final class RewardRoutes {

    private static final ObjectMapper JSON = new ObjectMapper();

    private RewardRoutes() {
        // Utility class
    }

    public static void register(Javalin api, RewardService rewardService) {

        api.get("/api/rewards", ctx -> ctx.json(rewardService.getRewardShop()));

        api.post("/api/rewards", ctx -> {
            CreateRewardRequest reward = ctx.bodyAsClass(CreateRewardRequest.class);
            rewardService.addReward(reward);
            ctx.status(201).json(Map.of("created", true));
        });

        api.post("/api/rewards/bulk", ctx -> {
            try {
                List<CreateRewardRequest> rewards = JSON.readValue(ctx.body(), new TypeReference<>() {
                });

                rewardService.addRewards(rewards);

                ctx.status(201).json(Map.of("saved", rewards.size()));
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Failed to save rewards");
            }
        });

        api.post("/api/rewards/redeem", ctx -> {
            RedeemRewardRequest request = ctx.bodyAsClass(RedeemRewardRequest.class);

            RewardRedeemResult result = rewardService.kidWantsReward(
                    request.getUsername(),
                    request.getRewardId());

            if ("NOT_FOUND".equals(result.getStatus())) {
                ctx.status(404).json(result);
                return;
            }

            if ("NOT_ENOUGH_POINTS".equals(result.getStatus())) {
                ctx.status(400).json(result);
                return;
            }

            ctx.status(200).json(result);
        });

        api.patch("/api/rewards/approve/{redemptionId}", ctx -> {
            int redemptionId = Integer.parseInt(ctx.pathParam("redemptionId"));

            boolean approved = rewardService.parentApprovesReward(redemptionId);

            if (approved) {
                ctx.status(200).json(Map.of("approved", true));
            } else {
                ctx.status(400).result("Reward redemption could not be approved");
            }
        });

        api.patch("/api/rewards/deny/{redemptionId}", ctx -> {
            int redemptionId = Integer.parseInt(ctx.pathParam("redemptionId"));

            boolean denied = rewardService.parentDeniesReward(redemptionId);

            if (denied) {
                ctx.status(200).json(Map.of("denied", true));
            } else {
                ctx.status(400).result("Reward redemption could not be denied");
            }
        });

        api.delete("/api/rewards/{rewardId}", ctx -> {
            int rewardId = Integer.parseInt(ctx.pathParam("rewardId"));
            rewardService.deleteReward(rewardId);
            ctx.status(204);
        });
    }
}