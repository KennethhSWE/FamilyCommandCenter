package familycommandcenter.model;

import javax.sql.DataSource;
import java.sql.*;

/**
 * DAO for the <code>points_bank</code> table. Handles the running
 * total of points each kid has earned or spent.
 */
public final class PointsBankDAO {

    private final DataSource ds;

    public PointsBankDAO(DataSource ds) {
        this.ds = ds;
    }

    /* ───────────────────────────── queries ───────────────────────────── */

    /** Returns current points for {@code username} or <code>0</code> if no row yet. */
    public int getPoints(String username) throws SQLException {
        final String sql = "SELECT total_points FROM points_bank WHERE user_name = ?";

        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }

    /* ───────────────────────────── updates ───────────────────────────── */

    /**
     * Adds <code>pointsToAdd</code> (can be negative) to the user’s running total.
     * Automatically inserts the row if it doesn’t exist.
     */
    public void addPoints(String username, int pointsToAdd) throws SQLException {
        final String sql = """
            INSERT INTO points_bank (user_name, total_points)
                 VALUES (?, ?)
            ON CONFLICT (user_name) DO UPDATE
                SET total_points = points_bank.total_points + EXCLUDED.total_points
        """;

        try (Connection c = ds.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setInt   (2, pointsToAdd);
            ps.executeUpdate();
        }
    }

    /** Convenience wrapper for clarity when awarding points. */
    public void awardPoints(String username, int points) throws SQLException {
        addPoints(username, points);
    }

    /** Convenience wrapper for clarity when deducting points. */
    public void deductPoints(String username, int points) throws SQLException {
        addPoints(username, -points);
    }
}

