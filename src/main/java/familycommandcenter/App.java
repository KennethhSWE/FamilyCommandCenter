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
import familycommandcenter.util.AuthMiddleware;

public class App {
    public static void main(String[] args) throws SQLException {
        Connection conn = Database.getConnection();
        if (conn == null) {
            System.err.println("Failed to connect to PostgreSQL");
            return;
        }

        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> {
                cors.add(it -> {
                    it.anyHost();
                });
            });
        }).start(7070);

        System.out.println("Javalin server started on port 7070");

        UserDAO userDao = new UserDAO(conn);

        app.post("/api/register", ctx -> {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> body = mapper.readValue(ctx.body(), new TypeReference<>() {});
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
            Map<String, String> body = mapper.readValue(ctx.body(), new TypeReference<>() {});
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

        app.patch("/api/chores/{id}/verify", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            try {
                ChoreDataService.verifyChore(id);
                Chore chore = ChoreDataService.getChoreById(id);
                ChoreDataService.awardPointsToUser(chore.getAssignedTo(), chore.getPoints());
                ctx.status(200).result("Chore verified and points awarded.");
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Error verifying chore: " + e.getMessage());
            }
        });

        app.get("/api/points-bank", ctx -> {
            try {
                Map<String, Integer> pointsBank = ChoreDataService.getAllPointsBank();
                ctx.json(pointsBank);
            } catch (Exception e) {
                ctx.status(500).result("Error retrieving points bank: " + e.getMessage());
            }
        });

        //  Secure ALL /api/chores/* routes (GET, POST, PATCH, etc.)
        app.before("/api/chores/*", new AuthMiddleware());

        //  Protect points bank access
        app.before("/api/points-bank", new AuthMiddleware());
    }
}
