package familycommandcenter.rewards;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Optional;

public class RewardSuggestionRepository {

    private final DataSource dataSource;

    public RewardSuggestionRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String sql = """
                CREATE TABLE IF NOT EXISTS reward_suggestions (
                    id SERIAL PRIMARY KEY,
                    suggested_by TEXT NOT NULL,
                    name VARCHAR(150) NOT NULL,
                    cost INT NOT NULL,
                    reason TEXT,
                    status VARCHAR(30) NOT NULL DEFAULT 'WAITING',
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at TIMESTAMP NULL
                )
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.executeUpdate();
        }
    }

    public RewardSuggestion createSuggestion(SuggestRewardRequest request)
            throws SQLException {

        String sql = """
                INSERT INTO reward_suggestions (
                    suggested_by,
                    name,
                    cost,
                    reason,
                    status
                )
                VALUES (?, ?, ?, ?, 'WAITING')
                RETURNING *
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, request.getUsername().trim());
            ps.setString(2, request.getName().trim());
            ps.setInt(3, request.getCost());
            ps.setString(4, cleanReason(request.getReason()));

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapSuggestion(rs);
                }

                throw new SQLException("Reward suggestion was not created");
            }
        }
    }

    public Optional<RewardSuggestion> findWaitingById(int suggestionId)
            throws SQLException {

        String sql = """
                SELECT *
                FROM reward_suggestions
                WHERE id = ?
                AND status = 'WAITING'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, suggestionId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapSuggestion(rs));
                }

                return Optional.empty();
            }
        }
    }

    public boolean markApproved(int suggestionId) throws SQLException {
        return updateStatus(suggestionId, "APPROVED");
    }

    public boolean markDenied(int suggestionId) throws SQLException {
        return updateStatus(suggestionId, "DENIED");
    }

    private boolean updateStatus(int suggestionId, String status)
            throws SQLException {

        String sql = """
                UPDATE reward_suggestions
                SET status = ?,
                    reviewed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND status = 'WAITING'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, status);
            ps.setInt(2, suggestionId);

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