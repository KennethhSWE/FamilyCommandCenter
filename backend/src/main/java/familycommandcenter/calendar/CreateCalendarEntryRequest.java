package familycommandcenter.calendar;

import java.time.LocalDate;

import java.math.BigDecimal;

public class CreateCalendarEntryRequest {

    private String title;
    private CalendarEntryType type;
    private LocalDate entryDate;
    private BigDecimal amount;
    private String notes;

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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}