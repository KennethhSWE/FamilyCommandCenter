package familycommandcenter.rewards;

public class RewardCard {

    private int id;
    private String name;
    private int cost;
    private boolean requiresApproval;

    public RewardCard() {
        // Needed for JSON mapping
    }

    public RewardCard(int id, String name, int cost, boolean requiresApproval) {
        this.id = id;
        this.name = name;
        this.cost = cost;
        this.requiresApproval = requiresApproval;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getCost() {
        return cost;
    }

    public boolean isRequiresApproval() {
        return requiresApproval;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCost(int cost) {
        this.cost = cost;
    }

    public void setRequiresApproval(boolean requiresApproval) {
        this.requiresApproval = requiresApproval;
    }
}