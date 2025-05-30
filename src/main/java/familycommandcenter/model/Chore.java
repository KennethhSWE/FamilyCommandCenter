package familycommandcenter.model;

public class Chore {

    private String title;
    private String description;
    private String assignedToName;
    private String dueDate;
    private boolean completed;

    // No-arg constructor required for Jackson
    public Chore() {}

    public Chore(String title, String description, String assignedToName, String dueDate, boolean completed) {
        this.title = title;
        this.description = description;
        this.assignedToName = assignedToName;
        this.dueDate = dueDate;
        this.completed = completed;
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public String getAssignedToName() {
        return assignedToName;
    }
    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public String getDueDate() {
        return dueDate;
    }
    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public boolean isCompleted() {
        return completed;
    }
    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
    public boolean firstAttempt() {
        // This method is a placeholder for any logic that determines if this is the first attempt at completing the chore.
        // For now, it simply returns false, indicating it's not the first attempt.
        return false;
    }
    public boolean verifiedByParent() {
        // This method is a placeholder for any logic that determines if the chore has been verified by a parent.
        // For now, it simply returns false, indicating it has not been verified.
        return false;
    public int points() {
        // This method is a placeholder for any logic that calculates points for the chore.
        // For now, it simply returns 0, indicating no points are awarded.
        return 0;
    }
    
}
