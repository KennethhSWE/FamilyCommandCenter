package familycommandcenter.model;

import java.util.ArrayList;
import java.util.List;


public class FamilyMember {
    private String name;
    private String role; // e.g., parent, child, etc.
    private List<Chore> assignedChores;

    public FamilyMember(String name, String role){ 
    this.name = name;
    this.role = role;
    this.assignedChores = new ArrayList<>();
    }

    //Getters
    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }   

    public List<Chore> getAssignedChores() {
        return assignedChores;
    }

    // Adding a chore to the family member's list
    public void addChore(Chore chore) {
        this.assignedChores.add(chore);
    }
}
    

