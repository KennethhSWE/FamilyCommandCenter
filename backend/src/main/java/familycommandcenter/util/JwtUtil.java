package familycommandcenter.util;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

public class JwtUtil {

    // Load .env once
    private static final Dotenv dotenv = Dotenv.load();
    private static final String SECRET = dotenv.get("JWT_SECRET");

    /* 1️. Generate token */
    public static String generateToken(String username, String role) {
        return Jwts.builder()
            .setSubject(username)
            .claim("role", role)
            .setExpiration(Date.from(Instant.now().plus(30, ChronoUnit.DAYS)))
            .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()), SignatureAlgorithm.HS256)
            .compact();
    }

    /** overload keeps /api/login working */
    public static String generateToken(String username) {
        return generateToken(username, "kid");
    }

    /* 2️. Verify token (used by AuthMiddleware & /auth/validate) */
    public static Jws<Claims> verify(String token) throws JwtException {
        return Jwts.parserBuilder()
                   .setSigningKey(SECRET.getBytes())
                   .build()
                   .parseClaimsJws(token);
    }

    /* convenience */
    public static String getUsername(String token) { return verify(token).getBody().getSubject(); }
    public static String getRole(String token)     { return verify(token).getBody().get("role", String.class); }
}
