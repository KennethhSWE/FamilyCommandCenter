package familycommandcenter.routes;

import familycommandcenter.notifications.NotificationService;
import familycommandcenter.util.AuthContext;
import io.javalin.Javalin;

import java.util.Map;
import java.util.UUID;

public final class NotificationRoutes {

    private NotificationRoutes() {
        // Utility class
    }

    public static void register(Javalin api, NotificationService notificationService) {

        api.get("/api/notifications/unread", ctx -> {
            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ctx.json(notificationService.getUnreadNotifications(householdId));
        });

        api.get("/api/notifications/recent", ctx -> {
            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ctx.json(notificationService.getRecentNotifications(householdId));
        });

        api.get("/api/notifications/unread-count", ctx -> {
            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ctx.json(Map.of(
                    "unreadCount",
                    notificationService.getUnreadCount(householdId)));
        });

        api.patch("/api/notifications/{notificationId}/read", ctx -> {
            UUID householdId = AuthContext.requireHouseholdId(ctx);
            int notificationId = Integer.parseInt(ctx.pathParam("notificationId"));

            boolean markedRead = notificationService.markRead(
                    notificationId,
                    householdId);

            if (markedRead) {
                ctx.status(200).json(Map.of("read", true));
            } else {
                ctx.status(404).result("Notification not found or already read");
            }
        });

        api.patch("/api/notifications/read-all", ctx -> {
            UUID householdId = AuthContext.requireHouseholdId(ctx);

            notificationService.markAllRead(householdId);

            ctx.status(200).json(Map.of("readAll", true));
        });
    }
}