module familycommandcenter {
    requires javafx.controls;
    requires javafx.fxml;
    requires transitive javafx.graphics;

    opens familycommandcenter to javafx.fxml;
    exports familycommandcenter;
}
