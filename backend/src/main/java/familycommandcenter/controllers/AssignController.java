package familycommandcenter.controllers;

import familycommandcenter.Database;
import familycommandcenter.model.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

/**
 * Creates / refreshes the daily chore list for every kid.
 * <p>
 *  • Carries over yesterday’s unfinished chores.<br>
 *  • Adds up to five random pool-chores that match the kid’s age.<br>
 *  • Never duplicates a chore already scheduled for today.
 */
public final class AssignController {

    private final UserDAO userDao;

    public AssignController(UserDAO userDao) {
        this.userDao = userDao;
    }

    /** Trigger once each morning (or via POST /api/assign/daily). */
    public void assignDailyChores() {
        LocalDate today      = LocalDate.now();
        LocalDate yesterday  = today.minusDays(1);

        List<User> kids;
        try {
            kids = userDao.getUsersByRole("kid");
        } catch (SQLException e) {                     // unlikely: connection pool down
            e.printStackTrace();
            return;
        }

        for (User kid : kids) {
            try {
                /* 1 ─ carry-over yesterday’s unfinished work */
                for (Chore c : ChoreDataService.getIncompleteByKid(kid.getUsername())) {
                    if (!LocalDate.parse(c.getDueDate()).isEqual(yesterday)) continue;
                    c.setDueDate(today.toString());
                    ChoreDataService.insertAssignedChore(c);
                }

                /* 2 ─ select up to 5 new, age-appropriate chores */
                List<Chore> pool = ChoreDataService.getPoolForKidAge(kid.getAge());
                Collections.shuffle(pool);

                int added = 0;
                for (Chore c : pool) {
                    if (added == 5) break;
                    if (alreadyAssignedToday(kid.getUsername(), c.getName())) continue;

                    c.setAssignedTo(kid.getUsername());
                    c.setDueDate(today.toString());
                    c.setComplete(false);
                    ChoreDataService.insertAssignedChore(c);
                    added++;
                }

            } catch (SQLException e) {
                e.printStackTrace();                   // continue with next kid
            }
        }
    }

    /** Returns {@code true} if {@code username} already has {@code choreName} scheduled for today. */
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
