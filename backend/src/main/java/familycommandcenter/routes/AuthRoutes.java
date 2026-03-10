package familycommandcenter.routes; 

import com.fasterxml.jackson.core.type.TypeReference; 
import com.fasterxml.jackson.databind.ObjectMapper; 
import familycommandcenter.model.PointsBankDAO;
import familycommandcenter.model.User; 
import familycommandcenter.model.UserDAO; 
import familycommandcenter.util.JwtUtil;
import familycommandcenter.util.PasswordUtils; 
import io.javalin.Javalin; 

import java.time.LocalDateTime; 
import java.util.List; 
import java.util.Map;
import java.util.Optional; 
import java.util.UUID;


public final class AuthRoutes {
    
    private static final ObjectMapper JSON = new ObjectMapper();

    private AuthRoutes() {
        //Utility Class
    }

    public static void register(Javalin api, UserDAO userDAO, PointsBankDAO pointsDAO) {
        api.post("/api/household", ctx -> {
            record Req(String adminName, String pin) {}

            Req req = JSON.readValue(ctx.body(), Req.class);

            if (req.adminName() == null || req.adminName().isBlank()
        || req.pin() == null || req.pin().length() != 4) {
    ctx.status(400).result("Parent name & 4-digit PIN required");
    return;
}

            UUID householdId = UUID.randomUUID();
                    
            userDAO.save(new User(
                0, 
                req.adminName(), 
                PasswordUtils.hashPassword(req.pin()),
                LocalDateTime.now(), 
                0, 
                "parent",
                householdId
            ));

            String jwt = JwtUtil.generateToken(req.adminName(), "parent");
            ctx.json(Map.of(
                "token", jwt, 
                "householdId", householdId.toString()
            ));
        });

        api.post("/api/login", ctx -> {
            Map<String, String>body = JSON.readValue(ctx.body(), new TypeReference<>() {});
            String username = body.get("username");
            String pin = body.get("pin");

            if (username == null || pin == null) {
                ctx.status(400).result("Username and PIN required");
                return; 
            }

            Optional<User> user = userDAO.findByUsername(username);
            if (user.isEmpty() || !PasswordUtils.checkPassword(pin, user.get().getPasswordHash())) {
                ctx.status(401).result("Invalid credentials");
                return;
            }

            ctx.json(Map.of("token", JwtUtil.generateToken(username, user.get().getRole())));
        });

        api.post("/api/household/kids", ctx -> {
            record KidPayload(String name, int age) {}
            record Req(UUID householdId, List<KidPayload> kids) {}

            Req req = JSON.readValue(ctx.body(), Req.class);

            for (KidPayload k : req.kids()) {
                String hashedPin = PasswordUtils.hashPassword("0000");

                userDAO.save(new User(
                    0, 
                    k.name(), 
                    hashedPin, 
                    LocalDateTime.now(), 
                    k.age(), 
                    "kid",
                    req.householdId()
                ));

                pointsDAO.addPoints(k.name(), 0);
            }

            ctx.status(201);
        });

        api.get("/api/kids/{hh}", ctx -> {
            UUID hh = UUID.fromString(ctx.pathParam("hh"));
            ctx.json(userDAO.getKidsByHousehold(hh));
        });
    }
}
