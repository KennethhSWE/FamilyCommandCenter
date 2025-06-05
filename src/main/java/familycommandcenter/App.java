package familycommandcenter;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

/**
 * JavaFX App
 */
public class App extends Application {
    // The scene that will be used throughout the application
    private static Scene scene;

    @Override
    public void start(Stage stage) throws IOException {
        scene = new Scene(loadFXML("mainscreen"), 640, 480);
        scene.getRoot().getStyleClass().add("root");
        // adding the CSS file to the scene as javafx css isn't supported in this
        // version of Java.
        // scene.getStylesheets().add(App.class.getResource("/familycommandcenter/style.css").toExternalForm());

        var cssUrl = App.class.getResource("/style.css");

        if (cssUrl == null) {
            throw new RuntimeException("❌ style.css NOT FOUND — fix your resource path!");
        }
        System.out.println("✅ Loaded CSS from: " + cssUrl.toExternalForm());
        scene.getStylesheets().add(cssUrl.toExternalForm());

        stage.setScene(scene);
        stage.show();
    }

    // This method is used to set the root of the scene to a new FXML file.
    static void setRoot(String fxml) throws IOException {
        scene.setRoot(loadFXML(fxml));
    }

    // This method is used to load the FXML file and return the Parent object.
    private static Parent loadFXML(String fxml) throws IOException {
        FXMLLoader fxmlLoader = new FXMLLoader(App.class.getResource("/familycommandcenter/" + fxml + ".fxml"));
        return fxmlLoader.load();
    }

    // Entry Point of the application
    public static void main(String[] args) {
        launch();
    }
}