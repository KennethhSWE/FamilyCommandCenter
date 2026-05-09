package familycommandcenter.rewards;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class RewardRepository {

    private final DataSource dataSource;

    public RewardRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void saveReward(CreateRewardRequest reward) throws SQLException {
        String sql = """
                INSERT INTO rewards (name, cost, requires_approval)
                VALUES (?, ?, ?)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, reward.getName());
            ps.setInt(2, reward.getCost());
            ps.setBoolean(3, reward.needsParentApproval());

            ps.executeUpdate();
        }
    }

    public List<RewardCard> findAllRewards() throws SQLException {
        String sql = """
                SELECT *
                FROM rewards
                ORDER BY cost ASC, name ASC
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            List<RewardCard> rewards = new ArrayList<>();

            while (rs.next()) {
                rewards.add(mapReward(rs));
            }

            return rewards;
        }
    }

    public Optional<RewardCard> findById(int rewardId) throws SQLException {
        String sql = """
                SELECT *
                FROM rewards
                WHERE id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, rewardId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapReward(rs));
                }

                return Optional.empty();
            }
        }
    }

    public void deleteReward(int rewardId) throws SQLException {
        String sql = """
                DELETE FROM rewards
                WHERE id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, rewardId);
            ps.executeUpdate();
        }
    }

    private RewardCard mapReward(ResultSet rs) throws SQLException {
        return new RewardCard(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getInt("cost"),
                rs.getBoolean("requires_approval"));
    }
}