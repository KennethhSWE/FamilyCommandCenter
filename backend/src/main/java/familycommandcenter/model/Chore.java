package familycommandcenter.model;

// Declaring the Variables
public class Chore {
    private int id;
    private String name; 
    private String assignedTo;
    private boolean isComplete;
    private String dueDate; 
    private int points;  
    private boolean requestedComplete;

    // Getter and Setter methods 
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id; 
    }

    public String getName() {
        return name; 
    }

    public void setName(String name) {
        this.name = name; 
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public boolean isComplete() {
        return isComplete;
    }

    public void setComplete(boolean complete) {
        isComplete = complete; 
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public int getPoints() {
        return points; 
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public boolean isRequestedComplete() {
        return requestedComplete;
    }

    public void setRequestedComplete(boolean requestedComplete) {
        this.requestedComplete = requestedComplete;
    }

    
}
