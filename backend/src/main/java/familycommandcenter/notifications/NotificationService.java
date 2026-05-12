package familycommandcenter.notifications;

import java.sql.SQLException;
import java.util.List;
import java.util.UUID;

public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void makeSureTableExists() throws SQLException {
        notificationRepository.makeSureTableExists();
    }

    public void parentNeedsToCheckChore(
            String message,
            UUID householdId) throws SQLException {

        notificationRepository.saveNotification(
                NotificationType.CHORE_APPROVAL_NEEDED,
                "Chore needs approval",
                message,
                householdId);
    }

    public void parentNeedsToApproveReward(
            String message,
            UUID householdId) throws SQLException {

        notificationRepository.saveNotification(
                NotificationType.REWARD_APPROVAL_NEEDED,
                "Reward needs approval",
                message,
                householdId);
    }

    public void parentHasRewardSuggestion(
            String message,
            UUID householdId) throws SQLException {

        notificationRepository.saveNotification(
                NotificationType.REWARD_SUGGESTION_CREATED,
                "New reward suggestion",
                message,
                householdId);
    }

    public void parentNeedsToCheckUnevenTrade(
            String message,
            UUID householdId) throws SQLException {

        notificationRepository.saveNotification(
                NotificationType.UNEVEN_TRADE_APPROVAL_NEEDED,
                "Chore trade needs approval",
                message,
                householdId);
    }

    public void billIsComingDue(
            String message,
            UUID householdId) throws SQLException {

        notificationRepository.saveNotification(
                NotificationType.BILL_DUE_SOON,
                "Bill coming due",
                message,
                householdId);
    }

    public List<NotificationMessage> getUnreadNotifications(UUID householdId)
            throws SQLException {

        return notificationRepository.findUnreadNotifications(householdId);
    }

    public List<NotificationMessage> getRecentNotifications(UUID householdId)
            throws SQLException {

        return notificationRepository.findRecentNotifications(householdId);
    }

    public int getUnreadCount(UUID householdId) throws SQLException {
        return notificationRepository.countUnreadNotifications(householdId);
    }

    public boolean markRead(
            int notificationId,
            UUID householdId) throws SQLException {

        return notificationRepository.markRead(notificationId, householdId);
    }

    public void markAllRead(UUID householdId) throws SQLException {
        notificationRepository.markAllRead(householdId);
    }
}