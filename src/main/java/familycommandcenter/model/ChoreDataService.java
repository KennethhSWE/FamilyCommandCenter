package familycommandcenter.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;import java.util.ArrayList;
import java.util.List;

public class ChoreDataService {
    private static final String CHORES_FILE = 
        System.getProperty("user.home") + File.separator + "familycommandcenter_chores.json";
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
            File file = new File(CHORES_FILE);
            mapper.writerWithDefaultPrettyPrinter().writeValue(file, chores);
            System.out.println("Saved " + chores.size() + " chores to " + file.getAbsolutePath());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}