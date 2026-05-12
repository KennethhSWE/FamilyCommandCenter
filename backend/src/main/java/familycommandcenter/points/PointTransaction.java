package familycommandcenter.points;

public class PointTransaction {

    private final int id;
    private final String username;
    private final int changeAmount;
    private final String reason;
    private final String source;
    private final String createdAt;

    public PointTransaction(
            int id,
            String username,
            int changeAmount,
            String reason,
            String source,
            String createdAt) {
        this.id = id;
        this.username = username;
        this.changeAmount = changeAmount;
        this.reason = reason;
        this.source = source;
        this.createdAt = createdAt;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public int getChangeAmount() {
        return changeAmount;
    }

    public String getReason() {
        return reason;
    }

    public String getSource() {
        return source;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}