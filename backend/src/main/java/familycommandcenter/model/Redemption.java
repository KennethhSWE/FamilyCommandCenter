package familycommandcenter.model;

import java.time.LocalDateTime;

public class Redemption {
    private int id;
    private String username;
    private int rewardId;
    private String status;
    private LocalDateTime redeemedAt;

    // Constructors
    public Redemption() {}

    public Redemption(String username, int rewardId, String status) {
        this.username = username;
        this.rewardId = rewardId;
        this.status = status;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getRewardId() { return rewardId; }
    public void setRewardId(int rewardId) { this.rewardId = rewardId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRedeemedAt() { return redeemedAt; }
    public void setRedeemedAt(LocalDateTime redeemedAt) { this.redeemedAt = redeemedAt; }
}
