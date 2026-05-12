package familycommandcenter.approvals;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class ApprovalQueueRepository {

    private final DataSource dataSource;

    public ApprovalQueueRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS approval_queue (
                    id SERIAL PRIMARY KEY,
                    approval_type VARCHAR(50) NOT NULL,
                    related_record_id INTEGER NOT NULL,
                    status VARCHAR(30) NOT NULL DEFAULT 'WAITING',
                    title VARCHAR(150) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at TIMESTAMP NULL,
                    household_id UUID NOT NULL
                )
                """;

        String addHouseholdColumn = """
                ALTER TABLE approval_queue
                ADD COLUMN IF NOT EXISTS household_id UUID
                """;

        String removeUnsafeOldApprovals = """
                DELETE FROM approval_queue
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE approval_queue
                ALTER COLUMN household_id SET NOT NULL
                """;

        String createHouseholdIndex = """
                CREATE INDEX IF NOT EXISTS idx_approval_queue_household_id
                ON approval_queue (household_id)
                """;

        try (Connection connection = dataSource.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(createTable)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Old approvals without household_id are unsafe in a multi-family app.
             * Since this is still development data, delete them instead of exposing
             * them across households.
             */
            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeOldApprovals)) {
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

    public void addWaitingApproval(
            ApprovalType approvalType,
            int relatedRecordId,
            String title,
            String message,
            UUID householdId) throws SQLException {

        if (waitingApprovalAlreadyExists(
                approvalType,
                relatedRecordId,
                householdId)) {
            return;
        }

        String sql = """
                INSERT INTO approval_queue (
                    approval_type,
                    related_record_id,
                    status,
                    title,
                    message,
                    household_id
                )
                VALUES (?, ?, 'WAITING', ?, ?, ?)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, approvalType.name());
            ps.setInt(2, relatedRecordId);
            ps.setString(3, title);
            ps.setString(4, message);
            ps.setObject(5, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    public List<ApprovalQueueItem> findWaitingApprovals(UUID householdId)
            throws SQLException {

        String sql = """
                SELECT *
                FROM approval_queue
                WHERE status = 'WAITING'
                AND household_id = ?
                ORDER BY created_at ASC
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                List<ApprovalQueueItem> approvals = new ArrayList<>();

                while (rs.next()) {
                    approvals.add(mapApproval(rs));
                }

                return approvals;
            }
        }
    }

    public Optional<ApprovalQueueItem> findById(
            int approvalId,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT *
                FROM approval_queue
                WHERE id = ?
                AND household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, approvalId);
            ps.setObject(2, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapApproval(rs));
                }

                return Optional.empty();
            }
        }
    }

    public void markApproved(int approvalId, UUID householdId)
            throws SQLException {
        updateStatus(approvalId, householdId, ApprovalStatus.APPROVED);
    }

    public void markDenied(int approvalId, UUID householdId)
            throws SQLException {
        updateStatus(approvalId, householdId, ApprovalStatus.DENIED);
    }

    public void markApprovedByRelatedRecord(
            ApprovalType approvalType,
            int relatedRecordId,
            UUID householdId) throws SQLException {

        updateStatusByRelatedRecord(
                approvalType,
                relatedRecordId,
                householdId,
                ApprovalStatus.APPROVED);
    }

    public void markDeniedByRelatedRecord(
            ApprovalType approvalType,
            int relatedRecordId,
            UUID householdId) throws SQLException {

        updateStatusByRelatedRecord(
                approvalType,
                relatedRecordId,
                householdId,
                ApprovalStatus.DENIED);
    }

    private boolean waitingApprovalAlreadyExists(
            ApprovalType approvalType,
            int relatedRecordId,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT 1
                FROM approval_queue
                WHERE approval_type = ?
                AND related_record_id = ?
                AND household_id = ?
                AND status = 'WAITING'
                LIMIT 1
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, approvalType.name());
            ps.setInt(2, relatedRecordId);
            ps.setObject(3, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    private void updateStatus(
            int approvalId,
            UUID householdId,
            ApprovalStatus status) throws SQLException {

        String sql = """
                UPDATE approval_queue
                SET status = ?,
                    reviewed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, status.name());
            ps.setInt(2, approvalId);
            ps.setObject(3, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    private void updateStatusByRelatedRecord(
            ApprovalType approvalType,
            int relatedRecordId,
            UUID householdId,
            ApprovalStatus status) throws SQLException {

        String sql = """
                UPDATE approval_queue
                SET status = ?,
                    reviewed_at = CURRENT_TIMESTAMP
                WHERE approval_type = ?
                AND related_record_id = ?
                AND household_id = ?
                AND status = 'WAITING'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, status.name());
            ps.setString(2, approvalType.name());
            ps.setInt(3, relatedRecordId);
            ps.setObject(4, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    private ApprovalQueueItem mapApproval(ResultSet rs) throws SQLException {
        Timestamp reviewedAt = rs.getTimestamp("reviewed_at");

        return new ApprovalQueueItem(
                rs.getInt("id"),
                ApprovalType.valueOf(rs.getString("approval_type")),
                rs.getInt("related_record_id"),
                ApprovalStatus.valueOf(rs.getString("status")),
                rs.getString("title"),
                rs.getString("message"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                reviewedAt != null ? reviewedAt.toLocalDateTime() : null);
    }
}