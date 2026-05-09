package familycommandcenter.chores;

public class DailyChoreSummary {

    private int kidsChecked;
    private int carriedOverChores;
    private int penaltyPointsTaken;
    private int newChoresAssigned;

    public DailyChoreSummary() {
        // Needed for JSON mapping
    }

    public DailyChoreSummary(
            int kidsChecked,
            int carriedOverChores,
            int penaltyPointsTaken,
            int newChoresAssigned) {

        this.kidsChecked = kidsChecked;
        this.carriedOverChores = carriedOverChores;
        this.penaltyPointsTaken = penaltyPointsTaken;
        this.newChoresAssigned = newChoresAssigned;
    }

    public int getKidsChecked() {
        return kidsChecked;
    }

    public int getCarriedOverChores() {
        return carriedOverChores;
    }

    public int getPenaltyPointsTaken() {
        return penaltyPointsTaken;
    }

    public int getNewChoresAssigned() {
        return newChoresAssigned;
    }

    public void setKidsChecked(int kidsChecked) {
        this.kidsChecked = kidsChecked;
    }

    public void setCarriedOverChores(int carriedOverChores) {
        this.carriedOverChores = carriedOverChores;
    }

    public void setPenaltyPointsTaken(int penaltyPointsTaken) {
        this.penaltyPointsTaken = penaltyPointsTaken;
    }

    public void setNewChoresAssigned(int newChoresAssigned) {
        this.newChoresAssigned = newChoresAssigned;
    }
}