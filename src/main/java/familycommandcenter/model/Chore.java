package familycommandcenter.model;

public class Chore {

    private String title;
    private String description;
    private String assignedToName;
    private String dueDate;
    private boolean completed;

    public Chore(String title, String description, String assignedToName, String dueDate, boolean completed) {
        this.title = title;
        this.description = description;
        this.assignedToName = assignedToName;
        this.dueDate = dueDate;
        this.completed = completed;
    }

    //Getters 
     public String getTitle() {
        return title;
    }   

     public String getDescription() {
        return description;
    }   

    public String getAssignedToName() {
        return assignedToName;
    }

    public String getDueDate() {
        return dueDate;
    }

     public boolean isCompleted() {
        return completed;
    }

    //Setters
     public void setTitle(String title) {
        this.title = title;
    }   

     public void setDescription(String description) {
        this.description = description;
    }   

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

     public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}

