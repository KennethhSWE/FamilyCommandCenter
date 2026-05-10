package familycommandcenter.calendar;

import java.time.LocalDate;

public class CreateCalendarEntryRequest {

    private String title;
    private CalendarEntryType type;
    private LocalDate entryDate;

    public CreateCalendarEntryRequest() {
        // Needed for JSON mapping
    }

    public String getTitle() {
        return title;
    }

    public CalendarEntryType getType() {
        return type;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setType(CalendarEntryType type) {
        this.type = type;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }
}