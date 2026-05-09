package familycommandcenter.notifications;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class NotificationRepository {

    private final DataSource dataSource;

    public NotificationRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String sql = """
                CREATE TABLE IF NOT EXISTS notification_messages (
                    id SERIAL PRIMARY KEY,
                    type VARCHAR(60) NOT NULL,
                    title VARCHAR(150) NOT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    read_at TIMESTAMP NULL
                )
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.executeUpdate();
        }
    }

    public void saveNotification(
            NotificationType type,
            String title,
            String message) throws SQLException {

        String sql = """
                INSERT INTO notification_messages (
                    type,
                    title,
                    message,
                    is_read
                )
                VALUES (?, ?, ?, FALSE)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, type.name());
            ps.setString(2, title);
            ps.setString(3, message);

            ps.executeUpdate();
        }
    }

    public List<NotificationMessage> findUnreadNotifications() throws SQLException {
        String sql = """
                SELECT *
                FROM notification_messages
                WHERE is_read = FALSE
                ORDER BY created_at DESC
                """;

        return findNotifications(sql);
    }

    public List<NotificationMessage> findRecentNotifications() throws SQLException {
        String sql = """
                SELECT *
                FROM notification_messages
                ORDER BY created_at DESC
                LIMIT 50
                """;

        return findNotifications(sql);
    }

    public int countUnreadNotifications() throws SQLException {
        String sql = """
                SELECT COUNT(*)
                FROM notification_messages
                WHERE is_read = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    public boolean markRead(int notificationId) throws SQLException {
        String sql = """
                UPDATE notification_messages
                SET is_read = TRUE,
                    read_at = CURRENT_TIMESTAMP
                WHERE id = ?
                AND is_read = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, notificationId);
            return ps.executeUpdate() == 1;
        }
    }

    public void markAllRead() throws SQLException {
        String sql = """
                UPDATE notification_messages
                SET is_read = TRUE,
                    read_at = CURRENT_TIMESTAMP
                WHERE is_read = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.executeUpdate();
        }
    }

    private List<NotificationMessage> findNotifications(String sql)
            throws SQLException {

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            List<NotificationMessage> notifications = new ArrayList<>();

            while (rs.next()) {
                notifications.add(mapNotification(rs));
            }

            return notifications;
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