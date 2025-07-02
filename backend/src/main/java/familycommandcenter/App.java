package familycommandcenter;

import io.javalin.Javalin;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.sql.DataSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.zaxxer.hikari.HikariDataSource;

import familycommandcenter.model.User;
import familycommandcenter.model.UserDAO;
import familycommandcenter.util.JwtUtil;
import familycommandcenter.util.PasswordUtils;
import familycommandcenter.model.Chore;
import familycommandcenter.model.ChoreDataService;
import familycommandcenter.model.PointsBankDAO;
import familycommandcenter.model.Reward;
import familycommandcenter.model.RewardDAO;
import familycommandcenter.model.Redemption;
import familycommandcenter.model.RedemptionDAO;
import familycommandcenter.util.AuthMiddleware;
import familycommandcenter.controllers.AssignController;

public class App {
    public static void main(String[] args) throws SQLException {

        // Construct Data access object 
        DataSource ds = Database.getDataSource();
        Connection conn = ds.getConnection();
        UserDAO userDao = new UserDAO(ds);
        PointsBankDAO pointsBankDAO = new PointsBankDAO(conn);
        RewardDAO rewardDAO = new RewardDAO(conn);
        RedemptionDAO redemptionDAO = new RedemptionDAO(conn);

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
        }).start(7070);

        System.out.println("Javalin server started on port 7070");

        app.post("/api/register", ctx -> {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> body = mapper.readValue(ctx.body(), new TypeReference<>() {});
            String username = body.get("username");
            String password = body.get("password");

            if (username == null || password == null || username.isBlank() || password.length() < 4) {
                ctx.status(400).result("Invalid username or password (must be at least 4 characters)");
                return; 
            }

            Optional<User> existing = userDao.findByUsername(username);
            if (existing.isPresent()) {
                ctx.status(409).result("Username already exists");
                return;
            }

            String hashed = PasswordUtils.hashPassword(password);
            User newUser = new User(0, username, hashed, LocalDateTime.now(), 0, "parent");
            userDao.save(newUser);
            ctx.status(201).result("User registered");
        });

        app.post("/api/login", ctx -> {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> body = mapper.readValue(ctx.body(), new TypeReference<>() {});
            String username = body.get("username");
            String password = body.get("password");

            if (username == null || password == null) {
                ctx.status(400).result("Missing username or password");
                return;
            }

            Optional<User> userOpt = userDao.findByUsername(username);
            if (userOpt.isEmpty()) {
                ctx.status(401).result("Invalid credentials");
                return;
            }

            User user = userOpt.get();
            if (!PasswordUtils.checkPassword(password, user.getPasswordHash())) {
                ctx.status(401).result("Invalid credentials");
                return;
            }

            String jwt = JwtUtil.generateToken(username, user.getRole());
            ctx.json(Map.of("token", jwt));
        });

        app.post("/api/household", ctx -> {
            Map<String, String> body = new ObjectMapper().readValue(ctx.body(), new TypeReference<>() {});
            String adminName = body.get("adminName");
            String pin = body.get("pin");

            if (adminName == null || pin == null || adminName.isBlank() || pin.length() < 4) {
                ctx.status(400).result("Missing or invalid adminName / pin");
                return;
            }

            if (userDao.findByUsername(adminName).isPresent()) {
                ctx.status(400).result("Admin already exists");
                return;
            }

            User newAdmin = new User(0, adminName, PasswordUtils.hashPassword(pin), LocalDateTime.now(), 0, "admin");
            userDao.save(newAdmin);

            String token = JwtUtil.generateToken(adminName, "admin");
            ctx.json(Map.of("token", token));
        });

        app.post("/api/rewards/redeem", ctx -> {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> body = mapper.readValue(ctx.body(), new TypeReference<>() {});
            String username = body.get("username");
            int rewardId = Integer.parseInt(body.get("rewardId"));

            Optional<Reward> rewardOpt = rewardDAO.getRewardById(rewardId);
            if (rewardOpt.isEmpty()) {
                ctx.status(404).result("Reward not found");
                return;
            }

            Reward reward = rewardOpt.get();
            int userPoints = pointsBankDAO.getPoints(username);

            if (userPoints < reward.getCost()) {
                System.out.println("DEBUG: User points: " + userPoints + ", Reward cost: " + reward.getCost());
                ctx.status(400).result("Not enough points for this reward");
                return;
            }

            if (reward.isRequiresApproval()) {
                Redemption redemption = new Redemption();
                redemption.setUsername(username);
                redemption.setRewardId(rewardId);
                redemption.setStatus("pending");
                redemptionDAO.createRedemption(redemption);
                ctx.status(200).result("Reward redemption requested and pending approval");
            } else {
                pointsBankDAO.deductPoints(username, reward.getCost());

                Redemption redemption = new Redemption();
                redemption.setUsername(username);
                redemption.setRewardId(rewardId);
                redemption.setStatus("approved");
                redemptionDAO.createRedemption(redemption);
                ctx.status(200).result("Reward redeemed successfully");
            }
        });

        app.put("/api/rewards/approve", ctx -> {
            Map<String, Integer> body = new ObjectMapper().readValue(ctx.body(), new TypeReference<>() {});
            int redemptionId = body.get("redemptionId");

            boolean success = redemptionDAO.approveRedemption(redemptionId);
            if (success) {
                ctx.status(200).result("Redemption approved and points deducted");
            } else {
                ctx.status(400).result("Approval failed");
            }
        });

        app.get("/api/rewards/available/{username}", ctx -> {
            String username = ctx.pathParam("username");
            try {
                int userPoints = pointsBankDAO.getPoints(username);
                List<Reward> allRewards = rewardDAO.getAllRewards();

                List<Reward> availableRewards = allRewards.stream()
                        .filter(r -> r.getCost() <= userPoints)
                        .toList();

                ctx.json(availableRewards);
            } catch (SQLException e) {
                ctx.status(500).result("Error retrieving available rewards: " + e.getMessage());
            }
        });

        app.get("/api/points/{username}", ctx -> {
            String username = ctx.pathParam("username");
            int points = pointsBankDAO.getPoints(username);
            ctx.json(Map.of("userName", username, "points", points));
        });

        app.get("/api/rewards", ctx -> {
            List<Reward> rewards = rewardDAO.getAllRewards();
            ctx.json(rewards);
        });

        app.get("/api/rewards/redemptions/{username}", ctx -> {
            String username = ctx.pathParam("username");
            List<Redemption> redemptions = redemptionDAO.getRedemptionsForUser(username);
            ctx.json(redemptions);
        });

        app.get("/", ctx -> ctx.result("Family Command Center is LIVE!"));

        app.get("/api/chores", ctx -> ctx.json(ChoreDataService.getAllChores()));

        app.get("/api/family-members", ctx -> {
            ctx.json(new String[] { "Take out the trash", "Feed the dog", "Clean the living room" });
        });

        app.get("/api/chores/by-user", ctx -> {
            try {
                Map<String, List<Chore>> grouped = ChoreDataService.getChoresGroupedByUser();
                ctx.json(grouped);
            } catch (Exception e) {
                ctx.status(500).result("Error retrieving chores: " + e.getMessage());
            }
        });

        app.post("/api/chores", ctx -> {
            Chore newChore = ctx.bodyAsClass(Chore.class);
            try {
                ChoreDataService.validateChore(newChore);
                ChoreDataService.addChore(newChore);
                ctx.status(201).result("Chore added successfully");
            } catch (IllegalArgumentException e) {
                ctx.status(400).result("Validation error: " + e.getMessage());
            } catch (Exception e) {
                ctx.status(500).result("Error adding chore: " + e.getMessage());
            }
        });

        app.delete("/api/chores/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            ChoreDataService.deleteChore(id);
            ctx.status(204);
        });

        app.put("/api/chores/{id}/complete", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            try {
                ChoreDataService.markChoreComplete(id);
                ctx.status(200).result("Chore marked as complete.");
            } catch (Exception e) {
                ctx.status(500).result("Error marking chore as complete: " + e.getMessage());
            }
        });

        app.patch("/api/chores/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Chore updatedChore = ctx.bodyAsClass(Chore.class);
            updatedChore.setId(id);
            try {
                ChoreDataService.validateChore(updatedChore);
                ChoreDataService.updateChore(updatedChore);
                ctx.status(200).result("Chore updated successfully");
            } catch (IllegalArgumentException e) {
                ctx.status(400).result("Validation error: " + e.getMessage());
            } catch (Exception e) {
                ctx.status(500).result("Error updating chore: " + e.getMessage());
            }
        });

        app.get("/api/chores/points", ctx -> {
            try {
                Map<String, Integer> points = ChoreDataService.getTotalPointsByUser();
                ctx.json(points);
            } catch (Exception e) {
                ctx.status(500).result("Error retrieving points: " + e.getMessage());
            }
        });

        app.get("/api/chores/today", ctx -> {
            try {
                List<Chore> todayChores = ChoreDataService.getChoresDueToday();
                ctx.json(todayChores);
            } catch (Exception e) {
                ctx.status(500).result("Error fetching today's chores: " + e.getMessage());
            }
        });

        app.get("/api/chores/overdue", ctx -> {
            try {
                List<Chore> overdueChores = ChoreDataService.getOverdueChores();
                ctx.json(overdueChores);
            } catch (Exception e) {
                ctx.status(500).result("Error fetching overdue chores: " + e.getMessage());
            }
        });

        ChoreDataService choreDataService = new ChoreDataService();
        AssignController assignController = new AssignController(userDao, choreDataService);

        app.post("/api/assign/daily", ctx -> {
            assignController.assignDailyChores();
        });

        app.get("/api/points-bank", ctx -> {
            try {
                Map<String, Integer> pointsBank = ChoreDataService.getAllPointsBank();
                ctx.json(pointsBank);
            } catch (Exception e) {
                ctx.status(500).result("Error retrieving points bank: " + e.getMessage());
            }
        });

        app.before("/api/chores/*", new AuthMiddleware());
        app.before("/api/points-bank", new AuthMiddleware());

        app.put("api/chores/request-complete/{id}", ctx -> {
            int choreId = Integer.parseInt(ctx.pathParam("id"));
            try {
                ChoreDataService.requestChoreCompletion(choreId);
                ctx.status(200).result("Chore marked as pending approval.");
            } catch (SQLException e) {
                ctx.status(500).result("Failed to request chore completion.");
                e.printStackTrace();
            }
        });

        app.patch("/api/chores/{id}/verify", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            try {
                ChoreDataService.verifyChore(id);
                Chore chore = ChoreDataService.getChoreById(id);
                pointsBankDAO.awardPoints(chore.getAssignedTo(), chore.getPoints());
                ctx.status(200).result("Chore verified and points awarded.");
            } catch (Exception e) {
                ctx.status(500).result("Error verifying chore: " + e.getMessage());
            }
        });

        app.patch("/api/chores/{id}/reject", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Chore chore = ChoreDataService.getChoreById(id);
            if (chore != null) {
                chore.setRequestedComplete(false);
                chore.setComplete(false);
                ChoreDataService.updateChore(chore);
                ctx.status(200).result("Chore rejection saved.");
            } else {
                ctx.status(404).result("Chore not found.");
            }
        });

        app.get("api/auth/validate", ctx -> {
            String header = ctx.header("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                ctx.status(401);
                return;
            }
            String token = header.substring(7);
            try {
                JwtUtil.verify(token);
                ctx.status(200).result("OK");
            } catch (Exception ex) {
                ctx.status(401).result("Invalid token");
            }
        });

        app.get("/api/users", ctx -> {
            ctx.json(userDao.findAll());
        });

        app.get("/api/users/kids", ctx -> {
            ctx.json(userDao.getUsersByRole("kid"));
        });
    }
}
