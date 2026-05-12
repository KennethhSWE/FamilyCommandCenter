package familycommandcenter.rewards;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.Optional;
import java.util.UUID;

public class RewardSuggestionRepository {

    private final DataSource dataSource;

    public RewardSuggestionRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS reward_suggestions (
                    id SERIAL PRIMARY KEY,
                    suggested_by TEXT NOT NULL,
                    name VARCHAR(150) NOT NULL,
                    cost INT NOT NULL,
                    reason TEXT,
                    status VARCHAR(30) NOT NULL DEFAULT 'WAITING',
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at TIMESTAMP NULL,
                    household_id UUID NOT NULL
                )
                """;

        String addHouseholdColumn = """
                ALTER TABLE reward_suggestions
                ADD COLUMN IF NOT EXISTS household_id UUID
                """;

        String removeUnsafeOldSuggestions = """
                DELETE FROM reward_suggestions
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE reward_suggestions
                ALTER COLUMN household_id SET NOT NULL
                """;

        String createHouseholdIndex = """
                CREATE INDEX IF NOT EXISTS idx_reward_suggestions_household_id
                ON reward_suggestions (household_id)
                """;

        try (Connection connection = dataSource.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(createTable)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Old suggestions without household_id are unsafe in a multi-family app.
             * Since this is still development data, delete them instead of exposing
             * them across households.
             */
            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeOldSuggestions)) {
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

    public RewardSuggestion createSuggestion(
            SuggestRewardRequest request,
            UUID householdId) throws SQLException {

        String sql = """
                INSERT INTO reward_suggestions (
                    suggested_by,
                    name,
                    cost,
                    reason,
                    status,
                    household_id
                )
                VALUES (?, ?, ?, ?, 'WAITING', ?)
                RETURNING *
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, request.getUsername().trim());
            ps.setString(2, request.getName().trim());
            ps.setInt(3, request.getCost());
            ps.setString(4, cleanReason(request.getReason()));
            ps.setObject(5, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapSuggestion(rs);
                }

                throw new SQLException("Reward suggestion was not created");
            }
        }
    }

    public Optional<RewardSuggestion> findWaitingById(
            int suggestionId,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT *
                FROM reward_suggestions
                WHERE id = ?
                AND household_id = ?
                AND status = 'WAITING'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, suggestionId);
            ps.setObject(2, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapSuggestion(rs));
                }

                return Optional.empty();
            }
        }
    }

    public boolean markApproved(int suggestionId, UUID householdId)
            throws SQLException {
        return updateStatus(suggestionId, householdId, "APPROVED");
    }

    public boolean markDenied(int suggestionId, UUID householdId)
            throws SQLException {
        return updateStatus(suggestionId, householdId, "DENIED");
    }

    private boolean updateStatus(
            int suggestionId,
            UUID householdId,
            String status) throws SQLException {

        String sql = """
                UPDATE reward_suggestions
                SET status = ?,
                    reviewed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND household_id = ?
                AND status = 'WAITING'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, status);
            ps.setInt(2, suggestionId);
            ps.setObject(3, householdId, Types.OTHER);

            return ps.executeUpdate() == 1;
        }
    }

    private RewardSuggestion mapSuggestion(ResultSet rs) throws SQLException {
        Timestamp reviewedAt = rs.getTimestamp("reviewed_at");

        return new RewardSuggestion(
                rs.getInt("id"),
                rs.getString("suggested_by"),
                rs.getString("name"),
                rs.getInt("cost"),
                rs.getString("reason"),
                rs.getString("status"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                reviewedAt != null ? reviewedAt.toLocalDateTime() : null);
    }

    private String cleanReason(String reason) {
        if (reason == null || reason.isBlank()) {
            return null;
        }

        return reason.trim();
    }
}