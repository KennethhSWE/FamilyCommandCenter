package familycommandcenter.routes;

import familycommandcenter.model.UserDAO;
import io.javalin.Javalin;

public final class UserRoutes {
    
    private UserRoutes() {
        //utility class
    }

    public static void register(Javalin api, UserDAO userDAO) {
        api.get("/", ctx -> ctx.result(" Family Command Center LIVE"));
        api.get("/api/users", ctx -> ctx.json(userDAO.findAll()));
        api.get("/api/users/kids", ctx -> ctx.json(userDAO.getUsersByRole("kid")));
    }
}
