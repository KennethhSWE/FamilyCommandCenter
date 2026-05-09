package familycommandcenter.points;

import familycommandcenter.model.PointsBankDAO;

import java.sql.SQLException;

public class PointsService {

    private final PointsBankDAO pointsBankDAO;

    public PointsService(PointsBankDAO pointsBankDAO) {
        this.pointsBankDAO = pointsBankDAO;
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
        }
    }

    public int parentTakesPoints(String username, int points, String reason) throws SQLException {
        return takePointsButDontGoNegative(username, points);
    }
}