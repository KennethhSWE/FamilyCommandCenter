package familycommandcenter;

import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import familycommandcenter.model.Chore;
import familycommandcenter.model.FamilyMember;

import java.util.ArrayList;
import java.util.List;

public class MainScreen {

    String customArrays;

@FXML
    private VBox choreListVBox;

    public void initialize() {
        // Create some family members
       FamilyMember Lincoln = new FamilyMember("Lincoln Hayes", "Child");
       FamilyMember Ella = new FamilyMember("Ella Hayes", "Child");
       FamilyMember Austin = new FamilyMember("Austin Alexander", "Child");
       FamilyMember Kenneth = new FamilyMember("Kenneth Hayes", "Parent");
       FamilyMember Danielle = new FamilyMember("Danielle Hayes", "Parent");

       // Create some chores and assign them to family members
       List<Chore> chores = new ArrayList<>();
       chores.add(new Chore("Kitchen Cleaning", "Load the dishwasher", Austin, "2025-04-27", false));
       chores.add(new Chore("Kitchen Cleaning", "Wipe down the counters and table", Ella, "2025-04-27", false));
       chores.add(new Chore("Kitchen Cleaning", "Take out the trash", Austin, "2025-04-27", false));
       chores.add(new Chore("Living Room Cleaning", "Start the Roomba", Lincoln, "2025-04-27", false));
       chores.add(new Chore("Living Room Cleaning", "Dust the TV stand", Ella, "2025-04-27", false));
       chores.add(new Chore("Living Room Cleaning", "Pick up toys", Lincoln, "2025-04-27", false));
       chores.add(new Chore("Living Room Cleaning", "Organize the shoes", Ella, "2025-04-27", false));
       chores.add(new Chore("Room Cleaning", "Make the bed", Austin, "2025-04-27", false));
       chores.add(new Chore("Room Cleaning", "Make the bed", Ella, "2025-04-27", false));
       chores.add(new Chore("Room Cleaning", "Put away clothes", Lincoln, "2025-04-27", false));
       chores.add(new Chore("Room Cleaning", "Put away clothes", Ella, "2025-04-27", false));
       chores.add(new Chore("Room Cleaning", "Put away clothes", Austin, "2025-04-27", false));
       chores.add(new Chore("Room Cleaning", "Vaccum the floor", Austin, "2025-04-27", false));
       chores.add(new Chore("Room Cleaning", "Vaccum the floor", Ella, "2025-04-27", false));

        // Assign chores to family members
        for (Chore chore : chores) {
            chore.getAssignedTo().addChore(chore);
        }

        // Dynamically display chores grouped by family member
        for (FamilyMember member : List.of(Austin, Ella, Lincoln, Kenneth, Danielle)) {
            Label memberLabel = new Label(member.getName() + " (" + member.getRole() + ")");
            choreListVBox.getChildren().add(memberLabel);

        // Add a bullet list of chores assigned to the family member
            for (Chore chore : member.getAssignedChores()) {
                Label choreLabel = new Label("• " + chore.getTitle() + ": " + chore.getDescription());
                choreListVBox.getChildren().add(choreLabel);
             }   
        }
    }
}

