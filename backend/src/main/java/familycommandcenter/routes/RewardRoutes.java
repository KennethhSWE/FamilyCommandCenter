package familycommandcenter.routes;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import familycommandcenter.rewards.CreateRewardRequest;
import familycommandcenter.rewards.RedeemRewardRequest;
import familycommandcenter.rewards.RewardRedeemResult;
import familycommandcenter.rewards.RewardService;
import familycommandcenter.rewards.SuggestRewardRequest;
import familycommandcenter.util.AuthContext;
import io.javalin.Javalin;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class RewardRoutes {

    private static final ObjectMapper JSON = new ObjectMapper();

    private RewardRoutes() {
        // Utility class
    }

    public static void register(Javalin api, RewardService rewardService) {

        api.get("/api/rewards", ctx -> {
            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ctx.json(rewardService.getRewardShop(householdId));
        });

        api.post("/api/rewards/suggest", ctx -> {
            try {
                UUID householdId = AuthContext.requireHouseholdId(ctx);

                SuggestRewardRequest request = ctx.bodyAsClass(SuggestRewardRequest.class);

                ctx.status(201).json(
                        rewardService.kidSuggestsReward(request, householdId));
            } catch (IllegalArgumentException e) {
                ctx.status(400).json(Map.of("message", e.getMessage()));
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Failed to suggest reward");
            }
        });

        api.post("/api/rewards", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            CreateRewardRequest reward = ctx.bodyAsClass(CreateRewardRequest.class);

            rewardService.addReward(reward, householdId);

            ctx.status(201).json(Map.of("created", true));
        });

        api.post("/api/rewards/bulk", ctx -> {
            try {
                AuthContext.requireParent(ctx);

                UUID householdId = AuthContext.requireHouseholdId(ctx);

                List<CreateRewardRequest> rewards = JSON.readValue(ctx.body(), new TypeReference<>() {
                });

                rewardService.addRewards(rewards, householdId);

                ctx.status(201).json(Map.of("saved", rewards.size()));
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Failed to save rewards");
            }
        });

        api.post("/api/rewards/redeem", ctx -> {
            UUID householdId = AuthContext.requireHouseholdId(ctx);

            RedeemRewardRequest request = ctx.bodyAsClass(RedeemRewardRequest.class);

            RewardRedeemResult result = rewardService.kidWantsReward(
                    request.getUsername(),
                    request.getRewardId(),
                    householdId);

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
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            int redemptionId = Integer.parseInt(ctx.pathParam("redemptionId"));

            boolean approved = rewardService.parentApprovesReward(redemptionId, householdId);

            if (approved) {
                ctx.status(200).json(Map.of("approved", true));
            } else {
                ctx.status(400).result("Reward redemption could not be approved");
            }
        });

        api.patch("/api/rewards/deny/{redemptionId}", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            int redemptionId = Integer.parseInt(ctx.pathParam("redemptionId"));

            boolean denied = rewardService.parentDeniesReward(redemptionId, householdId);

            if (denied) {
                ctx.status(200).json(Map.of("denied", true));
            } else {
                ctx.status(400).result("Reward redemption could not be denied");
            }
        });

        api.delete("/api/rewards/{rewardId}", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            int rewardId = Integer.parseInt(ctx.pathParam("rewardId"));

            rewardService.deleteReward(rewardId, householdId);

            ctx.status(204);
        });
    }
}