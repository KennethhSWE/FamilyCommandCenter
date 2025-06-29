package familycommandcenter.controllers;

import familycommandcenter.model.User;
import familycommandcenter.model.Chore;
import familycommandcenter.model.UserDAO;
import familycommandcenter.model.ChoreDataService;

import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserDAO userDAO;
    private final ChoreDataService choreService;

    // Spring will autowire these because UserDAO and ChoreDataService are @Component/@Repository
    public UserController(UserDAO userDAO, ChoreDataService choreService) {
        this.userDAO = userDAO;
        this.choreService = choreService;
    }

    /** GET  /api/users/kids  — return every user whose role == "kid" */
    @GetMapping("/users/kids")
    public List<User> getKids() throws SQLException {
        return userDAO.getUsersByRole("kid");
    }

    /** GET  /api/chores?userId=123  — return all chores for that kid */
    @GetMapping("/chores")
    public List<Chore> getChores(@RequestParam String userId) throws SQLException {
        return choreService.findByUserId(userId);
    }
}
