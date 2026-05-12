package familycommandcenter.points;

import familycommandcenter.model.PointsBankDAO;

import java.sql.SQLException;

public class PointsService {

    private final PointsBankDAO pointsBankDAO;
    private final PointTransactionRepository pointTransactionRepository;

    public PointsService(PointsBankDAO pointsBankDAO) {
        this(pointsBankDAO, null);
    }

    public PointsService(
            PointsBankDAO pointsBankDAO,
            PointTransactionRepository pointTransactionRepository) {
        this.pointsBankDAO = pointsBankDAO;
        this.pointTransactionRepository = pointTransactionRepository;
    }

    public int getPoints(String username) throws SQLException {
        return pointsBankDAO.getPoints(username);
    }

    public void addPointsForApprovedChore(String username, int points) throws SQLException {
        if (username == null || username.isBlank()) {
            return;
        }

        if (points <= 0) {
            return;
        }

        pointsBankDAO.awardPoints(username, points);
    }

    public int takePointForMissedChore(String username) throws SQLException {
        return takePointsButDontGoNegative(username, 1);
    }

    public int takePointsButDontGoNegative(String username, int pointsToTake) throws SQLException {
        if (username == null || username.isBlank()) {
            return 0;
        }

        if (pointsToTake <= 0) {
            return 0;
        }

        int currentPoints = pointsBankDAO.getPoints(username);
        int pointsActuallyTaken = Math.min(currentPoints, pointsToTake);

        if (pointsActuallyTaken > 0) {
            pointsBankDAO.deductPoints(username, pointsActuallyTaken);
        }

        return pointsActuallyTaken;
    }

    public void parentAddsPoints(String username, int points, String reason) throws SQLException {
        if (points > 0) {
            pointsBankDAO.awardPoints(username, points);
            savePointTransaction(username, points, reason, "PARENT_ADJUSTMENT");
        }
    }

    public int parentTakesPoints(String username, int points, String reason) throws SQLException {
        int pointsTaken = takePointsButDontGoNegative(username, points);

        if (pointsTaken > 0) {
            savePointTransaction(username, -pointsTaken, reason, "PARENT_ADJUSTMENT");
        }

        return pointsTaken;
    }

    public PointAdjustmentResult parentAdjustsPoints(PointAdjustmentRequest request)
            throws SQLException {

        if (request == null) {
            throw new IllegalArgumentException("Point adjustment request is required.");
        }

        String username = request.getUsername();
        String action = request.getAction();
        int points = request.getPoints();
        String reason = cleanReason(request.getReason());

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }

        if (points <= 0) {
            throw new IllegalArgumentException("Points must be greater than 0.");
        }

        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException("Action is required.");
        }

        String cleanAction = action.trim().toUpperCase();
        int oldPoints = pointsBankDAO.getPoints(username);
        int changeAmount;

        if ("ADD".equals(cleanAction)) {
            parentAddsPoints(username, points, reason);
            changeAmount = points;
        } else if ("REMOVE".equals(cleanAction)) {
            int pointsTaken = parentTakesPoints(username, points, reason);
            changeAmount = -pointsTaken;
        } else {
            throw new IllegalArgumentException("Action must be ADD or REMOVE.");
        }

        int newPoints = pointsBankDAO.getPoints(username);

        return new PointAdjustmentResult(
                username,
                cleanAction,
                oldPoints,
                changeAmount,
                newPoints,
                reason);
    }

    private void savePointTransaction(
            String username,
            int changeAmount,
            String reason,
            String source) throws SQLException {

        if (pointTransactionRepository == null) {
            return;
        }

        pointTransactionRepository.saveTransaction(
                username,
                changeAmount,
                reason,
                source);
    }

    private String cleanReason(String reason) {
        if (reason == null || reason.isBlank()) {
            return "Parent adjustment";
        }

        return reason.trim();
    }
}