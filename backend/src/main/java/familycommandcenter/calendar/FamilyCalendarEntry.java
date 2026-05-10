package familycommandcenter.calendar;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class FamilyCalendarEntry {

    private int id;
    private String title;
    private CalendarEntryType type;
    private LocalDate entryDate;
    private boolean paid;
    private LocalDateTime createdAt;

    public FamilyCalendarEntry() {
        // Needed for JSON mapping
    }

    public FamilyCalendarEntry(
            int id,
            String title,
            CalendarEntryType type,
            LocalDate entryDate,
            boolean paid,
            LocalDateTime createdAt) {

        this.id = id;
        this.title = title;
        this.type = type;
        this.entryDate = entryDate;
        this.paid = paid;
        this.createdAt = createdAt;
    }

    public int getId() {
        return id;
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

    public boolean isPaid() {
        return paid;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(int id) {
        this.id = id;
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

    public void setPaid(boolean paid) {
        this.paid = paid;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}