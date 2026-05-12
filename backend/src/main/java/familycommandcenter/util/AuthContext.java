package familycommandcenter.util;

import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.http.UnauthorizedResponse;

public final class AuthContext {

    private static final String AUTH_USER_KEY = "authUser";

    private AuthContext() {
        // Utility class
    }

    public static void setUser(Context ctx, AuthUser authUser) {
        ctx.attribute(AUTH_USER_KEY, authUser);
    }

    public static AuthUser requireUser(Context ctx) {
        AuthUser authUser = ctx.attribute(AUTH_USER_KEY);

        if (authUser == null) {
            throw new UnauthorizedResponse("Authenticated user is required.");
        }

        return authUser;
    }

    public static int requireHouseholdId(Context ctx) {
        return requireUser(ctx).getHouseholdId();
    }

    public static String requireUsername(Context ctx) {
        return requireUser(ctx).getUsername();
    }

    public static void requireParent(Context ctx) {
        AuthUser authUser = requireUser(ctx);

        if (!authUser.isParent()) {
            throw new ForbiddenResponse("Parent access is required.");
        }
    }
}