package familycommandcenter.routes;

import familycommandcenter.approvals.ApprovalQueueItem;
import familycommandcenter.approvals.ApprovalQueueService;
import familycommandcenter.approvals.ApprovalType;
import familycommandcenter.chores.ChoreService;
import familycommandcenter.rewards.RewardService;
import familycommandcenter.util.AuthContext;
import io.javalin.Javalin;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public final class ApprovalQueueRoutes {

    private ApprovalQueueRoutes() {
        // Utility class
    }

    public static void register(
            Javalin api,
            ApprovalQueueService approvalQueueService,
            ChoreService choreService,
            RewardService rewardService) {

        api.get("/api/approvals/waiting", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ctx.json(approvalQueueService.getWaitingApprovals(householdId));
        });

        api.patch("/api/approvals/{approvalId}/approve", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);
            int approvalId = Integer.parseInt(ctx.pathParam("approvalId"));

            Optional<ApprovalQueueItem> possibleApproval = approvalQueueService.getApprovalById(
                    approvalId,
                    householdId);

            if (possibleApproval.isEmpty()) {
                ctx.status(404).result("Approval not found");
                return;
            }

            ApprovalQueueItem approval = possibleApproval.get();

            boolean approved = approveRelatedThing(
                    approval,
                    choreService,
                    rewardService,
                    householdId);

            if (approved) {
                ctx.status(200).json(Map.of("approved", true));
            } else {
                ctx.status(400).result("Approval could not be completed");
            }
        });

        api.patch("/api/approvals/{approvalId}/deny", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);
            int approvalId = Integer.parseInt(ctx.pathParam("approvalId"));

            Optional<ApprovalQueueItem> possibleApproval = approvalQueueService.getApprovalById(
                    approvalId,
                    householdId);

            if (possibleApproval.isEmpty()) {
                ctx.status(404).result("Approval not found");
                return;
            }

            ApprovalQueueItem approval = possibleApproval.get();

            boolean denied = denyRelatedThing(
                    approval,
                    choreService,
                    rewardService,
                    householdId);

            if (denied) {
                ctx.status(200).json(Map.of("denied", true));
            } else {
                ctx.status(400).result("Approval could not be denied");
            }
        });
    }

    private static boolean approveRelatedThing(
            ApprovalQueueItem approval,
            ChoreService choreService,
            RewardService rewardService,
            UUID householdId) throws Exception {

        if (approval.getApprovalType() == ApprovalType.CHORE_COMPLETION) {
            /*
             * Chores are not household-scoped yet.
             * This will be fixed when we add household_id to chores.
             */
            return choreService.parentApprovesChore(
                    approval.getRelatedRecordId(),
                    householdId);
        }

        if (approval.getApprovalType() == ApprovalType.REWARD_REDEMPTION) {
            return rewardService.parentApprovesReward(
                    approval.getRelatedRecordId(),
                    householdId);
        }

        if (approval.getApprovalType() == ApprovalType.REWARD_SUGGESTION) {
            return rewardService.parentApprovesRewardSuggestion(
                    approval.getRelatedRecordId(),
                    householdId);
        }

        return false;
    }

    private static boolean denyRelatedThing(
            ApprovalQueueItem approval,
            ChoreService choreService,
            RewardService rewardService,
            UUID householdId) throws Exception {

        if (approval.getApprovalType() == ApprovalType.CHORE_COMPLETION) {
            /*
             * Chores are not household-scoped yet.
             * This will be fixed when we add household_id to chores.
             */
            return choreService.parentRejectsChore(
                    approval.getRelatedRecordId(),
                    householdId);
        }

        if (approval.getApprovalType() == ApprovalType.REWARD_REDEMPTION) {
            return rewardService.parentDeniesReward(
                    approval.getRelatedRecordId(),
                    householdId);
        }

        if (approval.getApprovalType() == ApprovalType.REWARD_SUGGESTION) {
            return rewardService.parentDeniesRewardSuggestion(
                    approval.getRelatedRecordId(),
                    householdId);
        }

        return false;
    }
}