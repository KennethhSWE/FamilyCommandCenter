package familycommandcenter.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ChoreDataService {
    private static final String FILE_PATH = System.getProperty("user.home") + File.separator + "familycommandcenter_chores.json";
    private static final ObjectMapper mapper = new ObjectMapper();

    public static List<Chore> loadChores() {
        File file = new File(FILE_PATH);
        if (!file.exists()) {
            return new ArrayList<>();
        }
        try {
            return mapper.readValue(file, new TypeReference<List<Chore>>() {});
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public static void saveChores(List<Chore> chores) {
        File file = new File(FILE_PATH);
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(file, chores);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}