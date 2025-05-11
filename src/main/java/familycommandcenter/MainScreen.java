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
import familycommandcenter.model.ChoreDataService;

import java.util.ArrayList;
import java.util.List;

public class MainScreen {

    @FXML private VBox addChoreForm;
    @FXML private Button addChoreButton;
    @FXML private Button submitChoreButton;
    @FXML private Button cancelChoreButton;
    @FXML private ComboBox<String> childComboBox; // Changed from TextField to ComboBox
    @FXML private ComboBox<String> choreTitleComboBox; 
    @FXML private TextField choreDescField;
    @FXML private TextField dueDaTextField;
    @FXML private Label formStatusLabel;
    @FXML private VBox choreListVBox;

    private List<Chore> chores = new ArrayList<>();

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

        // Populate ComboBox with chore titles
        choreTitleComboBox.getItems().setAll("Bedroom", "Kitchen", "LivingRoom", "Bathroom", "Basement");

        // Load chores from file, or add defaults if empty
        try {
            chores = ChoreDataService.loadChores();
        } catch (Exception e) {
            chores = new ArrayList<>();
            e.printStackTrace();
        }
        if (chores.isEmpty()) {
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
            try {
                ChoreDataService.saveChores(chores);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Assign chores to family members
        for (Chore chore : chores) {
            for (FamilyMember member : familyMembers) {
                if (member.getName().equals(chore.getAssignedTo().getName()) &&
                    member.getRole().equals(chore.getAssignedTo().getRole())) {
                    member.addChore(chore);
                    break;
                }
            }
        }

        addChoreButton.setOnAction(_ -> {
            addChoreForm.setVisible(true);
            formStatusLabel.setText("");
            formStatusLabel.setStyle("");
        });

        cancelChoreButton.setOnAction(_ -> {
            addChoreForm.setVisible(false);
            clearForm();
        });

        submitChoreButton.setOnAction(_ -> {
            String childName = childComboBox.getValue();
            String title = choreTitleComboBox.getValue();
            String desc = choreDescField.getText().trim();
            String due = dueDaTextField.getText().trim();

            if (childName == null || childName.isEmpty() || title.isEmpty() || desc.isEmpty() || due.isEmpty()) {
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

            Chore newChore = new Chore(title, desc, child, due, false);
            child.addChore(newChore);
            chores.add(newChore);
            try {
                ChoreDataService.saveChores(chores);
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            formStatusLabel.setText("Chore assigned successfully!");
            formStatusLabel.setStyle("-fx-text-fill: green; -fx-background-color: #d6ffd6;");
            clearForm();

            // Reassign chores to family members refresh the UI
            assignChoresToMembers(familyMembers);
            refreshChoreList(familyMembers);
        });
    }

    private void assignChoresToMembers(List<FamilyMember> familyMembers) {
        for (FamilyMember member : familyMembers) {
            member.getAssignedChores().clear(); 
        }

        for (Chore chore : chores) {
            for (FamilyMember member : familyMembers) {
                if (member.getName().equals(chore.getAssignedTo().getName()) &&
                    member.getRole().equals(chore.getAssignedTo().getRole())) {
                    member.addChore(chore);
                    break;
                }
            }
        }
    }

    private void refreshChoreList(List<FamilyMember> familyMembers) {
        choreListVBox.getChildren().clear();
        for (FamilyMember member : familyMembers) {
            TitledPane titledPane = new TitledPane();
            titledPane.setText(member.getName() + " (" + member.getRole() + ")");

            VBox choresBox = new VBox();
            choresBox.setSpacing(5);

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
            titledPane.setContent(choresBox);
            choreListVBox.getChildren().add(titledPane);
        }
    }
    
    private void clearForm() {
        childComboBox.getSelectionModel().clearSelection();
        choreDescField.clear();
        dueDaTextField.clear();
    }
}
