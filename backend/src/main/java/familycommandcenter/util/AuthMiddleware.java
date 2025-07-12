package familycommandcenter.util;

import io.javalin.http.Context;
import io.javalin.http.Handler;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;

/**
 * Simple Bearer-token guard for any protected <code>/api/**</code> route.
 * <p>
 * NOTE: With the Javalin version in our POM the handler chain continues
 * automatically once <code>handle()</code> returns, so we do NOT call
 * <code>ctx.next()</code> here (that method doesn’t exist on this Context).
 */
public class AuthMiddleware implements Handler {

    @Override
    public void handle(Context ctx) throws Exception {
        String hdr = ctx.header("Authorization");
        if (hdr == null || !hdr.startsWith("Bearer ")) {
            ctx.status(401).result("Missing token");
            return;
        }
        String token = hdr.substring(7);

        try {
            Jws<Claims> jws = JwtUtil.verify(token);
            ctx.attribute("username", jws.getBody().getSubject()); // downstream usage
            /* proceed – nothing else to do */
        } catch (Exception e) {
            ctx.status(401).result("Invalid token");
        }
    }
}
