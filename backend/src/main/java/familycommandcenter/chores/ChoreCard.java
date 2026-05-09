package familycommandcenter.chores;

public class ChoreCard {

    private int id;
    private String name;
    private String assignedTo;
    private int points;
    private String dueDate;
    private boolean complete;
    private boolean requestedComplete;
    private Integer minAge;
    private Integer maxAge;
    private boolean verified;
    private boolean recurring;
    private Integer createdBy;

    public ChoreCard() {
        // Needed for JSON mapping
    }

    public ChoreCard(
            int id,
            String name,
            String assignedTo,
            int points,
            String dueDate,
            boolean complete,
            boolean requestedComplete,
            Integer minAge,
            Integer maxAge,
            boolean verified,
            boolean recurring,
            Integer createdBy) {

        this.id = id;
        this.name = name;
        this.assignedTo = assignedTo;
        this.points = points;
        this.dueDate = dueDate;
        this.complete = complete;
        this.requestedComplete = requestedComplete;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.verified = verified;
        this.recurring = recurring;
        this.createdBy = createdBy;
    }

    public int getId() {
        return id;
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

    public boolean isComplete() {
        return complete;
    }

    public boolean isRequestedComplete() {
        return requestedComplete;
    }

    public Integer getMinAge() {
        return minAge;
    }

    public Integer getMaxAge() {
        return maxAge;
    }

    public boolean isVerified() {
        return verified;
    }

    public boolean isRecurring() {
        return recurring;
    }

    public Integer getCreatedBy() {
        return createdBy;
    }

    public void setId(int id) {
        this.id = id;
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

    public void setComplete(boolean complete) {
        this.complete = complete;
    }

    public void setRequestedComplete(boolean requestedComplete) {
        this.requestedComplete = requestedComplete;
    }

    public void setMinAge(Integer minAge) {
        this.minAge = minAge;
    }

    public void setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public void setRecurring(boolean recurring) {
        this.recurring = recurring;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }
}