package familycommandcenter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import familycommandcenter.approvals.ApprovalQueueRepository;
import familycommandcenter.approvals.ApprovalQueueService;
import familycommandcenter.chores.ChoreRepository;
import familycommandcenter.chores.ChoreService;
import familycommandcenter.chores.DailyChoreService;
import familycommandcenter.parent.ParentPinRepository;
import familycommandcenter.parent.ParentPinService;
import familycommandcenter.routes.ParentPinRoutes;
import familycommandcenter.model.PointsBankDAO;
import familycommandcenter.calendar.CalendarRepository;
import familycommandcenter.calendar.CalendarService;
import familycommandcenter.routes.CalendarRoutes;
import familycommandcenter.points.PointTransactionRepository;
import familycommandcenter.model.UserDAO;
import familycommandcenter.notifications.NotificationRepository;
import familycommandcenter.notifications.NotificationService;
import familycommandcenter.points.PointsService;
import familycommandcenter.rewards.RewardRepository;
import familycommandcenter.rewards.RewardRedemptionRepository;
import familycommandcenter.rewards.RewardService;
import familycommandcenter.routes.ApprovalQueueRoutes;
import familycommandcenter.routes.AuthRoutes;
import familycommandcenter.routes.ChoreRoutes;
import familycommandcenter.routes.NotificationRoutes;
import familycommandcenter.routes.PointsRoutes;
import familycommandcenter.routes.RewardRoutes;
import familycommandcenter.routes.UserRoutes;
import familycommandcenter.util.AuthMiddleware;
import familycommandcenter.util.AuthContext;
import familycommandcenter.rewards.RewardSuggestionRepository;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;
import com.fasterxml.jackson.databind.SerializationFeature;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.UUID;

public final class App {

        public static void main(String[] args) throws SQLException {
                DataSource ds = Database.getDataSource();

                UserDAO userDAO = new UserDAO(ds);
                userDAO.makeSureUserTableIsReady();
                PointsBankDAO pointsDAO = new PointsBankDAO(ds);
                pointsDAO.makeSureTableExists();

                PointTransactionRepository pointTransactionRepository = new PointTransactionRepository(ds);
                pointTransactionRepository.makeSureTableExists();

                ParentPinRepository parentPinRepository = new ParentPinRepository(ds);
                ParentPinService parentPinService = new ParentPinService(parentPinRepository);
                parentPinService.makeSureStarterPinExists();

                PointsService pointsService = new PointsService(
                                pointsDAO,
                                pointTransactionRepository);
                NotificationRepository notificationRepository = new NotificationRepository(ds);
                NotificationService notificationService = new NotificationService(notificationRepository);
                notificationService.makeSureTableExists();

                CalendarRepository calendarRepository = new CalendarRepository(ds);
                CalendarService calendarService = new CalendarService(calendarRepository);
                calendarService.makeSureTableExists();

                ApprovalQueueRepository approvalQueueRepository = new ApprovalQueueRepository(ds);
                ApprovalQueueService approvalQueueService = new ApprovalQueueService(
                                approvalQueueRepository,
                                notificationService);
                approvalQueueService.makeSureTableExists();

                ChoreRepository choreRepository = new ChoreRepository(ds);
                choreRepository.makeSureChoreTableIsReady();

                ChoreService choreService = new ChoreService(
                                choreRepository,
                                pointsService,
                                approvalQueueService);
                DailyChoreService dailyChoreService = new DailyChoreService(
                                userDAO,
                                choreRepository,
                                pointsService);

                RewardRepository rewardRepository = new RewardRepository(ds);
                rewardRepository.makeSureRewardTableIsReady();

                RewardRedemptionRepository rewardRedemptionRepository = new RewardRedemptionRepository(ds);
                rewardRedemptionRepository.makeSureTableExists();

                RewardSuggestionRepository rewardSuggestionRepository = new RewardSuggestionRepository(ds);
                rewardSuggestionRepository.makeSureTableExists();
                RewardService rewardService = new RewardService(
                                rewardRepository,
                                rewardRedemptionRepository,
                                rewardSuggestionRepository,
                                pointsService,
                                approvalQueueService);

                ObjectMapper mapper = new ObjectMapper();
                mapper.registerModule(new JavaTimeModule());
                mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

                Javalin api = Javalin.create(config -> {
                        config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
                        config.jsonMapper(new JavalinJackson(mapper));
                });

                int port = getPort();

                api.start(port);

                System.out.println("Javalin listening on :" + port);

                AuthRoutes.register(api, userDAO, pointsDAO);
                ParentPinRoutes.register(api, parentPinService);
                ChoreRoutes.register(api, choreService);
                RewardRoutes.register(api, rewardService);
                ApprovalQueueRoutes.register(
                                api,
                                approvalQueueService,
                                choreService,
                                rewardService);
                NotificationRoutes.register(api, notificationService);
                CalendarRoutes.register(api, calendarService);
                PointsRoutes.register(api, pointsService);
                UserRoutes.register(api, userDAO);

                api.post("/api/assign/daily", ctx -> {
                        UUID householdId = AuthContext.requireHouseholdId(ctx);

                        ctx.json(dailyChoreService.runMorningChoreSweep(householdId));
                });

                api.before("/api/parent-pin/*", new AuthMiddleware());

                api.before("/api/chores", new AuthMiddleware());
                api.before("/api/chores/*", new AuthMiddleware());

                api.before("/api/rewards", new AuthMiddleware());
                api.before("/api/rewards/*", new AuthMiddleware());

                api.before("/api/approvals/*", new AuthMiddleware());
                api.before("/api/notifications/*", new AuthMiddleware());
                api.before("/api/calendar/*", new AuthMiddleware());
                api.before("/api/points/*", new AuthMiddleware());
                api.before("/api/users", new AuthMiddleware());
                api.before("/api/users/*", new AuthMiddleware());
                api.before("/api/assign/*", new AuthMiddleware());
                api.before("/api/household/kids", new AuthMiddleware());
                api.before("/api/kids", new AuthMiddleware());
                api.before("/api/kids/*", new AuthMiddleware());

        }

        private static int getPort() {
                String rawPort = System.getenv("PORT");

                if (rawPort == null || rawPort.isBlank()) {
                        return 7070;
                }

                try {
                        return Integer.parseInt(rawPort);
                } catch (NumberFormatException e) {
                        return 7070;
                }
        }
}