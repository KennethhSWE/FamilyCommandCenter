package familycommandcenter.points;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class PointTransactionRepository {

    private final DataSource dataSource;

    public PointTransactionRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS point_transactions (
                    id SERIAL PRIMARY KEY,
                    user_name TEXT NOT NULL,
                    change_amount INT NOT NULL,
                    reason TEXT,
                    source TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    household_id UUID NOT NULL
                )
                """;

        String addHouseholdColumn = """
                ALTER TABLE point_transactions
                ADD COLUMN IF NOT EXISTS household_id UUID
                """;

        String removeUnsafeOldTransactions = """
                DELETE FROM point_transactions
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE point_transactions
                ALTER COLUMN household_id SET NOT NULL
                """;

        String createHouseholdIndex = """
                CREATE INDEX IF NOT EXISTS idx_point_transactions_household_id
                ON point_transactions (household_id)
                """;

        try (Connection connection = dataSource.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(createTable)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Old point history without household_id is unsafe in a multi-family app.
             * Since this is still development data, delete it instead of showing
             * one family's point history to another family.
             */
            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeOldTransactions)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(requireHouseholdColumn)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(createHouseholdIndex)) {
                ps.executeUpdate();
            }
        }
    }

    public void saveTransaction(
            String username,
            int changeAmount,
            String reason,
            String source,
            UUID householdId) throws SQLException {

        String sql = """
                INSERT INTO point_transactions (
                    user_name,
                    change_amount,
                    reason,
                    source,
                    household_id
                )
                VALUES (?, ?, ?, ?, ?)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setInt(2, changeAmount);
            ps.setString(3, reason);
            ps.setString(4, source);
            ps.setObject(5, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    public List<PointTransaction> findRecentTransactions(
            int limit,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT
                    id,
                    user_name,
                    change_amount,
                    reason,
                    source,
                    created_at
                FROM point_transactions
                WHERE household_id = ?
                ORDER BY created_at DESC, id DESC
                LIMIT ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);
            ps.setInt(2, limit);

            try (ResultSet rs = ps.executeQuery()) {
                List<PointTransaction> transactions = new ArrayList<>();

                while (rs.next()) {
                    transactions.add(mapTransaction(rs));
                }

                return transactions;
            }
        }
    }

    public List<PointTransaction> findRecentTransactionsForKid(
            String username,
            int limit,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT
                    id,
                    user_name,
                    change_amount,
                    reason,
                    source,
                    created_at
                FROM point_transactions
                WHERE user_name = ?
                AND household_id = ?
                ORDER BY created_at DESC, id DESC
                LIMIT ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setObject(2, householdId, Types.OTHER);
            ps.setInt(3, limit);

            try (ResultSet rs = ps.executeQuery()) {
                List<PointTransaction> transactions = new ArrayList<>();

                while (rs.next()) {
                    transactions.add(mapTransaction(rs));
                }

                return transactions;
            }
        }
    }

    private PointTransaction mapTransaction(ResultSet rs) throws SQLException {
        return new PointTransaction(
                rs.getInt("id"),
                rs.getString("user_name"),
                rs.getInt("change_amount"),
                rs.getString("reason"),
                rs.getString("source"),
                rs.getTimestamp("created_at").toString());
    }
}