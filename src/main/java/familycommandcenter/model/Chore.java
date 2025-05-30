package familycommandcenter.model;

public class Chore {

    private String title;
    private String description;
    private String assignedToName;
    private String dueDate;
    private boolean completed;
    private boolean firstAttempt;
    private boolean verifiedByParent;
    private int points;

    // No-arg constructor required for Jackson
    public Chore() {
    }
    // Constructor with parameters to initialize a Chore object
    public Chore(String title, String description, String assignedToName, String dueDate, boolean completed) {
        this.title = title;
        this.description = description;
        this.assignedToName = assignedToName;
        this.dueDate = dueDate;
        this.completed = completed;
        this.firstAttempt = true; // Assuming first attempt is true when a chore is created
        this.verifiedByParent = false; // Assuming it is not verified by parent when created
        this.points = 0; // Assuming no points are awarded when a chore is created
    }

    // Getters and Setters
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

    public void setFirstAttempt(boolean firstAttempt) {
        this.firstAttempt = firstAttempt;
    }

    public boolean isFirstAttempt() {
        return firstAttempt; 
    }

    public void setVerifiedByParent(boolean verifiedByParent) {
        this.verifiedByParent = verifiedByParent;
    }

    public int points() {
        if (completed && verifiedByParent) {
            if (firstAttempt) {
                return 10; // Points for first attempt
            } else {
                return 5; // Points for subsequent attempts
            }
        }
        return 0;
    }
}
