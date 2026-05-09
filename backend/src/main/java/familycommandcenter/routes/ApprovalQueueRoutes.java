package familycommandcenter.routes;

import familycommandcenter.approvals.ApprovalQueueItem;
import familycommandcenter.approvals.ApprovalQueueService;
import familycommandcenter.approvals.ApprovalType;
import familycommandcenter.chores.ChoreService;
import familycommandcenter.rewards.RewardService;
import io.javalin.Javalin;

import java.util.Map;
import java.util.Optional;

public final class ApprovalQueueRoutes {

    private ApprovalQueueRoutes() {
        // Utility class
    }

    public static void register(
            Javalin api,
            ApprovalQueueService approvalQueueService,
            ChoreService choreService,
            RewardService rewardService) {

        api.get("/api/approvals/waiting", ctx -> ctx.json(approvalQueueService.getWaitingApprovals()));

        api.patch("/api/approvals/{approvalId}/approve", ctx -> {
            int approvalId = Integer.parseInt(ctx.pathParam("approvalId"));

            Optional<ApprovalQueueItem> possibleApproval = approvalQueueService.getApprovalById(approvalId);

            if (possibleApproval.isEmpty()) {
                ctx.status(404).result("Approval not found");
                return;
            }

            ApprovalQueueItem approval = possibleApproval.get();
            boolean approved = approveRelatedThing(
                    approval,
                    choreService,
                    rewardService);

            if (approved) {
                ctx.status(200).json(Map.of("approved", true));
            } else {
                ctx.status(400).result("Approval could not be completed");
            }
        });

        api.patch("/api/approvals/{approvalId}/deny", ctx -> {
            int approvalId = Integer.parseInt(ctx.pathParam("approvalId"));

            Optional<ApprovalQueueItem> possibleApproval = approvalQueueService.getApprovalById(approvalId);

            if (possibleApproval.isEmpty()) {
                ctx.status(404).result("Approval not found");
                return;
            }

            ApprovalQueueItem approval = possibleApproval.get();
            boolean denied = denyRelatedThing(
                    approval,
                    choreService,
                    rewardService);

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
            RewardService rewardService) throws Exception {

        if (approval.getApprovalType() == ApprovalType.CHORE_COMPLETION) {
            return choreService.parentApprovesChore(approval.getRelatedRecordId());
        }

        if (approval.getApprovalType() == ApprovalType.REWARD_REDEMPTION) {
            return rewardService.parentApprovesReward(approval.getRelatedRecordId());
        }

        return false;
    }

    private static boolean denyRelatedThing(
            ApprovalQueueItem approval,
            ChoreService choreService,
            RewardService rewardService) throws Exception {

        if (approval.getApprovalType() == ApprovalType.CHORE_COMPLETION) {
            return choreService.parentRejectsChore(approval.getRelatedRecordId());
        }

        if (approval.getApprovalType() == ApprovalType.REWARD_REDEMPTION) {
            return rewardService.parentDeniesReward(approval.getRelatedRecordId());
        }

        return false;
    }
}