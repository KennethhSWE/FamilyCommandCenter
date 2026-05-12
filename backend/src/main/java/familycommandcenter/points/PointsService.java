package familycommandcenter.points;

import familycommandcenter.model.PointsBankDAO;

import java.sql.SQLException;
import java.util.List;
import java.util.UUID;

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

    public int getPoints(
            String username,
            UUID householdId) throws SQLException {

        if (username == null || username.isBlank()) {
            return 0;
        }

        return pointsBankDAO.getPoints(username.trim(), householdId);
    }

    public void addPointsForApprovedChore(
            String username,
            int points,
            UUID householdId) throws SQLException {

        if (username == null || username.isBlank()) {
            return;
        }

        if (points <= 0) {
            return;
        }

        String cleanUsername = username.trim();

        pointsBankDAO.awardPoints(cleanUsername, points, householdId);

        savePointTransaction(
                cleanUsername,
                points,
                "Approved chore",
                "CHORE_APPROVED",
                householdId);
    }

    public int takePointForMissedChore(
            String username,
            UUID householdId) throws SQLException {

        int pointsTaken = takePointsButDontGoNegative(
                username,
                1,
                householdId);

        if (pointsTaken > 0) {
            savePointTransaction(
                    username.trim(),
                    -pointsTaken,
                    "Missed chore penalty",
                    "MISSED_CHORE",
                    householdId);
        }

        return pointsTaken;
    }

    public int takePointsButDontGoNegative(
            String username,
            int pointsToTake,
            UUID householdId) throws SQLException {

        if (username == null || username.isBlank()) {
            return 0;
        }

        if (pointsToTake <= 0) {
            return 0;
        }

        String cleanUsername = username.trim();

        int currentPoints = pointsBankDAO.getPoints(cleanUsername, householdId);
        int pointsActuallyTaken = Math.min(currentPoints, pointsToTake);

        if (pointsActuallyTaken > 0) {
            pointsBankDAO.deductPoints(
                    cleanUsername,
                    pointsActuallyTaken,
                    householdId);
        }

        return pointsActuallyTaken;
    }

    public void parentAddsPoints(
            String username,
            int points,
            String reason,
            UUID householdId) throws SQLException {

        if (points <= 0) {
            return;
        }

        String cleanUsername = username.trim();

        pointsBankDAO.awardPoints(cleanUsername, points, householdId);

        savePointTransaction(
                cleanUsername,
                points,
                reason,
                "PARENT_ADJUSTMENT",
                householdId);
    }

    public int parentTakesPoints(
            String username,
            int points,
            String reason,
            UUID householdId) throws SQLException {

        int pointsTaken = takePointsButDontGoNegative(
                username,
                points,
                householdId);

        if (pointsTaken > 0) {
            savePointTransaction(
                    username.trim(),
                    -pointsTaken,
                    reason,
                    "PARENT_ADJUSTMENT",
                    householdId);
        }

        return pointsTaken;
    }

    public PointAdjustmentResult parentAdjustsPoints(
            PointAdjustmentRequest request,
            UUID householdId) throws SQLException {

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

        String cleanUsername = username.trim();
        String cleanAction = action.trim().toUpperCase();

        int oldPoints = pointsBankDAO.getPoints(cleanUsername, householdId);
        int changeAmount;

        if ("ADD".equals(cleanAction)) {
            parentAddsPoints(
                    cleanUsername,
                    points,
                    reason,
                    householdId);

            changeAmount = points;
        } else if ("REMOVE".equals(cleanAction)) {
            int pointsTaken = parentTakesPoints(
                    cleanUsername,
                    points,
                    reason,
                    householdId);

            changeAmount = -pointsTaken;
        } else {
            throw new IllegalArgumentException("Action must be ADD or REMOVE.");
        }

        int newPoints = pointsBankDAO.getPoints(cleanUsername, householdId);

        return new PointAdjustmentResult(
                cleanUsername,
                cleanAction,
                oldPoints,
                changeAmount,
                newPoints,
                reason);
    }

    public List<PointTransaction> getRecentTransactions(UUID householdId)
            throws SQLException {

        if (pointTransactionRepository == null) {
            return List.of();
        }

        return pointTransactionRepository.findRecentTransactions(
                25,
                householdId);
    }

    public List<PointTransaction> getRecentTransactionsForKid(
            String username,
            UUID householdId) throws SQLException {

        if (pointTransactionRepository == null) {
            return List.of();
        }

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }

        return pointTransactionRepository.findRecentTransactionsForKid(
                username.trim(),
                25,
                householdId);
    }

    private void savePointTransaction(
            String username,
            int changeAmount,
            String reason,
            String source,
            UUID householdId) throws SQLException {

        if (pointTransactionRepository == null) {
            return;
        }

        pointTransactionRepository.saveTransaction(
                username,
                changeAmount,
                reason,
                source,
                householdId);
    }

    private String cleanReason(String reason) {
        if (reason == null || reason.isBlank()) {
            return "Parent adjustment";
        }

        return reason.trim();
    }
}