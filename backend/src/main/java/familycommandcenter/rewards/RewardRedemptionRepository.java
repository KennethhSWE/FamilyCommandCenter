package familycommandcenter.rewards;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Optional;
import java.util.UUID;

public class RewardRedemptionRepository {

    private final DataSource dataSource;

    public RewardRedemptionRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS redemptions (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) NOT NULL,
                    reward_id INTEGER NOT NULL,
                    status VARCHAR(40) NOT NULL,
                    redeemed_at TIMESTAMP,
                    household_id UUID NOT NULL
                )
                """;

        String addHouseholdColumn = """
                ALTER TABLE redemptions
                ADD COLUMN IF NOT EXISTS household_id UUID
                """;

        String removeUnsafeOldRedemptions = """
                DELETE FROM redemptions
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE redemptions
                ALTER COLUMN household_id SET NOT NULL
                """;

        String createHouseholdIndex = """
                CREATE INDEX IF NOT EXISTS idx_redemptions_household_id
                ON redemptions (household_id)
                """;

        try (Connection connection = dataSource.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(createTable)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addHouseholdColumn)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeOldRedemptions)) {
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

    public int createRedemption(
            String username,
            int rewardId,
            String status,
            UUID householdId) throws SQLException {

        String sql = """
                INSERT INTO redemptions (
                    username,
                    reward_id,
                    status,
                    redeemed_at,
                    household_id
                )
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
                RETURNING id
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setInt(2, rewardId);
            ps.setString(3, status);
            ps.setObject(4, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }

                throw new SQLException("Redemption was not created");
            }
        }
    }

    public Optional<RewardRedemptionCard> findPendingRedemption(
            int redemptionId,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT *
                FROM redemptions
                WHERE id = ?
                AND household_id = ?
                AND status = 'WAITING_FOR_PARENT'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, redemptionId);
            ps.setObject(2, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRedemption(rs));
                }

                return Optional.empty();
            }
        }
    }

    public boolean markApproved(
            int redemptionId,
            UUID householdId) throws SQLException {

        String sql = """
                UPDATE redemptions
                SET status = 'APPROVED',
                    redeemed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND household_id = ?
                AND status = 'WAITING_FOR_PARENT'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, redemptionId);
            ps.setObject(2, householdId, Types.OTHER);

            return ps.executeUpdate() == 1;
        }
    }

    public boolean markDenied(
            int redemptionId,
            UUID householdId) throws SQLException {

        String sql = """
                UPDATE redemptions
                SET status = 'DENIED',
                    redeemed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND household_id = ?
                AND status = 'WAITING_FOR_PARENT'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, redemptionId);
            ps.setObject(2, householdId, Types.OTHER);

            return ps.executeUpdate() == 1;
        }
    }

    private RewardRedemptionCard mapRedemption(ResultSet rs) throws SQLException {
        return new RewardRedemptionCard(
                rs.getInt("id"),
                rs.getString("username"),
                rs.getInt("reward_id"),
                rs.getString("status"),
                rs.getTimestamp("redeemed_at") != null
                        ? rs.getTimestamp("redeemed_at").toLocalDateTime()
                        : null);
    }
}