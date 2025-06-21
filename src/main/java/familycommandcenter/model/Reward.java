package familycommandcenter.model;

public class Reward {
    private int id;
    private String name;
    private int cost;
    private boolean requiresApproval;

    // Constructors
    public Reward() {}

    public Reward(String name, int cost, boolean requiresApproval) {
        this.name = name;
        this.cost = cost;
        this.requiresApproval = requiresApproval;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCost() { return cost; }
    public void setCost(int cost) { this.cost = cost; }

    public boolean isRequiresApproval() { return requiresApproval; }
    public void setRequiresApproval(boolean requiresApproval) { this.requiresApproval = requiresApproval; }
}
