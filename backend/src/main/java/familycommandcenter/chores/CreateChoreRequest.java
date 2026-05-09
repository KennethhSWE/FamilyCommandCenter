package familycommandcenter.chores;

public class CreateChoreRequest {

    private String name;
    private String assignedTo;
    private int points;
    private String dueDate;
    private Integer minAge;
    private Integer maxAge;
    private Boolean recurring;
    private Boolean isRecurring;
    private Integer createdBy;

    public CreateChoreRequest() {
        // Needed for JSON mapping
    }

    public String getName() {
        return name;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public int getPoints() {
        return points;
    }

    public String getDueDate() {
        return dueDate;
    }

    public Integer getMinAge() {
        return minAge;
    }

    public Integer getMaxAge() {
        return maxAge;
    }

    public Boolean getRecurring() {
        return recurring;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public Integer getCreatedBy() {
        return createdBy;
    }

    public boolean repeatsEveryWeek() {
        return Boolean.TRUE.equals(recurring) || Boolean.TRUE.equals(isRecurring);
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public void setMinAge(Integer minAge) {
        this.minAge = minAge;
    }

    public void setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
    }

    public void setRecurring(Boolean recurring) {
        this.recurring = recurring;
    }

    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }
}