package familycommandcenter.rewards;

import java.time.LocalDateTime;

public class RewardSuggestion {

    private final int id;
    private final String suggestedBy;
    private final String name;
    private final int cost;
    private final String reason;
    private final String status;
    private final LocalDateTime createdAt;
    private final LocalDateTime reviewedAt;

    public RewardSuggestion(
            int id,
            String suggestedBy,
            String name,
            int cost,
            String reason,
            String status,
            LocalDateTime createdAt,
            LocalDateTime reviewedAt) {
        this.id = id;
        this.suggestedBy = suggestedBy;
        this.name = name;
        this.cost = cost;
        this.reason = reason;
        this.status = status;
        this.createdAt = createdAt;
        this.reviewedAt = reviewedAt;
    }

    public int getId() {
        return id;
    }

    public String getSuggestedBy() {
        return suggestedBy;
    }

    public String getName() {
        return name;
    }

    public int getCost() {
        return cost;
    }

    public String getReason() {
        return reason;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
}