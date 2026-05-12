package familycommandcenter.calendar;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class FamilyCalendarEntry {

    private int id;
    private String title;
    private CalendarEntryType type;
    private LocalDate entryDate;
    private boolean paid;
    private BigDecimal amount;
    private String notes;
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
            BigDecimal amount,
            String notes,
            LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.entryDate = entryDate;
        this.paid = paid;
        this.amount = amount;
        this.notes = notes;
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

    public BigDecimal getAmount() {
        return amount;
    }

    public String getNotes() {
        return notes;
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

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}