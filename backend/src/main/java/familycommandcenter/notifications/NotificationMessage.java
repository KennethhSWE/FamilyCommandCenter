package familycommandcenter.notifications;

import java.time.LocalDateTime;

public class NotificationMessage {

    private int id;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public NotificationMessage() {
        // Needed for JSON mapping
    }

    public NotificationMessage(
            int id,
            NotificationType type,
            String title,
            String message,
            boolean read,
            LocalDateTime createdAt,
            LocalDateTime readAt) {

        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.read = read;
        this.createdAt = createdAt;
        this.readAt = readAt;
    }

    public int getId() {
        return id;
    }

    public NotificationType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
}