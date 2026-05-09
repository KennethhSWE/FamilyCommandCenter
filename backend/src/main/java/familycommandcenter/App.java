package familycommandcenter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import familycommandcenter.chores.ChoreRepository;
import familycommandcenter.chores.ChoreService;
import familycommandcenter.chores.DailyChoreService;
import familycommandcenter.points.PointsService;
import familycommandcenter.chores.ChoreRepository;
import familycommandcenter.chores.ChoreService;
import familycommandcenter.model.PointsBankDAO;
import familycommandcenter.approvals.ApprovalQueueRepository;
import familycommandcenter.approvals.ApprovalQueueService;
import familycommandcenter.routes.ApprovalQueueRoutes;
import familycommandcenter.rewards.RewardRepository;
import familycommandcenter.rewards.RewardRedemptionRepository;
import familycommandcenter.rewards.RewardService;
import familycommandcenter.routes.PointsRoutes;
import familycommandcenter.model.UserDAO;
import familycommandcenter.routes.AuthRoutes;
import familycommandcenter.routes.ChoreRoutes;
import familycommandcenter.routes.RewardRoutes;
import familycommandcenter.routes.UserRoutes;
import familycommandcenter.util.AuthMiddleware;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;

import javax.sql.DataSource;
import java.sql.SQLException;

public final class App {

    public static void main(String[] args) throws SQLException {
        DataSource ds = Database.getDataSource();

        UserDAO userDAO = new UserDAO(ds);
        PointsBankDAO pointsDAO = new PointsBankDAO(ds);

        PointsService pointsService = new PointsService(pointsDAO);

        ApprovalQueueRepository approvalQueueRepository = new ApprovalQueueRepository(ds);
        ApprovalQueueService approvalQueueService = new ApprovalQueueService(approvalQueueRepository);
        approvalQueueService.makeSureTableExists();

        ChoreRepository choreRepository = new ChoreRepository(ds);
        ChoreService choreService = new ChoreService(
                choreRepository,
                pointsService,
                approvalQueueService);
        DailyChoreService dailyChoreService = new DailyChoreService(
                userDAO,
                choreRepository,
                pointsService);

        RewardRepository rewardRepository = new RewardRepository(ds);
        RewardRedemptionRepository rewardRedemptionRepository = new RewardRedemptionRepository(ds);
        RewardService rewardService = new RewardService(
                rewardRepository,
                rewardRedemptionRepository,
                pointsService,
                approvalQueueService);

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        Javalin api = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
            config.jsonMapper(new JavalinJackson(mapper));
        }).start(7070);

        System.out.println("Javalin listening on :7070");

        AuthRoutes.register(api, userDAO, pointsDAO);
        ChoreRoutes.register(api, choreService);
        RewardRoutes.register(api, rewardService);
        PointsRoutes.register(api, pointsService);
        UserRoutes.register(api, userDAO);
        ApprovalQueueRoutes.register(
                api,
                approvalQueueService,
                choreService,
                rewardService);

        api.post("/api/assign/daily", ctx -> ctx.json(dailyChoreService.runMorningChoreSweep()));

        api.before("/api/chores/*", new AuthMiddleware());
        api.before("/api/rewards/*", new AuthMiddleware());
        api.before("/api/approvals/*", new AuthMiddleware());
        api.before("/api/points/*", new AuthMiddleware());
        api.before("/api/users/*", new AuthMiddleware());
        api.before("/api/assign/*", new AuthMiddleware());
    }
}