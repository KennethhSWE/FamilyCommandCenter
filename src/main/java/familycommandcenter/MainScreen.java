package familycommandcenter;

import javafx.fxml.FXML;
import familycommandcenter.model.Chore;

public class MainScreen {

    private Chore chore;

    @FXML
    public void initialize() {
        chore = new Chore("Clean the house", "Clean the living room, kitchen, and bathroom", false);
        System.out.println(chore.getName() + " " + chore.getDescription() + " " + chore.isCompleted());
    }
}
