package familycommandcenter.controllers;

import familycommandcenter.Database;
import familycommandcenter.model.*;
import java.sql.*; // ← Connection, PreparedStatement, SQLException
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

public class AssignController {

    private final UserDAO userDao;

    public AssignController(UserDAO userDao) {
        this.userDao = userDao;
    }

    /** Run once every morning (or trigger manually) */
    public void assignDailyChores() {

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        /* get kids list safely */
        List<User> kids;
        try {
            kids = userDao.getUsersByRole("kid");
        } catch (SQLException e) {
            e.printStackTrace();
            return;
        }

        kids.forEach(kid -> {
            try {
                /* 1 ▸ carry-over yesterday’s incomplete */
                ChoreDataService.getIncompleteByKid(kid.getUsername()).stream()
                        .filter(c -> LocalDate.parse(c.getDueDate()).isEqual(yesterday))
                        .forEach(c -> {
                            try {
                                c.setDueDate(today.toString());
                                ChoreDataService.insertAssignedChore(c);
                            } catch (SQLException ex) {
                                ex.printStackTrace();
                            }
                        });

                /* 2 ▸ age-appropriate pool, shuffled */
                List<Chore> pool = ChoreDataService.getPoolForKidAge(kid.getAge());
                Collections.shuffle(pool);

                /* 3 ▸ add up to 5 new chores not already on today’s list */
                int added = 0;
                for (Chore c : pool) {
                    if (added == 5)
                        break;
                    if (alreadyAssignedToday(kid.getUsername(), c.getName()))
                        continue;

                    c.setAssignedTo(kid.getUsername());
                    c.setDueDate(today.toString());
                    c.setComplete(false);
                    ChoreDataService.insertAssignedChore(c);
                    added++;
                }

            } catch (SQLException e) {
                e.printStackTrace();
            }
        });
    }

    /** true if kid already has this chore for *today* */
    private boolean alreadyAssignedToday(String username, String choreName) throws SQLException {
        String sql = """
                    SELECT 1 FROM chores
                    WHERE assigned_to = ?
                      AND name         = ?
                      AND due_date     = CURRENT_DATE
                    LIMIT 1
                """;
        try (Connection c = Database.getConnection();
                PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, choreName);
            return ps.executeQuery().next();
        }
    }
}
