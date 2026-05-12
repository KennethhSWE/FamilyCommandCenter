package familycommandcenter.routes;

import familycommandcenter.model.UserDAO;
import familycommandcenter.util.AuthContext;
import io.javalin.Javalin;

import java.util.UUID;

public final class UserRoutes {

    private UserRoutes() {
        // utility class
    }

    public static void register(Javalin api, UserDAO userDAO) {
        api.get("/", ctx -> ctx.result("Family Command Center LIVE"));

        api.get("/api/users", ctx -> {
            AuthContext.requireParent(ctx);

            UUID householdId = AuthContext.requireHouseholdId(ctx);

            ctx.json(userDAO.getKidsByHousehold(householdId));
        });

        api.get("/api/users/kids", ctx -> {
            try {
                AuthContext.requireParent(ctx);

                UUID householdId = AuthContext.requireHouseholdId(ctx);

                var kids = userDAO.getKidsByHousehold(householdId);

                ctx.json(kids);
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("ERROR: " + e.getMessage());
            }
        });
    }
}