package familycommandcenter.chores;

public class ChoreTemplate {

    private int id;
    private int householdId;
    private String choreName;
    private int pointValue;
    private Integer minAge;
    private Integer maxAge;
    private boolean recurring;
    private boolean active;

    public ChoreTemplate() {
        // Needed for JSON mapping
    }

    public ChoreTemplate(
            int id,
            int householdId,
            String choreName,
            int pointValue,
            Integer minAge,
            Integer maxAge,
            boolean recurring,
            boolean active) {

        this.id = id;
        this.householdId = householdId;
        this.choreName = choreName;
        this.pointValue = pointValue;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.recurring = recurring;
        this.active = active;
    }

    public int getId() {
        return id;
    }

    public int getHouseholdId() {
        return householdId;
    }

    public String getChoreName() {
        return choreName;
    }

    public int getPointValue() {
        return pointValue;
    }

    public Integer getMinAge() {
        return minAge;
    }

    public Integer getMaxAge() {
        return maxAge;
    }

    public boolean isRecurring() {
        return recurring;
    }

    public boolean isActive() {
        return active;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setHouseholdId(int householdId) {
        this.householdId = householdId;
    }

    public void setChoreName(String choreName) {
        this.choreName = choreName;
    }

    public void setPointValue(int pointValue) {
        this.pointValue = pointValue;
    }

    public void setMinAge(Integer minAge) {
        this.minAge = minAge;
    }

    public void setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
    }

    public void setRecurring(boolean recurring) {
        this.recurring = recurring;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}