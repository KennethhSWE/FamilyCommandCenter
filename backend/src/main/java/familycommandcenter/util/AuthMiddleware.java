package familycommandcenter.util;

import io.javalin.http.Context;
import io.javalin.http.Handler;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;

import java.util.UUID;

/**
 * Bearer-token guard for protected API routes.
 *
 * This middleware verifies the JWT, builds an AuthUser, and stores it
 * in the Javalin context for downstream routes/services.
 */
public class AuthMiddleware implements Handler {

    @Override
    public void handle(Context ctx) throws Exception {
        String header = ctx.header("Authorization");

        if (header == null) {
            ctx.status(401).result("Missing Authorization header");
            return;
        }

        if (!header.startsWith("Bearer ")) {
            ctx.status(401).result("Invalid Authorization format");
            return;
        }

        String token = header.substring(7);

        try {
            Jws<Claims> jws = JwtUtil.verify(token);
            Claims claims = jws.getBody();

            String username = claims.getSubject();
            Integer userId = claims.get("userId", Integer.class);
            String role = claims.get("role", String.class);
            String rawHouseholdId = claims.get("householdId", String.class);

            if (username == null || username.isBlank()
                    || userId == null
                    || role == null || role.isBlank()
                    || rawHouseholdId == null || rawHouseholdId.isBlank()) {
                ctx.status(401).result("Token is missing required user claims");
                return;
            }

            UUID householdId = UUID.fromString(rawHouseholdId);

            AuthUser authUser = new AuthUser(
                    userId,
                    username,
                    role,
                    householdId);

            AuthContext.setUser(ctx, authUser);

            // Temporary compatibility for older routes while we refactor.
            ctx.attribute("username", username);
            ctx.attribute("userId", userId);
            ctx.attribute("role", role);
            ctx.attribute("householdId", householdId);
        } catch (Exception e) {
            ctx.status(401).result("Invalid token");
        }
    }
}