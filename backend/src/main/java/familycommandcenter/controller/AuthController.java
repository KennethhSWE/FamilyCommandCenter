package familycommandcenter.controller;

import familycommandcenter.util.JwtUtil;
import familycommandcenter.model.User;
import familycommandcenter.model.UserDAO;

import io.javalin.http.Handler;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Map;
import java.util.Optional;

public class AuthController {

    private UserDAO userDao;

    // Default constructor initializing userDao to a default implementation or throw an exception
    public AuthController() {
        this.userDao = null; // or provide a default UserDAO implementation if available
    }

    public Handler login = ctx -> {
        User loginRequest = ctx.bodyAsClass(User.class);
        Optional<User> userOpt = userDao.getUserByUsername(loginRequest.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (BCrypt.checkpw(loginRequest.getPasswordHash(), user.getPasswordHash())) {
                String token = JwtUtil.generateToken(user.getUsername());
                ctx.json(Map.of("token", token));
                return;
            }
        }

        ctx.status(401).result("Invalid username or password");
    };
}
