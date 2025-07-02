package familycommandcenter.controllers;

import familycommandcenter.model.*;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * Assigns chores from the “pool” to kids once a day.
 */
public class AssignController {

    private final UserDAO         userDAO;
    private final ChoreDataService choreDataService;

    public AssignController(UserDAO userDAO, ChoreDataService choreDataService) {
        this.userDAO          = userDAO;
        this.choreDataService = choreDataService;
    }

    /** Pick a random eligible chore for every kid and assign it for today. */
    public void assignDailyChores() {
        try {
            /* ── 1️⃣  fetch the actors ─────────────────────────────── */
            // We only care about the kids, not parents/admins:
            List<User> kids      = userDAO.getUsersByRole("kid");
            List<Chore> chorePool = ChoreDataService.getAllPoolChores();

            /* ── 2️⃣  loop through each kid & assign ────────────────── */
            for (User kid : kids) {

                List<Chore> eligible = chorePool.stream()
                    .filter(c -> (c.getMinAge() == null || kid.getAge() >= c.getMinAge()) &&
                                 (c.getMaxAge() == null || kid.getAge() <= c.getMaxAge()))
                    .collect(Collectors.toList());

                if (!eligible.isEmpty()) {
                    Chore selected = eligible.get(new Random().nextInt(eligible.size()));

                    /* customise the picked chore instance */
                    selected.setAssignedTo(kid.getUsername());
                    selected.setComplete(false);
                    selected.setRequestedComplete(false);
                    selected.setDueDate(LocalDate.now().toString());       // due today

                    choreDataService.insertAssignedChore(selected);
                }
            }
        } catch (SQLException e) {
            System.err.println("Failed to assign daily chores: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

