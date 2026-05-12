package familycommandcenter.rewards;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class RewardRepository {

    private final DataSource dataSource;

    public RewardRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureRewardTableIsReady() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS rewards (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    cost INT NOT NULL,
                    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
                    household_id UUID NOT NULL
                )
                """;

        String addHouseholdColumn = """
                ALTER TABLE rewards
                ADD COLUMN IF NOT EXISTS household_id UUID
                """;

        String removeUnsafeGlobalRewards = """
                DELETE FROM rewards
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE rewards
                ALTER COLUMN household_id SET NOT NULL
                """;

        String createHouseholdIndex = """
                CREATE INDEX IF NOT EXISTS idx_rewards_household_id
                ON rewards (household_id)
                """;

        try (Connection connection = dataSource.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(createTable)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Any old rewards without household_id are unsafe in a multi-family app.
             * They are deleted instead of being shown to every household.
             */
            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeGlobalRewards)) {
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

    public void saveReward(CreateRewardRequest reward, UUID householdId) throws SQLException {
        String sql = """
                INSERT INTO rewards (
                    name,
                    cost,
                    requires_approval,
                    household_id
                )
                VALUES (?, ?, ?, ?)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, reward.getName().trim());
            ps.setInt(2, reward.getCost());
            ps.setBoolean(3, reward.needsParentApproval());
            ps.setObject(4, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    public List<RewardCard> findAllRewards(UUID householdId) throws SQLException {
        String sql = """
                SELECT *
                FROM rewards
                WHERE household_id = ?
                ORDER BY cost ASC, name ASC
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                List<RewardCard> rewards = new ArrayList<>();

                while (rs.next()) {
                    rewards.add(mapReward(rs));
                }

                return rewards;
            }
        }
    }

    public Optional<RewardCard> findById(int rewardId, UUID householdId) throws SQLException {
        String sql = """
                SELECT *
                FROM rewards
                WHERE id = ?
                AND household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, rewardId);
            ps.setObject(2, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapReward(rs));
                }

                return Optional.empty();
            }
        }
    }

    public void deleteReward(int rewardId, UUID householdId) throws SQLException {
        String sql = """
                DELETE FROM rewards
                WHERE id = ?
                AND household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, rewardId);
            ps.setObject(2, householdId, Types.OTHER);

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