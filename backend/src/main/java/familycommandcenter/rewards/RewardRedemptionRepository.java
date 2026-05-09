package familycommandcenter.rewards;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public class RewardRedemptionRepository {

    private final DataSource dataSource;

    public RewardRedemptionRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public int createRedemption(String username, int rewardId, String status)
            throws SQLException {

        String sql = """
                INSERT INTO redemptions (username, reward_id, status, redeemed_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                RETURNING id
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setInt(2, rewardId);
            ps.setString(3, status);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }

                throw new SQLException("Redemption was not created");
            }
        }
    }

    public Optional<RewardRedemptionCard> findPendingRedemption(int redemptionId)
            throws SQLException {

        String sql = """
                SELECT *
                FROM redemptions
                WHERE id = ?
                AND status = 'WAITING_FOR_PARENT'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, redemptionId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRedemption(rs));
                }

                return Optional.empty();
            }
        }
    }

    public boolean markApproved(int redemptionId) throws SQLException {
        String sql = """
                UPDATE redemptions
                SET status = 'APPROVED',
                    redeemed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND status = 'WAITING_FOR_PARENT'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, redemptionId);
            return ps.executeUpdate() == 1;
        }
    }

    public boolean markDenied(int redemptionId) throws SQLException {
        String sql = """
                UPDATE redemptions
                SET status = 'DENIED',
                    redeemed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND status = 'WAITING_FOR_PARENT'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, redemptionId);
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