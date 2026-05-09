package familycommandcenter.rewards;

import java.time.LocalDateTime;

public class RewardRedemptionCard {

    private int id;
    private String username;
    private int rewardId;
    private String status;
    private LocalDateTime redeemedAt;

    public RewardRedemptionCard() {
        // Needed for JSON mapping
    }

    public RewardRedemptionCard(
            int id,
            String username,
            int rewardId,
            String status,
            LocalDateTime redeemedAt) {

        this.id = id;
        this.username = username;
        this.rewardId = rewardId;
        this.status = status;
        this.redeemedAt = redeemedAt;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public int getRewardId() {
        return rewardId;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getRedeemedAt() {
        return redeemedAt;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setRewardId(int rewardId) {
        this.rewardId = rewardId;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setRedeemedAt(LocalDateTime redeemedAt) {
        this.redeemedAt = redeemedAt;
    }
}