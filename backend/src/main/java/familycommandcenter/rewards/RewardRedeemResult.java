package familycommandcenter.rewards;

public class RewardRedeemResult {

    private String status;
    private String message;

    public RewardRedeemResult() {
        // Needed for JSON mapping
    }

    public RewardRedeemResult(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public static RewardRedeemResult autoApproved() {
        return new RewardRedeemResult("AUTO_APPROVED", "Reward redeemed");
    }

    public static RewardRedeemResult waitingForParent() {
        return new RewardRedeemResult("WAITING_FOR_PARENT", "Waiting for parent approval");
    }

    public static RewardRedeemResult notEnoughPoints() {
        return new RewardRedeemResult("NOT_ENOUGH_POINTS", "Not enough points");
    }

    public static RewardRedeemResult notFound() {
        return new RewardRedeemResult("NOT_FOUND", "Reward not found");
    }

    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}