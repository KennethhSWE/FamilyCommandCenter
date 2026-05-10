package familycommandcenter.routes;

import familycommandcenter.calendar.CalendarService;
import familycommandcenter.calendar.CreateCalendarEntryRequest;
import io.javalin.Javalin;

import java.util.Map;

public final class CalendarRoutes {

    private CalendarRoutes() {
        // Utility class
    }

    public static void register(Javalin api, CalendarService calendarService) {

        api.get("/api/calendar/entries", ctx -> ctx.json(calendarService.getFamilyCalendar()));

        api.post("/api/calendar/entries", ctx -> {
            try {
                CreateCalendarEntryRequest request = ctx.bodyAsClass(CreateCalendarEntryRequest.class);

                ctx.status(201).json(calendarService.addCalendarEntry(request));
            } catch (IllegalArgumentException e) {
                ctx.status(400).result(e.getMessage());
            }
        });

        api.patch("/api/calendar/entries/{entryId}/toggle-paid", ctx -> {
            int entryId = Integer.parseInt(ctx.pathParam("entryId"));

            boolean updated = calendarService.toggleBillPaid(entryId);

            if (updated) {
                ctx.status(200).json(Map.of("updated", true));
            } else {
                ctx.status(404).result("Bill not found");
            }
        });

        api.delete("/api/calendar/entries/{entryId}", ctx -> {
            int entryId = Integer.parseInt(ctx.pathParam("entryId"));

            boolean deleted = calendarService.deleteCalendarEntry(entryId);

            if (deleted) {
                ctx.status(204);
            } else {
                ctx.status(404).result("Calendar entry not found");
            }
        });
    }
}