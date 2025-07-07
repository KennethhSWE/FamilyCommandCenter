package familycommandcenter.model;

// Declaring the Variables
public class Chore {
    private int id;
    private String name; 
    private String assignedTo;
    private boolean isComplete;
    private boolean isRecurring;
    private String dueDate; 
    private int points;  
    private boolean requestedComplete;
    private int minAge; 
    private int maxAge;


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

    public Integer getMinAge() {
        return minAge;
    }

    public void setMinAge(Integer minAge) {
        this.minAge = minAge;
    }

    public Integer getMaxAge() {
        return maxAge;
    }

    public void setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
    }

    public boolean isRecurring() {
        return isRecurring; 
    }

    public void setRecurring(boolean isRecurring) {
        this.isRecurring = isRecurring; 
    }

    public Chore(int id, String name, String assignedTo, int points, String dueDate, boolean isComplete, boolean requestedComplete, Integer minAge, Integer maxAge, boolean isRecurring) {
        this.id = id;
        this.name = name;
        this.assignedTo = assignedTo;
        this.points = points;
        this.dueDate = dueDate;
        this.isComplete = isComplete;
        this.requestedComplete = requestedComplete;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.isRecurring = isRecurring;
    }
}
