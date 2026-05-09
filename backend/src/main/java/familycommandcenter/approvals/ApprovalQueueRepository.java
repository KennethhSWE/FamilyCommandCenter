package familycommandcenter.approvals;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ApprovalQueueRepository {

    private final DataSource dataSource;

    public ApprovalQueueRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String sql = """
                CREATE TABLE IF NOT EXISTS approval_queue (
                    id SERIAL PRIMARY KEY,
                    approval_type VARCHAR(50) NOT NULL,
                    related_record_id INTEGER NOT NULL,
                    status VARCHAR(30) NOT NULL DEFAULT 'WAITING',
                    title VARCHAR(150) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at TIMESTAMP NULL
                )
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.executeUpdate();
        }
    }

    public void addWaitingApproval(
            ApprovalType approvalType,
            int relatedRecordId,
            String title,
            String message) throws SQLException {

        if (waitingApprovalAlreadyExists(approvalType, relatedRecordId)) {
            return;
        }

        String sql = """
                INSERT INTO approval_queue (
                    approval_type,
                    related_record_id,
                    status,
                    title,
                    message
                )
                VALUES (?, ?, 'WAITING', ?, ?)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, approvalType.name());
            ps.setInt(2, relatedRecordId);
            ps.setString(3, title);
            ps.setString(4, message);

            ps.executeUpdate();
        }
    }

    public List<ApprovalQueueItem> findWaitingApprovals() throws SQLException {
        String sql = """
                SELECT *
                FROM approval_queue
                WHERE status = 'WAITING'
                ORDER BY created_at ASC
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            List<ApprovalQueueItem> approvals = new ArrayList<>();

            while (rs.next()) {
                approvals.add(mapApproval(rs));
            }

            return approvals;
        }
    }

    public Optional<ApprovalQueueItem> findById(int approvalId) throws SQLException {
        String sql = """
                SELECT *
                FROM approval_queue
                WHERE id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, approvalId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapApproval(rs));
                }

                return Optional.empty();
            }
        }
    }

    public void markApproved(int approvalId) throws SQLException {
        updateStatus(approvalId, ApprovalStatus.APPROVED);
    }

    public void markDenied(int approvalId) throws SQLException {
        updateStatus(approvalId, ApprovalStatus.DENIED);
    }

    public void markApprovedByRelatedRecord(
            ApprovalType approvalType,
            int relatedRecordId) throws SQLException {

        updateStatusByRelatedRecord(
                approvalType,
                relatedRecordId,
                ApprovalStatus.APPROVED);
    }

    public void markDeniedByRelatedRecord(
            ApprovalType approvalType,
            int relatedRecordId) throws SQLException {

        updateStatusByRelatedRecord(
                approvalType,
                relatedRecordId,
                ApprovalStatus.DENIED);
    }

    private boolean waitingApprovalAlreadyExists(
            ApprovalType approvalType,
            int relatedRecordId) throws SQLException {

        String sql = """
                SELECT 1
                FROM approval_queue
                WHERE approval_type = ?
                AND related_record_id = ?
                AND status = 'WAITING'
                LIMIT 1
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, approvalType.name());
            ps.setInt(2, relatedRecordId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    private void updateStatus(int approvalId, ApprovalStatus status) throws SQLException {
        String sql = """
                UPDATE approval_queue
                SET status = ?,
                    reviewed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, status.name());
            ps.setInt(2, approvalId);

            ps.executeUpdate();
        }
    }

    private void updateStatusByRelatedRecord(
            ApprovalType approvalType,
            int relatedRecordId,
            ApprovalStatus status) throws SQLException {

        String sql = """
                UPDATE approval_queue
                SET status = ?,
                    reviewed_at = CURRENT_TIMESTAMP
                WHERE approval_type = ?
                AND related_record_id = ?
                AND status = 'WAITING'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, status.name());
            ps.setString(2, approvalType.name());
            ps.setInt(3, relatedRecordId);

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