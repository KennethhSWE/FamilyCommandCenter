package familycommandcenter.model;

public class Chore {

    private String title;
    private String description;
    private FamilyMember assignedTo;
    private String dueDate;
    private boolean completed;

    public Chore(String title, String description, FamilyMember assignedTo, String dueDate, boolean completed) {
        this.title = title;
        this.description = description;
        this.assignedTo = assignedTo;
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

    public FamilyMember getAssignedTo() {
        return assignedTo;
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

    public void setAssignedTo(FamilyMember assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

     public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}

