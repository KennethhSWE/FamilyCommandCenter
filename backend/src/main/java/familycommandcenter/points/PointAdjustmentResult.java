package familycommandcenter.points;

public class PointAdjustmentResult {

    private final String username;
    private final String action;
    private final int oldPoints;
    private final int changeAmount;
    private final int newPoints;
    private final String reason;

    public PointAdjustmentResult(
            String username,
            String action,
            int oldPoints,
            int changeAmount,
            int newPoints,
            String reason) {
        this.username = username;
        this.action = action;
        this.oldPoints = oldPoints;
        this.changeAmount = changeAmount;
        this.newPoints = newPoints;
        this.reason = reason;
    }

    public String getUsername() {
        return username;
    }

    public String getAction() {
        return action;
    }

    public int getOldPoints() {
        return oldPoints;
    }

    public int getChangeAmount() {
        return changeAmount;
    }

    public int getNewPoints() {
        return newPoints;
    }

    public String getReason() {
        return reason;
    }
}