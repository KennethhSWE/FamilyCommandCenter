package familycommandcenter.calendar;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class CalendarService {

    private final CalendarRepository calendarRepository;

    public CalendarService(CalendarRepository calendarRepository) {
        this.calendarRepository = calendarRepository;
    }

    public void makeSureTableExists() throws SQLException {
        calendarRepository.makeSureTableExists();
    }

    public List<FamilyCalendarEntry> getFamilyCalendar(UUID householdId)
            throws SQLException {

        return calendarRepository.findAllEntries(householdId);
    }

    public FamilyCalendarEntry addCalendarEntry(
            CreateCalendarEntryRequest request,
            UUID householdId) throws SQLException {

        validateCalendarEntry(request);

        return calendarRepository.saveEntry(request, householdId);
    }

    public boolean toggleBillPaid(
            int entryId,
            UUID householdId) throws SQLException {

        return calendarRepository.toggleBillPaid(entryId, householdId);
    }

    public boolean deleteCalendarEntry(
            int entryId,
            UUID householdId) throws SQLException {

        return calendarRepository.deleteEntry(entryId, householdId);
    }

    private void validateCalendarEntry(CreateCalendarEntryRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Calendar title is required");
        }

        if (request.getType() == null) {
            throw new IllegalArgumentException("Calendar entry type is required");
        }

        if (request.getEntryDate() == null) {
            request.setEntryDate(LocalDate.now());
        }
    }
}