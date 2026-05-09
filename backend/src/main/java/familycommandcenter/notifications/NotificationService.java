package familycommandcenter.notifications;

import java.sql.SQLException;
import java.util.List;

public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void makeSureTableExists() throws SQLException {
        notificationRepository.makeSureTableExists();
    }

    public void parentNeedsToCheckChore(String message) throws SQLException {
        notificationRepository.saveNotification(
                NotificationType.CHORE_APPROVAL_NEEDED,
                "Chore needs approval",
                message);
    }

    public void parentNeedsToApproveReward(String message) throws SQLException {
        notificationRepository.saveNotification(
                NotificationType.REWARD_APPROVAL_NEEDED,
                "Reward needs approval",
                message);
    }

    public void parentHasRewardSuggestion(String message) throws SQLException {
        notificationRepository.saveNotification(
                NotificationType.REWARD_SUGGESTION_CREATED,
                "New reward suggestion",
                message);
    }

    public void parentNeedsToCheckUnevenTrade(String message) throws SQLException {
        notificationRepository.saveNotification(
                NotificationType.UNEVEN_TRADE_APPROVAL_NEEDED,
                "Chore trade needs approval",
                message);
    }

    public void billIsComingDue(String message) throws SQLException {
        notificationRepository.saveNotification(
                NotificationType.BILL_DUE_SOON,
                "Bill coming due",
                message);
    }

    public List<NotificationMessage> getUnreadNotifications() throws SQLException {
        return notificationRepository.findUnreadNotifications();
    }

    public List<NotificationMessage> getRecentNotifications() throws SQLException {
        return notificationRepository.findRecentNotifications();
    }

    public int getUnreadCount() throws SQLException {
        return notificationRepository.countUnreadNotifications();
    }

    public boolean markRead(int notificationId) throws SQLException {
        return notificationRepository.markRead(notificationId);
    }

    public void markAllRead() throws SQLException {
        notificationRepository.markAllRead();
    }
}