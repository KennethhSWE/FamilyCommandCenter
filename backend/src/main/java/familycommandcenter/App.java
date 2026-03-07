package familycommandcenter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import familycommandcenter.controllers.AssignController;
import familycommandcenter.model.*;
import familycommandcenter.util.*;
import io.javalin.Javalin;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

public final class App {

    private static final ObjectMapper JSON = new ObjectMapper();

    public static void main(String[] args) throws SQLException {
        DataSource ds = Database.getDataSource();

        UserDAO userDAO = new UserDAO(ds);
        PointsBankDAO pointsDAO = new PointsBankDAO(ds);
        RewardDAO rewardDAO = new RewardDAO(ds);
        RedemptionDAO redemptionDAO = new RedemptionDAO(ds);
        AssignController assignController = new AssignController(userDAO);

        Javalin api = Javalin.create(config ->
                config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()))
        ).start(7070);

        System.out.println("Javalin listening on :7070");

        /*
         * AUTH + ONBOARDING
         */
        api.post("/api/household", ctx -> {
            record Req(String adminName, String pin) {}

            Req req = JSON.readValue(ctx.body(), Req.class);

            if (req.adminName() == null || req.adminName().isBlank()
                    || req.pin() == null || req.pin().length() != 4) {
                ctx.status(400).result("Parent name & 4-digit PIN required");
                return;
            }

            if (userDAO.findByUsername(req.adminName()).isPresent()) {
                ctx.status(409).result("That name is already taken");
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
            Map<String, String> body = JSON.readValue(ctx.body(), new TypeReference<>() {});
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

        /*
         * ONBOARDING: KIDS + CHORES
         */
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

        api.post("/api/chores/bulk", ctx -> {
            try {
                List<Chore> chores = JSON.readValue(ctx.body(), new TypeReference<>() {});
                for (Chore chore : chores) {
                    ChoreDataService.addChore(chore);
                }
                ctx.status(201).result("Chores added");
            } catch (Exception e) {
                System.err.println("Error saving chores");
                e.printStackTrace();
                System.err.println("Request body: " + ctx.body());
                ctx.status(500).result("Failed to save chores");
            }
        });

        /*
         * CHORES
         */
        api.get("/api/chores", ctx -> ctx.json(ChoreDataService.getAllChores()));
        api.get("/api/chores/today", ctx -> ctx.json(ChoreDataService.getChoresDueToday()));
        api.get("/api/chores/overdue", ctx -> ctx.json(ChoreDataService.getOverdueChores()));

        api.get("/api/chores/kid/{username}", ctx -> {
            String username = ctx.pathParam("username");
            ctx.json(ChoreDataService.getIncompleteByKid(username));
        });

        api.post("/api/chores", ctx -> {
            Chore chore = ctx.bodyAsClass(Chore.class);
            ChoreDataService.addChore(chore);
            ctx.status(201);
        });

        api.delete("/api/chores/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            ChoreDataService.deleteChore(id);
            ctx.status(204);
        });

        api.post("/api/chores/complete/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));

            try {
                boolean ok = ChoreDataService.markComplete(id);
                if (ok) {
                    ctx.status(200).json(Map.of("id", id, "complete", true));
                } else {
                    ctx.status(404).result("Chore not found");
                }
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Failed to complete chore");
            }
        });

        /*
         * REWARDS
         */
        api.post("/api/rewards/redeem", ctx -> {
            record RedeemReq(String username, int rewardId) {}

            RedeemReq req = JSON.readValue(ctx.body(), RedeemReq.class);

            Reward reward = rewardDAO.getRewardById(req.rewardId()).orElseThrow();
            int userPoints = pointsDAO.getPoints(req.username());

            if (userPoints < reward.getCost()) {
                ctx.status(400).result("Not enough points");
                return;
            }

            if (reward.isRequiresApproval()) {
                redemptionDAO.createRedemption(new Redemption(req.username(), req.rewardId(), "pending"));
            } else {
                pointsDAO.deductPoints(req.username(), reward.getCost());
                redemptionDAO.createRedemption(new Redemption(req.username(), req.rewardId(), "approved"));
            }

            ctx.status(200);
        });

        api.post("/api/rewards/bulk", ctx -> {
            System.out.println("Bulk rewards posted: " + ctx.body());
            ctx.status(200);
        });

        api.put("/api/rewards/approve/{redemptionId}", ctx -> {
            int redemptionId = Integer.parseInt(ctx.pathParam("redemptionId"));

            if (redemptionDAO.approveRedemption(redemptionId)) {
                ctx.status(200);
            } else {
                ctx.status(400).result("Redemption not found");
            }
        });

        api.get("/api/points/{username}", ctx -> {
            String username = ctx.pathParam("username");

            try {
                int totalPoints = pointsDAO.getPoints(username);
                ctx.json(Map.of(
                        "user_name", username,
                        "total_points", totalPoints
                ));
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error fetching points");
            }
        });

        /*
         * ADMIN DAILY ASSIGNMENT
         */
        api.post("/api/assign/daily", ctx -> assignController.assignDailyChores());

        /*
         * AUTH GUARDS
         */
        api.before("/api/chores/*", new AuthMiddleware());
        api.before("/api/points-bank/*", new AuthMiddleware());

        /*
         * MISC
         */
        api.get("/", ctx -> ctx.result("✅ Family Command Center LIVE"));
        api.get("/api/users", ctx -> ctx.json(userDAO.findAll()));
        api.get("/api/users/kids", ctx -> ctx.json(userDAO.getUsersByRole("kid")));
    }
}