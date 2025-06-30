package familycommandcenter.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

public class JwtUtil {

    private static final String SECRET_KEY =
        "ThisIsASecretKeyForJWTGenerationAndShouldBeLongEnough12345";

    /** Single key object reused for sign/verify. */
    private static final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    /* --------------------------------------------------------- */
    /* 1.  Generate token                                         */
    /* --------------------------------------------------------- */
    public static String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setExpiration(Date.from(Instant.now().plus(30, ChronoUnit.DAYS)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Overload so existing /api/login call keeps compiling. */
    public static String generateToken(String username) {
        return generateToken(username, "kid");
    }

    /* --------------------------------------------------------- */
    /* 2.  Verify token                                           */
    /* --------------------------------------------------------- */
    public static Jws<Claims> verify(String token) throws JwtException {
        return Jwts.parserBuilder()
                   .setSigningKey(key)
                   .build()
                   .parseClaimsJws(token);
    }

    /* Optional convenience helpers */
    public static String getUsername(String token) {
        return verify(token).getBody().getSubject();
    }

    public static String getRole(String token) {
        return verify(token).getBody().get("role", String.class);
    }
}
