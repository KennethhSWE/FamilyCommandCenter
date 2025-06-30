package familycommandcenter.util;

import io.javalin.http.Context;
import io.javalin.http.Handler;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;

public class AuthMiddleware implements Handler {

    @Override
    public void handle(Context ctx) throws Exception {
        String header = ctx.header("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            ctx.status(401).result("Missing token");
            return;
        }
        String token = header.substring(7);

        try {
            Jws<Claims> jws = JwtUtil.verify(token);   // ✅ new call
            String username = jws.getBody().getSubject();
            ctx.attribute("username", username);       // save for handlers
        } catch (Exception e) {
            ctx.status(401).result("Invalid token");
        }
    }
}
