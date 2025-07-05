package familycommandcenter.controllers;

import familycommandcenter.model.User;
import familycommandcenter.model.Chore;
import familycommandcenter.model.UserDAO;
import familycommandcenter.model.ChoreDataService;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<String> registerUser(@RequestBody Map<String, String> payload) {
        try {
            String username = payload.get("username");
            String pin = payload.get("pin");

            if (username == null || pin == null || pin.length() != 4) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid username or PIN length.");
            }

            String hashed = BCrypt.hashpw(pin, BCrypt.gensalt());
            User newUser = new User(0, username, hashed, LocalDateTime.now(), 0, "parent", null);

            userDAO.save(newUser);
            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully.");

        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
        }
    }
}
