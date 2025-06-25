package familycommandcenter.controllers;

import familycommandcenter.model.Chore;
import familycommandcenter.model.ChoreDataService;
import familycommandcenter.model.User;
import familycommandcenter.model.UserDAO;
import io.javalin.http.Context;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

public class AssignController {

    private final UserDAO userDAO;
    private final ChoreDataService choreDataService;

    public AssignController(UserDAO userDAO, ChoreDataService choreDataService) {
        this.userDAO = userDAO;
        this.choreDataService = choreDataService;
    }

    public void assignDailyChores() {
        try {
            List<User> users = userDAO.getAllUsers();
            List<Chore> chorePool = ChoreDataService.getAllPoolChores();

            for (User user : users) {
                List<Chore> eligibleChores = chorePool.stream()
                        .filter(c -> (c.getMinAge() == null || user.getAge() >= c.getMinAge()) &&
                                (c.getMaxAge() == null || user.getAge() <= c.getMaxAge()))
                        .collect(Collectors.toList());

                if (!eligibleChores.isEmpty()) {
                    Chore selected = eligibleChores.get(new Random().nextInt(eligibleChores.size()));
                    selected.setAssignedTo(user.getUsername()); // Assign to current user
                    selected.setComplete(false); // Not complete yet
                    selected.setRequestedComplete(false); // Not requested either
                    selected.setDueDate(LocalDate.now().toString()); // Due today

                    ChoreDataService.insertAssignedChore(selected);
                }
            }
        } catch (SQLException e) {
            System.err.println("Failed to assign daily chores: " + e.getMessage());
            e.printStackTrace();
        }
    }

}
