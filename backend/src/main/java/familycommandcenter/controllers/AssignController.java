package familycommandcenter.controllers;

import familycommandcenter.model.Chore;
import familycommandcenter.model.ChoreDataService;
import familycommandcenter.model.User;
import familycommandcenter.model.UserDAO;
import io.javalin.http.Context;

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

    public void assignDailyChores(Context ctx) {
        List<User> users = userDAO.getAllUsers();
        List<Chore> chorePool = choreDataService.getAllPoolChores();

        for (User user : users) {
            List<Chore> eligibleChores = chorePool.stream()
                .filter(c -> (c.getMinAge() == null || user.getAge() >= c.getMinAge()) &&
                             (c.getMaxAge() == null || user.getAge() <= c.getMaxAge()))
                .collect(Collectors.toList());

            if (!eligibleChores.isEmpty()) {
                Chore randomChore = eligibleChores.get(new Random().nextInt(eligibleChores.size()));
                // TODO: Insert chore assignment logic here (save to DB)
                System.out.println("Assigning chore: " + randomChore.getName() + " to user " + user.getUsername());
            }
        }

        ctx.status(200).result("Daily chores assigned.");
    }
}
