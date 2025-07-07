package familycommandcenter.controllers;

import familycommandcenter.model.*;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class AssignController {

    private final UserDAO userDAO;
    private final Random  rng = new Random();

    public AssignController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    /** Assign up to 5 chores per kid; returns count per kid. */
    public Map<String, Integer> assignDailyChores() {
        Map<String, Integer> perKid = new HashMap<>();

        try {
            List<User>  kids = userDAO.getUsersByRole("kid");          // all kids
            List<Chore> pool = ChoreDataService.getAllPoolChores();    // template chores

            for (User kid : kids) {

                // unfinished carry-over
                List<Chore> carry = ChoreDataService.getIncompleteByKid(kid.getUsername());
                int need = 5 - carry.size();
                if (need <= 0) {
                    perKid.put(kid.getUsername(), 5);
                    continue;
                }

                // age-appropriate & not yet assigned
                Set<String> namesAlready = carry.stream()
                                                .map(Chore::getName)
                                                .collect(Collectors.toSet());

                List<Chore> eligible = pool.stream()
                        .filter(c ->
                                (c.getMinAge() == null || kid.getAge() >= c.getMinAge()) &&
                                (c.getMaxAge() == null || kid.getAge() <= c.getMaxAge()) &&
                                !namesAlready.contains(c.getName()))
                        .toList();

                Collections.shuffle(eligible, rng);
                List<Chore> picked = eligible.stream().limit(need).toList();

                // persist concrete instances
                for (Chore tpl : picked) {
                    Chore inst = new Chore(
                            0,
                            tpl.getName(),
                            kid.getUsername(),
                            tpl.getPoints(),
                            LocalDate.now().toString(),
                            false,
                            false,
                            tpl.getMinAge(),
                            tpl.getMaxAge(),
                            tpl.isRecurring()
                    );
                    ChoreDataService.insertAssignedChore(inst);
                }
                perKid.put(kid.getUsername(), carry.size() + picked.size());
            }
        } catch (SQLException e) {
            System.err.println("assignDailyChores failed: " + e.getMessage());
            e.printStackTrace();
        }
        return perKid;
    }
}
