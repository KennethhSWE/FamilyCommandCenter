package familycommandcenter.routes;

import familycommandcenter.notifications.NotificationService;
import io.javalin.Javalin;

import java.util.Map;

public final class NotificationRoutes {

    private NotificationRoutes() {
        // Utility class
    }

    public static void register(Javalin api, NotificationService notificationService) {

        api.get("/api/notifications/unread", ctx -> ctx.json(notificationService.getUnreadNotifications()));

        api.get("/api/notifications/recent", ctx -> ctx.json(notificationService.getRecentNotifications()));

        api.get("/api/notifications/unread-count", ctx -> ctx.json(Map.of(
                "unreadCount",
                notificationService.getUnreadCount())));

        api.patch("/api/notifications/{notificationId}/read", ctx -> {
            int notificationId = Integer.parseInt(ctx.pathParam("notificationId"));

            boolean markedRead = notificationService.markRead(notificationId);

            if (markedRead) {
                ctx.status(200).json(Map.of("read", true));
            } else {
                ctx.status(404).result("Notification not found or already read");
            }
        });

        api.patch("/api/notifications/read-all", ctx -> {
            notificationService.markAllRead();
            ctx.status(200).json(Map.of("readAll", true));
        });
    }
}