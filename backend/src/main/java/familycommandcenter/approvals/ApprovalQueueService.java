package familycommandcenter.approvals;

import familycommandcenter.chores.ChoreCard;
import familycommandcenter.notifications.NotificationService;
import familycommandcenter.rewards.RewardCard;
import familycommandcenter.rewards.RewardSuggestion;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class ApprovalQueueService {

    private final ApprovalQueueRepository approvalQueueRepository;
    private final NotificationService notificationService;

    public ApprovalQueueService(
            ApprovalQueueRepository approvalQueueRepository,
            NotificationService notificationService) {

        this.approvalQueueRepository = approvalQueueRepository;
        this.notificationService = notificationService;
    }

    public void makeSureTableExists() throws SQLException {
        approvalQueueRepository.makeSureTableExists();
    }

    public List<ApprovalQueueItem> getWaitingApprovals(UUID householdId)
            throws SQLException {
        return approvalQueueRepository.findWaitingApprovals(householdId);
    }

    public Optional<ApprovalQueueItem> getApprovalById(
            int approvalId,
            UUID householdId) throws SQLException {
        return approvalQueueRepository.findById(approvalId, householdId);
    }

    public void addChoreApproval(
            ChoreCard chore,
            UUID householdId) throws SQLException {

        String title = "Chore needs checked";
        String message = chore.getAssignedTo()
                + " says \""
                + chore.getName()
                + "\" is done. Worth "
                + chore.getPoints()
                + " points.";

        approvalQueueRepository.addWaitingApproval(
                ApprovalType.CHORE_COMPLETION,
                chore.getId(),
                title,
                message,
                householdId);

        notificationService.parentNeedsToCheckChore(message, householdId);
    }

    public void addRewardApproval(
            String username,
            RewardCard reward,
            int redemptionId,
            UUID householdId) throws SQLException {

        String title = "Reward needs approval";
        String message = username
                + " wants to redeem \""
                + reward.getName()
                + "\" for "
                + reward.getCost()
                + " points.";

        approvalQueueRepository.addWaitingApproval(
                ApprovalType.REWARD_REDEMPTION,
                redemptionId,
                title,
                message,
                householdId);

        notificationService.parentNeedsToApproveReward(message, householdId);
    }

    public void markChoreApprovalApproved(
            int choreId,
            UUID householdId) throws SQLException {
        approvalQueueRepository.markApprovedByRelatedRecord(
                ApprovalType.CHORE_COMPLETION,
                choreId,
                householdId);
    }

    public void markChoreApprovalDenied(
            int choreId,
            UUID householdId) throws SQLException {
        approvalQueueRepository.markDeniedByRelatedRecord(
                ApprovalType.CHORE_COMPLETION,
                choreId,
                householdId);
    }

    public void markRewardApprovalApproved(
            int redemptionId,
            UUID householdId) throws SQLException {
        approvalQueueRepository.markApprovedByRelatedRecord(
                ApprovalType.REWARD_REDEMPTION,
                redemptionId,
                householdId);
    }

    public void markRewardApprovalDenied(
            int redemptionId,
            UUID householdId) throws SQLException {
        approvalQueueRepository.markDeniedByRelatedRecord(
                ApprovalType.REWARD_REDEMPTION,
                redemptionId,
                householdId);
    }

    public void addRewardSuggestionApproval(
            RewardSuggestion suggestion,
            UUID householdId) throws SQLException {

        String title = "New reward suggested";
        String message = suggestion.getSuggestedBy()
                + " suggested \""
                + suggestion.getName()
                + "\" for "
                + suggestion.getCost()
                + " points.";

        if (suggestion.getReason() != null && !suggestion.getReason().isBlank()) {
            message += " Reason: " + suggestion.getReason();
        }

        approvalQueueRepository.addWaitingApproval(
                ApprovalType.REWARD_SUGGESTION,
                suggestion.getId(),
                title,
                message,
                householdId);

        notificationService.parentHasRewardSuggestion(message, householdId);
    }

    public void markRewardSuggestionApproved(
            int suggestionId,
            UUID householdId) throws SQLException {
        approvalQueueRepository.markApprovedByRelatedRecord(
                ApprovalType.REWARD_SUGGESTION,
                suggestionId,
                householdId);
    }

    public void markRewardSuggestionDenied(
            int suggestionId,
            UUID householdId) throws SQLException {
        approvalQueueRepository.markDeniedByRelatedRecord(
                ApprovalType.REWARD_SUGGESTION,
                suggestionId,
                householdId);
    }
}