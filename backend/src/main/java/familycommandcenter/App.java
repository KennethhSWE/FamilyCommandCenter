package familycommandcenter;

import io.javalin.Javalin;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

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

public class App {
    public static void main(String[] args) throws SQLException {
        Connection conn = Database.getConnection();
        if (conn == null) {
            System.err.println("Failed to connect to PostgreSQL");
            return;
        }

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
        }).start(7070);

        System.out.println("Javalin server started on port 7070");

        UserDAO userDao = new UserDAO(conn);
        PointsBankDAO pointsBankDAO = new PointsBankDAO(conn);
        RewardDAO rewardDAO = new RewardDAO(conn);
        RedemptionDAO redemptionDAO = new RedemptionDAO(conn);

        app.post("/api/register", ctx -> {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> body = mapper.readValue(ctx.body(), new TypeReference<>() {
            });
            String username = body.get("username");
            String password = body.get("password");

            if (username == null || password == null || username.isBlank() || password.length() < 6) {
                ctx.status(400).result("Invalid username or password (must be at least 6 characters)");
                return;
            }

            Optional<User> existing = userDao.getUserByUsername(username);
            if (existing.isPresent()) {
                ctx.status(409).result("Username already exists");
                return;
            }

            String hashed = PasswordUtils.hashPassword(password);
            User newUser = new User(username, hashed);
            boolean success = userDao.registerUser(newUser);

            if (success) {
                ctx.status(201).result("User registered");
            } else {
                ctx.status(500).result("Registration failed");
            }
        });

        app.post("/api/login", ctx -> {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> body = mapper.readValue(ctx.body(), new TypeReference<>() {
            });
            String username = body.get("username");
            String password = body.get("password");

            if (username == null || password == null) {
                ctx.status(400).result("Missing username or password");
                return;
            }

            Optional<User> userOpt = userDao.getUserByUsername(username);
            if (userOpt.isEmpty()) {
                ctx.status(401).result("Invalid credentials");
                return;
            }

            User user = userOpt.get();
            if (!PasswordUtils.checkPassword(password, user.getPasswordHash())) {
                ctx.status(401).result("Invalid credentials");
                return;
            }

            String jwt = JwtUtil.generateToken(username);
            ctx.json(Map.of("token", jwt));
        });

        // Chore verification
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

        // Reward Redemption Endpoint
        app.post("/api/rewards/redeem", ctx -> {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> body = mapper.readValue(ctx.body(), new TypeReference<>() {
            });
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
                // DEBUG statment to see user points and reward cost is terminal
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

        // Approve or reject a redemption request
        app.put("/api/rewards/approve", ctx -> {
            Map<String, Integer> body = new ObjectMapper().readValue(ctx.body(), new TypeReference<>() {
            });
            int redemptionId = body.get("redemptionId");

            boolean success = redemptionDAO.approveRedemption(redemptionId);
            if (success) {
                ctx.status(200).result("Redemption approved and points deducted");
            } else {
                ctx.status(400).result("Approval failed (possibly already approved or insufficient points)");
            }
        });

        // List available rewards per user
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

        // List total points by user
        app.get("/api/points/{username}", ctx -> {
            String username = ctx.pathParam("username");
            PointsBankDAO pointsDAO = new PointsBankDAO(conn);
            int points = pointsDAO.getPoints(username);
            ctx.json(Map.of("userName", username, "points", points));
        });

        // Rewards listing
        app.get("/api/rewards", ctx -> {
            List<Reward> rewards = rewardDAO.getAllRewards();
            ctx.json(rewards);
        });

        // Redemption list for user
        app.get("/api/rewards/redemptions/{username}", ctx -> {
            String username = ctx.pathParam("username");
            List<Redemption> redemptions = redemptionDAO.getRedemptionsForUser(username);
            ctx.json(redemptions);
        });

        // Redemption approval endpoint to approve or reject a request for redemption

        // -- Existing endpoints unchanged below --

        app.get("/", ctx -> ctx.result("Family Command Center is LIVE!"));

        app.get("/api/chores", ctx -> ctx.json(ChoreDataService.getAllChores()));

        app.get("/api/family-members", ctx -> {
            ctx.json(new String[] { "Take out the trash", "Feed the dog", "Clean the living room" });
        });

        // Get chores by user endpoint
        app.get("/api/chores/by-user", ctx -> {
            try {
                Map<String, List<Chore>> grouped = ChoreDataService.getChoresGroupedByUser();
                ctx.json(grouped);
            } catch (Exception e) {
                ctx.status(500).result("Error retrieving chores: " + e.getMessage());
            }
        });

        // Add chore endpoint
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

        // Delete chore endpoint
        app.delete("/api/chores/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            ChoreDataService.deleteChore(id);
            ctx.status(204);
        });

        // Mark chore as complete endpoint
        app.put("/api/chores/{id}/complete", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            try {
                ChoreDataService.markChoreComplete(id);
                ctx.status(200).result("Chore marked as complete.");
            } catch (Exception e) {
                ctx.status(500).result("Error marking chore as complete: " + e.getMessage());
            }
        });

        // Update chore endpoint
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

        // Points endpoint
        app.get("/api/chores/points", ctx -> {
            try {
                Map<String, Integer> points = ChoreDataService.getTotalPointsByUser();
                ctx.json(points);
            } catch (Exception e) {
                ctx.status(500).result("Error retrieving points: " + e.getMessage());
            }
        });

        // Today's chores endpoint
        app.get("/api/chores/today", ctx -> {
            try {
                List<Chore> todayChores = ChoreDataService.getChoresDueToday();
                ctx.json(todayChores);
            } catch (Exception e) {
                ctx.status(500).result("Error fetching today's chores: " + e.getMessage());
            }
        });

        // Overdue chores endpoint
        app.get("/api/chores/overdue", ctx -> {
            try {
                List<Chore> overdueChores = ChoreDataService.getOverdueChores();
                ctx.json(overdueChores);
            } catch (Exception e) {
                ctx.status(500).result("Error fetching overdue chores: " + e.getMessage());
            }
        });

        // Points bank endpoint
        app.get("/api/points-bank", ctx -> {
            try {
                Map<String, Integer> pointsBank = ChoreDataService.getAllPointsBank();
                ctx.json(pointsBank);
            } catch (Exception e) {
                ctx.status(500).result("Error retrieving points bank: " + e.getMessage());
            }
        });

        // Secure routes
        app.before("/api/chores/*", new AuthMiddleware());
        app.before("/api/points-bank", new AuthMiddleware());

        app.put("/chores/request-complete/{id}", ctx -> {
            int choreId = Integer.parseInt(ctx.pathParam("id"));
            try{
                ChoreDataService.requestChoreCompletion(choreId);
                ctx.status(200).result("Chore marked as pending approval.");
            }catch (SQLException e) {
                ctx.status(500).result("Failed to request chore completion.");
                e.printStackTrace();
            }
        });
    }
}
