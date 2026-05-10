package familycommandcenter.calendar;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

public class CalendarService {

    private final CalendarRepository calendarRepository;

    public CalendarService(CalendarRepository calendarRepository) {
        this.calendarRepository = calendarRepository;
    }

    public void makeSureTableExists() throws SQLException {
        calendarRepository.makeSureTableExists();
    }

    public List<FamilyCalendarEntry> getFamilyCalendar() throws SQLException {
        return calendarRepository.findAllEntries();
    }

    public FamilyCalendarEntry addCalendarEntry(CreateCalendarEntryRequest request)
            throws SQLException {

        validateCalendarEntry(request);
        return calendarRepository.saveEntry(request);
    }

    public boolean toggleBillPaid(int entryId) throws SQLException {
        return calendarRepository.toggleBillPaid(entryId);
    }

    public boolean deleteCalendarEntry(int entryId) throws SQLException {
        return calendarRepository.deleteEntry(entryId);
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