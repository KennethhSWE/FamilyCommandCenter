package familycommandcenter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import familycommandcenter.controllers.AssignController;
import familycommandcenter.model.PointsBankDAO;
import familycommandcenter.model.RedemptionDAO;
import familycommandcenter.model.RewardDAO;
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
        RewardDAO rewardDAO = new RewardDAO(ds);
        RedemptionDAO redemptionDAO = new RedemptionDAO(ds);
        AssignController assignController = new AssignController(userDAO);

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        Javalin api = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
            config.jsonMapper(new JavalinJackson(mapper));
        }).start(7070);

        System.out.println("Javalin listening on :7070");

        AuthRoutes.register(api, userDAO, pointsDAO);
        ChoreRoutes.register(api);
        RewardRoutes.register(api, rewardDAO, pointsDAO, redemptionDAO);
        UserRoutes.register(api, userDAO);

        api.post("/api/assign/daily", ctx -> assignController.assignDailyChores());

        api.before("/api/chores/*", new AuthMiddleware());
        api.before("/api/rewards/*", new AuthMiddleware());
        api.before("/api/points/*", new AuthMiddleware());
        api.before("/api/users/*", new AuthMiddleware());
        api.before("/api/assign/*", new AuthMiddleware());
    }
}