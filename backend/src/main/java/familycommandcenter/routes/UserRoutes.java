package familycommandcenter.routes;

import familycommandcenter.model.UserDAO;
import io.javalin.Javalin;

public final class UserRoutes {

    private UserRoutes() {
        // utility class
    }

    public static void register(Javalin api, UserDAO userDAO) {
        api.get("/", ctx -> ctx.result(" Family Command Center LIVE"));
        api.get("/api/users", ctx -> ctx.json(userDAO.findAll()));
        api.get("/api/users/kids", ctx -> {
            try {
                System.out.println("DEBUG 1 - route hit");

                var kids = userDAO.getUsersByRole("kid");
                System.out.println("DEBUG 2 - DAO worked, count = " + kids.size());

                ctx.json(kids);
                System.out.println("DEBUG 3 - json sent");
            } catch (Exception e) {
                System.out.println("DEBUG ERROR - inside /api/users/kids");
                e.printStackTrace();
                ctx.status(500).result("ERROR: " + e.getMessage());
            }
        });
    }
}
