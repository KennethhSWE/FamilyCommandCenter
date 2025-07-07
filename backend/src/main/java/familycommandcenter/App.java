package familycommandcenter;

import io.javalin.Javalin;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import javax.sql.DataSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import familycommandcenter.model.*;
import familycommandcenter.util.*;
import familycommandcenter.controllers.AssignController;

public class App {

    public static void main(String[] args) throws SQLException {

        /* ────────────────────────── DAL HELPERS ────────────────────────── */
        DataSource      ds             = Database.getDataSource();     // pooled
        Connection      conn           = ds.getConnection();           // still used by a few older DAOs
        UserDAO         userDao        = new UserDAO(ds);
        PointsBankDAO   pointsBankDAO  = new PointsBankDAO(conn);
        RewardDAO       rewardDAO      = new RewardDAO(conn);
        RedemptionDAO   redemptionDAO  = new RedemptionDAO(conn);

        /* ────────────────────────── JETTY/JAVALIN ──────────────────────── */
        Javalin app = Javalin.create(cfg -> cfg.plugins
                                      .enableCors(cors -> cors.add(it -> it.anyHost())))
                             .start(7070);

        System.out.println("Javalin server started on port 7070");

        /* =================================================================
         *  AUTH + ON-BOARDING
         * ================================================================= */

        // (Legacy) generic register   ── mostly unused after household flow
        app.post("/api/register", ctx -> {
            Map<String,String> body = new ObjectMapper().readValue(ctx.body(), new TypeReference<>() {});
            String username = body.get("username");
            String password = body.get("password");

            if (username == null || password == null || username.isBlank() || password.length() < 4) {
                ctx.status(400).result("Username required • PIN ≥ 4 digits");
                return;
            }
            if (userDao.findByUsername(username).isPresent()) {
                ctx.status(409).result("Username already exists");
                return;
            }

            User u = new User(
                    0,                                          // user id 
                    username,                                   // username
                    PasswordUtils.hashPassword(password),       //hashed password
                    LocalDateTime.now(),                        //localtime stamp createdAt
                    0,                                          //age
                    "parent",                                   //role (parent or kid)
                    java.util.UUID.randomUUID()                 //householdId
            );
            userDao.save(u);
            ctx.status(201);
        });

        // First-time “Create household”
        app.post("/api/household", ctx -> {
            Map<String,String> body = new ObjectMapper().readValue(ctx.body(), new TypeReference<>() {});
            String adminName = body.get("adminName");
            String pin       = body.get("pin");

            if (adminName == null || adminName.isBlank() || pin == null || pin.length() != 4) {
                ctx.status(400).result("Parent name & 4-digit PIN required");
                return;
            }
            if (userDao.findByUsername(adminName).isPresent()) {
                ctx.status(400).result("That name is already taken");
                return;
            }

            java.util.UUID householdId = java.util.UUID.randomUUID();

            User parent = new User(
                    0,
                    adminName,
                    PasswordUtils.hashPassword(pin),
                    LocalDateTime.now(),
                    0,
                    "parent",
                    householdId);

            userDao.save(parent);

            String token = JwtUtil.generateToken(adminName, "parent");
            ctx.json(Map.of("token", token,
                            "householdId", householdId.toString()));
        });

        // Login (parent or kid)
        app.post("/api/login", ctx -> {
            Map<String,String> body = new ObjectMapper().readValue(ctx.body(), new TypeReference<>() {});
            String username = body.get("username");
            String password = body.get("password");

            if (username == null || password == null) {
                ctx.status(400).result("Missing username or password");
                return;
            }
            Optional<User> opt = userDao.findByUsername(username);
            if (opt.isEmpty() || !PasswordUtils.checkPassword(password, opt.get().getPasswordHash())) {
                ctx.status(401).result("Invalid credentials");
                return;
            }
            String jwt = JwtUtil.generateToken(username, opt.get().getRole());
            ctx.json(Map.of("token", jwt));
        });

        /* =================================================================
         *  REWARDS & POINTS
         * ================================================================= */

        app.post("/api/rewards/redeem", ctx -> {
            Map<String,String> body = new ObjectMapper().readValue(ctx.body(), new TypeReference<>() {});
            String username = body.get("username");
            int    rewardId = Integer.parseInt(body.get("rewardId"));

            Optional<Reward> rewardOpt = rewardDAO.getRewardById(rewardId);
            if (rewardOpt.isEmpty()) { ctx.status(404).result("Reward not found"); return; }

            Reward reward  = rewardOpt.get();
            int    points  = pointsBankDAO.getPoints(username);

            if (points < reward.getCost()) {
                ctx.status(400).result("Not enough points"); return;
            }

            if (reward.isRequiresApproval()) {
                Redemption r = new Redemption(username, rewardId, "pending");
                redemptionDAO.createRedemption(r);
                ctx.status(200).result("Redemption pending approval");
            } else {
                pointsBankDAO.deductPoints(username, reward.getCost());
                Redemption r = new Redemption(username, rewardId, "approved");
                redemptionDAO.createRedemption(r);
                ctx.status(200).result("Reward redeemed");
            }
        });

        app.put("/api/rewards/approve", ctx -> {
            int redemptionId = new ObjectMapper().readValue(ctx.body(), new TypeReference<Map<String,Integer>>(){}).get("redemptionId");
            if (redemptionDAO.approveRedemption(redemptionId))
                ctx.status(200);
            else  ctx.status(400).result("Approval failed");
        });

        /* =================================================================
         *  CHORES (all original handlers kept)
         * ================================================================= */
        app.post("/api/household/kids", ctx -> {
            record KidPayload(String name, int age) {}
            record KidsRequest(java.util.UUID householdId, java.util.List<KidPayload> kids) {}

            KidsRequest req = new ObjectMapper().readValue(ctx.body(), KidsRequest.class);

            for (KidPayload k : req.kids()) {
                User kid = new User(
                    0,
                    k.name(),
                    PasswordUtils.hashPassword("0000"),
                    LocalDateTime.now(), 
                    k.age(),
                    "kid",
                    req.householdId());
                userDao.save(kid);
            }
            ctx.status(201).result("Kids saved");
        });
        app.get("/api/chores",             ctx -> ctx.json(ChoreDataService.getAllChores()));
        app.get("/api/chores/by-user",     ctx -> ctx.json(ChoreDataService.getChoresGroupedByUser()));
        app.get("/api/chores/today",       ctx -> ctx.json(ChoreDataService.getChoresDueToday()));
        app.get("/api/chores/overdue",     ctx -> ctx.json(ChoreDataService.getOverdueChores()));
        app.post("/api/chores",            ctx -> { Chore c = ctx.bodyAsClass(Chore.class); ChoreDataService.addChore(c); ctx.status(201);} );
        app.delete("/api/chores/{id}",     ctx -> { ChoreDataService.deleteChore(Integer.parseInt(ctx.pathParam("id"))); ctx.status(204);} );

        app.get("/api/kids/{hh}", ctx -> {
            java.util.UUID hhId = java.util.UUID.fromString(ctx.pathParam("hh"));
            ctx.json( userDao.getKidsByHousehold(hhId) );
        });

        /* =================================================================
         *  HOUSEKEEPING
         * ================================================================= */

        AssignController assignCtl = new AssignController(userDao);
        app.post("/api/assign/daily", ctx -> assignCtl.assignDailyChores());

        // simple health
        app.get("/", ctx -> ctx.result("Family Command Center LIVE"));

        /* =================================================================
         *  TOKEN VALIDATE + AUTH MIDDLEWARE
         * ================================================================= */

        app.get("/api/auth/validate", ctx -> {
            String hdr = ctx.header("Authorization");
            if (hdr == null || !hdr.startsWith("Bearer ")) { ctx.status(401); return; }
            try { JwtUtil.verify(hdr.substring(7)); ctx.status(200); }
            catch (Exception e) { ctx.status(401).result("Invalid token"); }
        });

        app.before("/api/chores/*"   , new AuthMiddleware());
        app.before("/api/points-bank", new AuthMiddleware());

        /* =================================================================
         *  USERS
         * ================================================================= */

        app.get("/api/users"      , ctx -> ctx.json(userDao.findAll()));
        app.get("/api/users/kids" , ctx -> ctx.json(userDao.getUsersByRole("kid")));
    }
}

