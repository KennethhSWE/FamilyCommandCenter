package familycommandcenter.points;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class PointTransactionRepository {

    private final DataSource dataSource;

    public PointTransactionRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String sql = """
                CREATE TABLE IF NOT EXISTS point_transactions (
                    id SERIAL PRIMARY KEY,
                    user_name TEXT NOT NULL,
                    change_amount INT NOT NULL,
                    reason TEXT,
                    source TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.executeUpdate();
        }
    }

    public void saveTransaction(
            String username,
            int changeAmount,
            String reason,
            String source) throws SQLException {

        String sql = """
                INSERT INTO point_transactions (
                    user_name,
                    change_amount,
                    reason,
                    source
                )
                VALUES (?, ?, ?, ?)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setInt(2, changeAmount);
            ps.setString(3, reason);
            ps.setString(4, source);
            ps.executeUpdate();
        }
    }
}