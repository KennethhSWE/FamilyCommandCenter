package familycommandcenter;

import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import familycommandcenter.model.*;


import java.util.*;

public class MainScreen {

    @FXML
    private VBox addChoreForm;
    @FXML
    private Button addChoreButton;
    @FXML
    private Button submitChoreButton;
    @FXML
    private Button cancelChoreButton;
    @FXML
    private ComboBox<String> childComboBox;
    @FXML
    private ComboBox<String> choreTitleComboBox;
    @FXML
    private TextField choreDescField;
    @FXML
    private TextField dueDateTextField;
    @FXML
    private Label formStatusLabel;
    @FXML
    private VBox choreListVBox;

    private List<Chore> chores;
    private final List<FamilyMember> familyMembers = FamilyData.getFamilyMembers();

    public void initialize() {
        childComboBox.getItems().clear();
        for (FamilyMember member : familyMembers) {
            if ("Child".equalsIgnoreCase(member.getRole())) {
                childComboBox.getItems().add(member.getName());
            }
        }

        choreTitleComboBox.getItems().setAll("Bedroom", "Kitchen", "LivingRoom", "Bathroom", "Basement");

        chores = ChoreDataService.loadChores();
        if (chores == null || chores.isEmpty()) {
            chores = new ArrayList<>();
            formStatusLabel.setText("No chores found. Please add some.");
            formStatusLabel.setStyle("-fx-text-fill: red;");
        } else {
            formStatusLabel.setText("Chores loaded successfully.");
            formStatusLabel.setStyle("-fx-text-fill: green;");
        }

        assignChoresToMembers();
        refreshChoreList();

        addChoreButton.setOnAction(_ -> {
            addChoreForm.setVisible(true);
            formStatusLabel.setText("");
            formStatusLabel.setStyle("");
        });

        cancelChoreButton.setOnAction(_ -> {
            addChoreForm.setVisible(false);
            clearForm();
        });

        submitChoreButton.setOnAction(_ -> addChore());
    }

    private void addChore() {
        String childName = childComboBox.getValue();
        String title = choreTitleComboBox.getValue();
        String desc = choreDescField.getText().trim();
        String due = dueDateTextField.getText().trim();

        if (childName == null || title == null || desc.isEmpty() || due.isEmpty()) {
            formStatusLabel.setText("Please fill in all fields.");
            formStatusLabel.setStyle("-fx-text-fill: red;");
            return;
        }

        Chore newChore = new Chore(title, desc, childName, due, false);
        chores.add(newChore);
        ChoreDataService.saveChores(chores);

        // Reload chores from disk to ensure the list is up to date
        chores = ChoreDataService.loadChores();

        assignChoresToMembers();
        refreshChoreList();

        formStatusLabel.setText("Chore assigned successfully!");
        formStatusLabel.setStyle("-fx-text-fill: green;");
        clearForm();
        addChoreForm.setVisible(false);
    }

    private void assignChoresToMembers() {
        Map<String, FamilyMember> nameMap = new HashMap<>();
        for (FamilyMember member : familyMembers) {
            member.getAssignedChores().clear();
            nameMap.put(member.getName().toLowerCase(), member);
        }

        for (Chore chore : chores) {
            FamilyMember match = nameMap.get(chore.getAssignedToName().toLowerCase());
            if (match != null) {
                match.addChore(chore);
            }
        }
    }

    private void refreshChoreList() {
        choreListVBox.getChildren().clear();
        for (FamilyMember member : familyMembers) {
            TitledPane pane = new TitledPane();
            pane.setText(member.getName() + " (" + member.getRole() + ")");
            VBox box = new VBox();
            if (member.getAssignedChores().isEmpty()) {
                box.getChildren().add(new Label("No chores assigned today!"));
            } else {
                for (Chore c : member.getAssignedChores()) {
                    box.getChildren().add(new Label(
                            "• " + c.getTitle() + ": " + c.getDescription() + " (Due: " + c.getDueDate() + ")"));
                }
            }
            pane.setContent(box);
            choreListVBox.getChildren().add(pane);
        }
    }

    private void clearForm() {
        childComboBox.getSelectionModel().clearSelection();
        choreDescField.clear();
        choreTitleComboBox.getSelectionModel().clearSelection();
        dueDateTextField.clear();
    }
}