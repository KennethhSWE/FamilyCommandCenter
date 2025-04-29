package familycommandcenter;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.control.TitledPane;
import javafx.scene.control.ComboBox;

import javafx.scene.layout.VBox;
import familycommandcenter.model.Chore;
import familycommandcenter.model.FamilyMember;

import java.util.ArrayList;
import java.util.List;

public class MainScreen {

    @FXML private VBox addChoreForm;
    @FXML private Button addChoreButton;
    @FXML private Button submitChoreButton;
    @FXML private Button addChoreSaveButton;
    @FXML private Button cancelChoreButton;
    @FXML private ComboBox<String> childComboBox; // Changed from TextField to ComboBox
    @FXML private TextField choreDescField;
    @FXML private TextField dueDaTextField;
    @FXML private Label formStatusLabel;
    @FXML private VBox choreListVBox;

    private List<FamilyMember> getFamilyMembers() {
        return List.of(
            new FamilyMember("Austin Alexander", "Child"),
            new FamilyMember("Ella Hayes", "Child"),
            new FamilyMember("Lincoln Hayes", "Child"),
            new FamilyMember("Kenneth Hayes", "Parent"),
            new FamilyMember("Danielle Hayes", "Parent")
        );
    }

    public void initialize() {

        List<FamilyMember> familyMembers = getFamilyMembers();

        // Populate ComboBox with child names only
        childComboBox.getItems().clear();
        for (FamilyMember member : familyMembers) {
            if ("Child".equalsIgnoreCase(member.getRole())) {
                childComboBox.getItems().add(member.getName());
            }
        }

        // Create some chores and assign them to family members
        List<Chore> chores = new ArrayList<>();
        chores.add(new Chore("Kitchen Cleaning", "Load the dishwasher", familyMembers.get(0), "2025-04-27", false));
        chores.add(new Chore("Kitchen Cleaning", "Wipe down the counters and table", familyMembers.get(1), "2025-04-27", false));
        chores.add(new Chore("Kitchen Cleaning", "Take out the trash", familyMembers.get(0), "2025-04-27", false));
        chores.add(new Chore("Living Room Cleaning", "Start the Roomba", familyMembers.get(2), "2025-04-27", false));
        chores.add(new Chore("Living Room Cleaning", "Dust the TV stand", familyMembers.get(1), "2025-04-27", false));
        chores.add(new Chore("Living Room Cleaning", "Pick up toys", familyMembers.get(2), "2025-04-27", false));
        chores.add(new Chore("Living Room Cleaning", "Organize the shoes", familyMembers.get(1), "2025-04-27", false));
        chores.add(new Chore("Room Cleaning", "Make the bed", familyMembers.get(0), "2025-04-27", false));
        chores.add(new Chore("Room Cleaning", "Make the bed", familyMembers.get(1), "2025-04-27", false));
        chores.add(new Chore("Room Cleaning", "Put away clothes", familyMembers.get(2), "2025-04-27", false));
        chores.add(new Chore("Room Cleaning", "Put away clothes", familyMembers.get(1), "2025-04-27", false));
        chores.add(new Chore("Room Cleaning", "Put away clothes", familyMembers.get(0), "2025-04-27", false));
        chores.add(new Chore("Room Cleaning", "Vaccum the floor", familyMembers.get(0), "2025-04-27", false));
        chores.add(new Chore("Room Cleaning", "Vaccum the floor", familyMembers.get(1), "2025-04-27", false));

        // Assign chores to family members
        addChoreButton.setOnAction(e -> {
            addChoreForm.setVisible(true);
            formStatusLabel.setText("");
            formStatusLabel.setStyle("");
        });

        cancelChoreButton.setOnAction(e -> {
            addChoreForm.setVisible(false);
            clearForm();
        });

        submitChoreButton.setOnAction(e -> {
            String childName = childComboBox.getValue();
            String desc = choreDescField.getText().trim();
            String due = dueDaTextField.getText().trim();

            if (childName == null || childName.isEmpty() || desc.isEmpty() || due.isEmpty()) {
                formStatusLabel.setText("Please fill in all fields.");
                formStatusLabel.setStyle("-fx-text-fill: red; -fx-background-color: #ffd6d6");
                return;
            }

            // Find the child
            FamilyMember child = familyMembers.stream()
                .filter(m -> m.getName().equalsIgnoreCase(childName) && m.getRole().equalsIgnoreCase("Child"))
                .findFirst().orElse(null);

            if (child == null) {
                formStatusLabel.setText("Child not found!");
                formStatusLabel.setStyle("-fx-text-fill: red; -fx-background-color: #ffd6d6;");
                return;
            }

            Chore newChore = new Chore("Custom", desc, child, due, false);
            child.addChore(newChore);

            formStatusLabel.setText("Chore assigned successfully!");
            formStatusLabel.setStyle("-fx-text-fill: green; -fx-background-color: #d6ffd6;");
            clearForm();

            // Optionally, refresh the UI to show the new chore
            // (You may want to refactor your code to support dynamic updates)
        });

        for (Chore chore : chores) {
            chore.getAssignedTo().addChore(chore);
        }

        // Dynamically display chores grouped by family member
        for (FamilyMember member : familyMembers) {
            // Create TitledPane for each family member
            TitledPane titledPane = new TitledPane();
            titledPane.setText(member.getName() + " (" + member.getRole() + ")");

            // Create VBox for the member's chores
            VBox choresBox = new VBox();
            choresBox.setSpacing(5);

            // Add the chores to the VBox
            if (member.getAssignedChores().isEmpty()) {
                Label noChoresLabel = new Label("No chores assigned today!");
                noChoresLabel.getStyleClass().add("no-chores-label");
                choresBox.getChildren().add(noChoresLabel);
            } else {
                for (Chore chore : member.getAssignedChores()) {
                    Label choreLabel = new Label("• " + chore.getTitle() + ": " + chore.getDescription() + " (Due: " + chore.getDueDate() + ")");
                    choreLabel.getStyleClass().add("chore-label");
                    choresBox.getChildren().add(choreLabel);
                }
            }
            // Set the content of the TitledPane to the VBox
            titledPane.setContent(choresBox);

            // Add the TitledPane to the main VBox
            choreListVBox.getChildren().add(titledPane);
        }
    }

    private void clearForm() {
        childComboBox.getSelectionModel().clearSelection();
        choreDescField.clear();
        dueDaTextField.clear();
    }
}