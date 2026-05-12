package familycommandcenter.notifications;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class NotificationRepository {

    private final DataSource dataSource;

    public NotificationRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS notification_messages (
                    id SERIAL PRIMARY KEY,
                    type VARCHAR(60) NOT NULL,
                    title VARCHAR(150) NOT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    read_at TIMESTAMP NULL,
                    household_id UUID NOT NULL
                )
                """;

        String addHouseholdColumn = """
                ALTER TABLE notification_messages
                ADD COLUMN IF NOT EXISTS household_id UUID
                """;

        String removeUnsafeOldNotifications = """
                DELETE FROM notification_messages
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE notification_messages
                ALTER COLUMN household_id SET NOT NULL
                """;

        String createHouseholdIndex = """
                CREATE INDEX IF NOT EXISTS idx_notification_messages_household_id
                ON notification_messages (household_id)
                """;

        try (Connection connection = dataSource.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(createTable)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Old notifications without household_id are unsafe in a multi-family app.
             * Since this is still development data, delete them instead of exposing
             * them across households.
             */
            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeOldNotifications)) {
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

    public void saveNotification(
            NotificationType type,
            String title,
            String message,
            UUID householdId) throws SQLException {

        String sql = """
                INSERT INTO notification_messages (
                    type,
                    title,
                    message,
                    is_read,
                    household_id
                )
                VALUES (?, ?, ?, FALSE, ?)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, type.name());
            ps.setString(2, title);
            ps.setString(3, message);
            ps.setObject(4, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    public List<NotificationMessage> findUnreadNotifications(UUID householdId)
            throws SQLException {

        String sql = """
                SELECT *
                FROM notification_messages
                WHERE is_read = FALSE
                AND household_id = ?
                ORDER BY created_at DESC
                """;

        return findNotifications(sql, householdId);
    }

    public List<NotificationMessage> findRecentNotifications(UUID householdId)
            throws SQLException {

        String sql = """
                SELECT *
                FROM notification_messages
                WHERE household_id = ?
                ORDER BY created_at DESC
                LIMIT 50
                """;

        return findNotifications(sql, householdId);
    }

    public int countUnreadNotifications(UUID householdId) throws SQLException {
        String sql = """
                SELECT COUNT(*)
                FROM notification_messages
                WHERE is_read = FALSE
                AND household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }

    public boolean markRead(
            int notificationId,
            UUID householdId) throws SQLException {

        String sql = """
                UPDATE notification_messages
                SET is_read = TRUE,
                    read_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND household_id = ?
                AND is_read = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, notificationId);
            ps.setObject(2, householdId, Types.OTHER);

            return ps.executeUpdate() == 1;
        }
    }

    public void markAllRead(UUID householdId) throws SQLException {
        String sql = """
                UPDATE notification_messages
                SET is_read = TRUE,
                    read_at = CURRENT_TIMESTAMP
                WHERE is_read = FALSE
                AND household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    private List<NotificationMessage> findNotifications(
            String sql,
            UUID householdId) throws SQLException {

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                List<NotificationMessage> notifications = new ArrayList<>();

                while (rs.next()) {
                    notifications.add(mapNotification(rs));
                }

                return notifications;
            }
        }
    }

    private NotificationMessage mapNotification(ResultSet rs) throws SQLException {
        Timestamp readAt = rs.getTimestamp("read_at");

        return new NotificationMessage(
                rs.getInt("id"),
                NotificationType.valueOf(rs.getString("type")),
                rs.getString("title"),
                rs.getString("message"),
                rs.getBoolean("is_read"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                readAt != null ? readAt.toLocalDateTime() : null);
    }
}