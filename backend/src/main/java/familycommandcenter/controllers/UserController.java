package familycommandcenter.controllers;

import familycommandcenter.model.User;
import familycommandcenter.model.Chore;
import familycommandcenter.model.UserDAO;
import familycommandcenter.model.ChoreDataService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserDAO userDAO;
    private final ChoreDataService choreService;

    public UserController(UserDAO userDAO, ChoreDataService choreService) {
        this.userDAO = userDAO;
        this.choreService = choreService;
    }

    // GET /api/users/kids - Return users with role "kid"
    @GetMapping("/kids")
    public ResponseEntity<List<User>> getKids() throws SQLException {
        List<User> kids = userDAO.getUsersByRole("kid");
        return ResponseEntity.ok(kids);
    }

    // GET /api/users/chores?userId=123 - Return chores for specific user
    @GetMapping("/chores")
    public ResponseEntity<List<Chore>> getChores(@RequestParam String userId) throws SQLException {
        List<Chore> chores = choreService.findByUserId(userId);
        return ResponseEntity.ok(chores);
    }

    // POST /api/users/register - Register a new user
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User newUser) throws SQLException {
        userDAO.save(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }
}
