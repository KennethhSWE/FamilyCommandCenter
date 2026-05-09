package familycommandcenter.rewards;

public class CreateRewardRequest {

    private String name;
    private int cost;
    private Boolean requiresApproval;
    private Boolean requires_approval;

    public CreateRewardRequest() {
        // Needed for JSON mapping
    }

    public String getName() {
        return name;
    }

    public int getCost() {
        return cost;
    }

    public Boolean getRequiresApproval() {
        return requiresApproval;
    }

    public Boolean getRequires_approval() {
        return requires_approval;
    }

    public boolean needsParentApproval() {
        return Boolean.TRUE.equals(requiresApproval)
                || Boolean.TRUE.equals(requires_approval)
                || cost > 50;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCost(int cost) {
        this.cost = cost;
    }

    public void setRequiresApproval(Boolean requiresApproval) {
        this.requiresApproval = requiresApproval;
    }

    public void setRequires_approval(Boolean requires_approval) {
        this.requires_approval = requires_approval;
    }
}