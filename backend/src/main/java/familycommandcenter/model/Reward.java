package familycommandcenter.model;

/**
 * Represents a reward a user can redeem with their points.
 * Maps to the 'rewards' table.
 */
public class Reward {
    private int id;
    private String name;
    private int cost;
    private boolean requiresApproval;

    // Default constructor for serialization/deserialization
    public Reward() {}

    // Full constructor
    public Reward(String name, int cost, boolean requiresApproval) {
        this.name = name;
        this.cost = cost;
        this.requiresApproval = requiresApproval;
    }

    // Getters and setters
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

    public int getCost() {
        return cost;
    }

    public void setCost(int cost) {
        this.cost = cost;
    }

    public boolean isRequiresApproval() {
        return requiresApproval;
    }

    public void setRequiresApproval(boolean requiresApproval) {
        this.requiresApproval = requiresApproval;
    }
}
