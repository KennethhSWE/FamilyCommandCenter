package familycommandcenter.util;

import io.javalin.http.Context;
import io.javalin.http.Handler;

public class AuthMiddleware implements Handler {
    @Override
    public void handle(Context ctx) throws Exception {
        String authHeader = ctx.header("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            ctx.status(401).result("Missing or invalid Authorization header");
            return;
        }

        String token = authHeader.substring(7); // this removes "Bearer " prefix

        if (!JwtUtil.validateToken(token)) {
            ctx.status(401).result("Invalid or expired token");
            return;
        }

        String username = JwtUtil.getUsernameFromToken(token);
        if (username == null) {
            ctx.status(401).result("Could not extract user from token");
            return;
        }

        ctx.attribute("username", username); // Attach to context
    }
}