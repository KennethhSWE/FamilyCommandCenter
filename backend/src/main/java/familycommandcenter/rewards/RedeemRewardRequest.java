package familycommandcenter.rewards;

public class RedeemRewardRequest {

    private String username;
    private int rewardId;

    public RedeemRewardRequest() {
        // Needed for JSON mapping
    }

    public String getUsername() {
        return username;
    }

    public int getRewardId() {
        return rewardId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setRewardId(int rewardId) {
        this.rewardId = rewardId;
    }
}