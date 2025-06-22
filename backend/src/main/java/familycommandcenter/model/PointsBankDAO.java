package familycommandcenter.model;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class PointsBankDAO {
    private final Connection conn;

    public PointsBankDAO(Connection conn) {
        this.conn = conn;
    }

    public int getPoints(String username) throws SQLException {
        String sql = "SELECT total_points FROM points_bank WHERE user_name = ?";
        System.out.println("DEBUG: Getting points for username: " + username);

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            System.out.println("DEBUG: Executed query on live DB.");

            if (rs.next()) {
                return rs.getInt("total_points");
            } else {
                return 0;
            }
        }
    }

    public void awardPoints(String username, int pointsToAdd) throws SQLException {
        String insertOrUpdate = """
            INSERT INTO points_bank (user_name, total_points)
            VALUES (?, ?)
            ON CONFLICT (user_name) DO UPDATE
            SET total_points = points_bank.total_points + EXCLUDED.total_points;
        """;

        try (PreparedStatement stmt = conn.prepareStatement(insertOrUpdate)) {
            stmt.setString(1, username);
            stmt.setInt(2, pointsToAdd);
            stmt.executeUpdate();
        }
    }

    public void deductPoints(String username, int pointsToDeduct) throws SQLException {
        String sql = "UPDATE points_bank SET total_points = total_points - ? WHERE user_name = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, pointsToDeduct);
            stmt.setString(2, username);
            stmt.executeUpdate();
        }
    }
}
