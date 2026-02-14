package familycommandcenter.model;


public class Chore {
    private int id;
    private String name;
    private String assignedTo;
    private int points;
    private String dueDate;
    private boolean isComplete;
    private boolean requestedComplete;
    private Integer minAge;
    private Integer maxAge;
    private boolean isVerified;
    private boolean isRecurring;
    private Integer createdBy;

    public Chore() {
        // Default constructor for Jackson
    }

    public Chore(int id, String name, String assignedTo, int points, String dueDate,
                 boolean isComplete, boolean requestedComplete,
                 Integer minAge, Integer maxAge,
                 boolean verified, boolean recurring, Integer createdBy) {
        this.id = id;
        this.name = name;
        this.assignedTo = assignedTo;
        this.points = points;
        this.dueDate = dueDate;
        this.isComplete = isComplete;
        this.requestedComplete = requestedComplete;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.isVerified = verified;
        this.isRecurring = recurring;
        this.createdBy = createdBy;
    }

    // Getters and setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public boolean isComplete() { return isComplete; }
    public void setComplete(boolean complete) { this.isComplete = complete; }

    public boolean isRequestedComplete() { return requestedComplete; }
    public void setRequestedComplete(boolean requestedComplete) { this.requestedComplete = requestedComplete; }

    public Integer getMinAge() { return minAge; }
    public void setMinAge(Integer minAge) { this.minAge = minAge; }

    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { this.isVerified = verified; }

    public boolean isRecurring() { return isRecurring; }
    public void setRecurring(boolean recurring) { this.isRecurring = recurring; }

    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }
}
