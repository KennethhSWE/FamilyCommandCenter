package familycommandcenter.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

public class ChoreDataService {
    private static final String CHORES_FILE = "src/main/java/familycommandcenter/chores.json";
    private static final ObjectMapper mapper = new ObjectMapper();

    public static List<Chore> loadChores() {
        try {
            File file = new File(CHORES_FILE);
            if (!file.exists() || file.length() == 0) {
                return new ArrayList<>();
            }
            return mapper.readValue(file, new TypeReference<List<Chore>>() {});
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public static void saveChores(List<Chore> chores) {
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(CHORES_FILE), chores);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    private static void ensureChoresFileExists() {
        File file = new File(CHORES_FILE);
        if (!file.exists()) {
            try (InputStream in = ChoreDataService.class.getClassLoader()
                    .getResourceAsStream("fanilycommandcenter/chores.json")) {
                        if (in != null) {
                            Files.copy(in, file.toPath());
                        } else {
                            System.err.println("Defult chores.json not found in resources!");
                        }
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
        }
    }
}