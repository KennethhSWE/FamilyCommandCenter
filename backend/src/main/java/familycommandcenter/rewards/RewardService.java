package familycommandcenter.rewards;

import familycommandcenter.points.PointsService;
import familycommandcenter.approvals.ApprovalQueueService;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class RewardService {

    private static final int APPROVAL_POINT_LIMIT = 50;

    private final RewardRepository rewardRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final PointsService pointsService;
    private final ApprovalQueueService approvalQueueService;

    public RewardService(
            RewardRepository rewardRepository,
            RewardRedemptionRepository redemptionRepository,
            PointsService pointsService,
            ApprovalQueueService approvalQueueService) {

        this.rewardRepository = rewardRepository;
        this.redemptionRepository = redemptionRepository;
        this.pointsService = pointsService;
        this.approvalQueueService = approvalQueueService;
    }

    public List<RewardCard> getRewardShop() throws SQLException {
        return rewardRepository.findAllRewards();
    }

    public void addReward(CreateRewardRequest reward) throws SQLException {
        rewardRepository.saveReward(reward);
    }

    public void addRewards(List<CreateRewardRequest> rewards) throws SQLException {
        for (CreateRewardRequest reward : rewards) {
            addReward(reward);
        }
    }

    public void deleteReward(int rewardId) throws SQLException {
        rewardRepository.deleteReward(rewardId);
    }

    public RewardRedeemResult kidWantsReward(String username, int rewardId)
            throws SQLException {

        Optional<RewardCard> possibleReward = rewardRepository.findById(rewardId);

        if (possibleReward.isEmpty()) {
            return RewardRedeemResult.notFound();
        }

        RewardCard reward = possibleReward.get();
        int currentPoints = pointsService.getPoints(username);

        if (currentPoints < reward.getCost()) {
            return RewardRedeemResult.notEnoughPoints();
        }

        boolean needsParentApproval = reward.isRequiresApproval() || reward.getCost() > APPROVAL_POINT_LIMIT;

        if (needsParentApproval) {
            int redemptionId = redemptionRepository.createRedemption(
                    username,
                    rewardId,
                    "WAITING_FOR_PARENT");

            approvalQueueService.addRewardApproval(username, reward, redemptionId);

            return RewardRedeemResult.waitingForParent();
        }

        pointsService.takePointsButDontGoNegative(username, reward.getCost());

        redemptionRepository.createRedemption(
                username,
                rewardId,
                "AUTO_APPROVED");

        return RewardRedeemResult.autoApproved();
    }

    public boolean parentApprovesReward(int redemptionId) throws SQLException {
        Optional<RewardRedemptionCard> possibleRedemption = redemptionRepository.findPendingRedemption(redemptionId);

        if (possibleRedemption.isEmpty()) {
            return false;
        }

        RewardRedemptionCard redemption = possibleRedemption.get();
        Optional<RewardCard> possibleReward = rewardRepository.findById(redemption.getRewardId());

        if (possibleReward.isEmpty()) {
            return false;
        }

        RewardCard reward = possibleReward.get();
        int currentPoints = pointsService.getPoints(redemption.getUsername());

        if (currentPoints < reward.getCost()) {
            return false;
        }

        pointsService.takePointsButDontGoNegative(
                redemption.getUsername(),
                reward.getCost());

        boolean approved = redemptionRepository.markApproved(redemptionId);

        if (approved) {
            approvalQueueService.markRewardApprovalApproved(redemptionId);
        }

        return approved;
    }

    public boolean parentDeniesReward(int redemptionId) throws SQLException {
        boolean denied = redemptionRepository.markDenied(redemptionId);

        if (denied) {
            approvalQueueService.markRewardApprovalDenied(redemptionId);
        }

        return denied;
    }
}