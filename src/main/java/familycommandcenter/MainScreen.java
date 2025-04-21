package familycommandcenter;

import javafx.fxml.FXML;

public class MainScreen {

    @FXML
    public void initialize() {
        // Optional: code to run when the screen loads
    }

    @Chore chore = new Chore("Clean the house", "Clean the living room, kitchen, and bathroom", false);

    System.out.println("chore.getName() + chore.getDescription() + chore.getisCompleted()");
}
