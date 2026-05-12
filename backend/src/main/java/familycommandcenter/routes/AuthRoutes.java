package familycommandcenter.routes;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import familycommandcenter.model.PointsBankDAO;
import familycommandcenter.model.User;
import familycommandcenter.model.UserDAO;
import familycommandcenter.util.AuthContext;
import familycommandcenter.util.AuthUser;
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
        // Utility class
    }

    public static void register(Javalin api, UserDAO userDAO, PointsBankDAO pointsDAO) {

        api.post("/api/household", ctx -> {
            record Req(String adminName, String pin) {
            }

            Req req = JSON.readValue(ctx.body(), Req.class);

            if (req.adminName() == null || req.adminName().isBlank()
                    || req.pin() == null || req.pin().length() != 4) {
                ctx.status(400).result("Parent name & 4-digit PIN required");
                return;
            }

            String parentName = req.adminName().trim();

            if (userDAO.parentUsernameExists(parentName)) {
                ctx.status(409).result("That parent name is already taken");
                return;
            }

            UUID householdId = UUID.randomUUID();

            userDAO.save(new User(
                    0,
                    parentName,
                    PasswordUtils.hashPassword(req.pin()),
                    LocalDateTime.now(),
                    0,
                    "parent",
                    householdId));

            Optional<User> savedParent = userDAO.findParentByUsername(parentName);

            if (savedParent.isEmpty()) {
                ctx.status(500).result("Parent user was not created");
                return;
            }

            User parent = savedParent.get();

            String jwt = JwtUtil.generateToken(
                    parent.getId(),
                    parent.getUsername(),
                    parent.getRole(),
                    parent.getHouseholdId());

            ctx.json(Map.of(
                    "token", jwt,
                    "householdId", householdId.toString()));
        });

        api.post("/api/login", ctx -> {
            Map<String, String> body = JSON.readValue(
                    ctx.body(),
                    new TypeReference<>() {
                    });

            String username = body.get("username");
            String pin = body.get("pin");

            if (username == null || username.isBlank()
                    || pin == null || pin.isBlank()) {
                ctx.status(400).result("Username and PIN required");
                return;
            }

            Optional<User> possibleUser = userDAO.findParentByUsername(username.trim());

            if (possibleUser.isEmpty()
                    || !PasswordUtils.checkPassword(
                            pin,
                            possibleUser.get().getPasswordHash())) {
                ctx.status(401).result("Invalid credentials");
                return;
            }

            User user = possibleUser.get();

            String jwt = JwtUtil.generateToken(
                    user.getId(),
                    user.getUsername(),
                    user.getRole(),
                    user.getHouseholdId());

            ctx.json(Map.of(
                    "token", jwt,
                    "householdId", user.getHouseholdId().toString(),
                    "role", user.getRole(),
                    "username", user.getUsername()));
        });

        api.post("/api/household/kids", ctx -> {
            AuthContext.requireParent(ctx);
            AuthUser authUser = AuthContext.requireUser(ctx);

            record KidPayload(String name, int age) {
            }

            /*
             * householdId may still be sent by the old frontend payload.
             * We intentionally ignore it. The trusted household comes from the JWT.
             */
            record Req(UUID householdId, List<KidPayload> kids) {
            }

            Req req = JSON.readValue(ctx.body(), Req.class);

            if (req.kids() == null || req.kids().isEmpty()) {
                ctx.status(400).result("At least one kid is required");
                return;
            }

            UUID householdId = authUser.getHouseholdId();

            for (KidPayload kid : req.kids()) {
                if (kid.name() == null || kid.name().isBlank()) {
                    ctx.status(400).result("Kid name is required");
                    return;
                }

                if (kid.age() <= 0) {
                    ctx.status(400).result("Kid age must be greater than 0");
                    return;
                }

                String kidName = kid.name().trim();

                if (userDAO.kidNameExistsInHousehold(kidName, householdId)) {
                    ctx.status(409).result("Kid name already exists in this household");
                    return;
                }

                String hashedPin = PasswordUtils.hashPassword("0000");

                userDAO.save(new User(
                        0,
                        kidName,
                        hashedPin,
                        LocalDateTime.now(),
                        kid.age(),
                        "kid",
                        householdId));

                pointsDAO.addPoints(kidName, 0, householdId);
            }

            ctx.status(201);
        });

        api.get("/api/kids", ctx -> {
            AuthUser authUser = AuthContext.requireUser(ctx);

            try {
                var kids = userDAO.getKidsByHousehold(authUser.getHouseholdId());
                ctx.json(kids);
            } catch (Exception e) {
                System.err.println("Failed loading kids for household: "
                        + authUser.getHouseholdId());
                e.printStackTrace();
                ctx.status(500).result("Failed to load kids");
            }
        });

        /*
         * Temporary compatibility route.
         * The path household ID is ignored on purpose.
         * Household access comes from the authenticated token.
         */
        api.get("/api/kids/{hh}", ctx -> {
            AuthUser authUser = AuthContext.requireUser(ctx);

            try {
                var kids = userDAO.getKidsByHousehold(authUser.getHouseholdId());
                ctx.json(kids);
            } catch (Exception e) {
                System.err.println("Failed loading kids for household: "
                        + authUser.getHouseholdId());
                e.printStackTrace();
                ctx.status(500).result("Failed to load kids");
            }
        });
    }
}