package familycommandcenter.rewards;

import familycommandcenter.approvals.ApprovalQueueService;
import familycommandcenter.points.PointsService;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class RewardService {

    private static final int APPROVAL_POINT_LIMIT = 50;

    private final RewardRepository rewardRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final PointsService pointsService;
    private final ApprovalQueueService approvalQueueService;
    private final RewardSuggestionRepository suggestionRepository;

    public RewardService(
            RewardRepository rewardRepository,
            RewardRedemptionRepository redemptionRepository,
            RewardSuggestionRepository suggestionRepository,
            PointsService pointsService,
            ApprovalQueueService approvalQueueService) {

        this.rewardRepository = rewardRepository;
        this.redemptionRepository = redemptionRepository;
        this.pointsService = pointsService;
        this.approvalQueueService = approvalQueueService;
        this.suggestionRepository = suggestionRepository;
    }

    public List<RewardCard> getRewardShop(UUID householdId) throws SQLException {
        return rewardRepository.findAllRewards(householdId);
    }

    public void addReward(CreateRewardRequest reward, UUID householdId) throws SQLException {
        rewardRepository.saveReward(reward, householdId);
    }

    public void addRewards(List<CreateRewardRequest> rewards, UUID householdId) throws SQLException {
        for (CreateRewardRequest reward : rewards) {
            addReward(reward, householdId);
        }
    }

    public void deleteReward(int rewardId, UUID householdId) throws SQLException {
        rewardRepository.deleteReward(rewardId, householdId);
    }

    public RewardRedeemResult kidWantsReward(
            String username,
            int rewardId,
            UUID householdId) throws SQLException {

        Optional<RewardCard> possibleReward = rewardRepository.findById(
                rewardId,
                householdId);

        if (possibleReward.isEmpty()) {
            return RewardRedeemResult.notFound();
        }

        RewardCard reward = possibleReward.get();
        int currentPoints = pointsService.getPoints(username, householdId);

        if (currentPoints < reward.getCost()) {
            return RewardRedeemResult.notEnoughPoints();
        }

        boolean needsParentApproval = reward.isRequiresApproval()
                || reward.getCost() > APPROVAL_POINT_LIMIT;

        if (needsParentApproval) {
            int redemptionId = redemptionRepository.createRedemption(
                    username,
                    rewardId,
                    "WAITING_FOR_PARENT",
                    householdId);

            approvalQueueService.addRewardApproval(
                    username,
                    reward,
                    redemptionId,
                    householdId);

            return RewardRedeemResult.waitingForParent();
        }

        pointsService.takePointsButDontGoNegative(
                username,
                reward.getCost(),
                householdId);

        redemptionRepository.createRedemption(
                username,
                rewardId,
                "AUTO_APPROVED",
                householdId);

        return RewardRedeemResult.autoApproved();
    }

    public RewardSuggestion kidSuggestsReward(
            SuggestRewardRequest request,
            UUID householdId) throws SQLException {

        validateRewardSuggestion(request);

        RewardSuggestion suggestion = suggestionRepository.createSuggestion(
                request,
                householdId);

        approvalQueueService.addRewardSuggestionApproval(
                suggestion,
                householdId);

        return suggestion;
    }

    public boolean parentApprovesRewardSuggestion(
            int suggestionId,
            UUID householdId) throws SQLException {

        Optional<RewardSuggestion> possibleSuggestion = suggestionRepository.findWaitingById(
                suggestionId,
                householdId);

        if (possibleSuggestion.isEmpty()) {
            return false;
        }

        RewardSuggestion suggestion = possibleSuggestion.get();

        CreateRewardRequest reward = new CreateRewardRequest();
        reward.setName(suggestion.getName());
        reward.setCost(suggestion.getCost());
        reward.setRequiresApproval(suggestion.getCost() > APPROVAL_POINT_LIMIT);

        rewardRepository.saveReward(reward, householdId);

        boolean approved = suggestionRepository.markApproved(
                suggestionId,
                householdId);

        if (approved) {
            approvalQueueService.markRewardSuggestionApproved(
                    suggestionId,
                    householdId);
        }

        return approved;
    }

    public boolean parentDeniesRewardSuggestion(
            int suggestionId,
            UUID householdId) throws SQLException {

        boolean denied = suggestionRepository.markDenied(
                suggestionId,
                householdId);

        if (denied) {
            approvalQueueService.markRewardSuggestionDenied(
                    suggestionId,
                    householdId);
        }

        return denied;
    }

    public boolean parentApprovesReward(
            int redemptionId,
            UUID householdId) throws SQLException {

        Optional<RewardRedemptionCard> possibleRedemption = redemptionRepository.findPendingRedemption(
                redemptionId,
                householdId);

        if (possibleRedemption.isEmpty()) {
            return false;
        }

        RewardRedemptionCard redemption = possibleRedemption.get();

        Optional<RewardCard> possibleReward = rewardRepository.findById(
                redemption.getRewardId(),
                householdId);

        if (possibleReward.isEmpty()) {
            return false;
        }

        RewardCard reward = possibleReward.get();
        int currentPoints = pointsService.getPoints(
                redemption.getUsername(),
                householdId);

        if (currentPoints < reward.getCost()) {
            return false;
        }

        pointsService.takePointsButDontGoNegative(
                redemption.getUsername(),
                reward.getCost(),
                householdId);

        boolean approved = redemptionRepository.markApproved(
                redemptionId,
                householdId);

        if (approved) {
            approvalQueueService.markRewardApprovalApproved(
                    redemptionId,
                    householdId);
        }

        return approved;
    }

    public boolean parentDeniesReward(
            int redemptionId,
            UUID householdId) throws SQLException {

        boolean denied = redemptionRepository.markDenied(
                redemptionId,
                householdId);

        if (denied) {
            approvalQueueService.markRewardApprovalDenied(
                    redemptionId,
                    householdId);
        }

        return denied;
    }

    private void validateRewardSuggestion(SuggestRewardRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Reward suggestion is required.");
        }

        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("Kid username is required.");
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Reward name is required.");
        }

        if (request.getCost() <= 0) {
            throw new IllegalArgumentException("Reward cost must be greater than 0.");
        }
    }
}