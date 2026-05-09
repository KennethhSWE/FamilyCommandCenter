package familycommandcenter.approvals;

import familycommandcenter.chores.ChoreCard;
import familycommandcenter.rewards.RewardCard;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class ApprovalQueueService {

    private final ApprovalQueueRepository approvalQueueRepository;

    public ApprovalQueueService(ApprovalQueueRepository approvalQueueRepository) {
        this.approvalQueueRepository = approvalQueueRepository;
    }

    public void makeSureTableExists() throws SQLException {
        approvalQueueRepository.makeSureTableExists();
    }

    public List<ApprovalQueueItem> getWaitingApprovals() throws SQLException {
        return approvalQueueRepository.findWaitingApprovals();
    }

    public Optional<ApprovalQueueItem> getApprovalById(int approvalId) throws SQLException {
        return approvalQueueRepository.findById(approvalId);
    }

    public void addChoreApproval(ChoreCard chore) throws SQLException {
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
                message);
    }

    public void addRewardApproval(
            String username,
            RewardCard reward,
            int redemptionId) throws SQLException {

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
                message);
    }

    public void markChoreApprovalApproved(int choreId) throws SQLException {
        approvalQueueRepository.markApprovedByRelatedRecord(
                ApprovalType.CHORE_COMPLETION,
                choreId);
    }

    public void markChoreApprovalDenied(int choreId) throws SQLException {
        approvalQueueRepository.markDeniedByRelatedRecord(
                ApprovalType.CHORE_COMPLETION,
                choreId);
    }

    public void markRewardApprovalApproved(int redemptionId) throws SQLException {
        approvalQueueRepository.markApprovedByRelatedRecord(
                ApprovalType.REWARD_REDEMPTION,
                redemptionId);
    }

    public void markRewardApprovalDenied(int redemptionId) throws SQLException {
        approvalQueueRepository.markDeniedByRelatedRecord(
                ApprovalType.REWARD_REDEMPTION,
                redemptionId);
    }
}