package familycommandcenter.util;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;

public final class JwtUtil {

    /* ─────────────────── load env once ─────────────────── */
    private static final Dotenv DOTENV = Dotenv.load();

    // Raw Base-64 string from .env  (do **not** trim!)
    private static final String SECRET_B64 = DOTENV.get("JWT_SECRET");

    // HMAC-SHA signing key built from secret
    private static final Key SIGNING_KEY;

    static {
        /* Validate secret presence & length (≥ 32 bytes AFTER base-64 decoding) */
        if (SECRET_B64 == null) {
            throw new IllegalStateException("JWT_SECRET not found in .env");
        }
        byte[] secretBytes = Base64.getDecoder().decode(SECRET_B64);
        if (secretBytes.length < 32) {                    // 32 bytes = 256 bits
            throw new IllegalStateException(
                "JWT_SECRET is too short (" + secretBytes.length +
                " bytes). It must be at least 32 bytes (256 bits) after base-64 decoding."
            );
        }
        SIGNING_KEY = Keys.hmacShaKeyFor(secretBytes);
    }

    private JwtUtil() {}   // utility class – prevent instantiation

    /* ───────────────────── generate ───────────────────── */
    public static String generateToken(String username, String role) {
        return Jwts.builder()
            .setSubject(username)
            .claim("role", role)
            .setExpiration(Date.from(Instant.now().plus(30, ChronoUnit.DAYS)))
            .signWith(SIGNING_KEY, SignatureAlgorithm.HS256)
            .compact();
    }

    // overload for legacy /api/login (defaults to “kid” role)
    public static String generateToken(String username) {
        return generateToken(username, "kid");
    }

    /* ───────────────────── verify ───────────────────── */
    public static Jws<Claims> verify(String token) throws JwtException {
        return Jwts.parserBuilder()
                   .setSigningKey(SIGNING_KEY)
                   .build()
                   .parseClaimsJws(token);
    }

    /* ───────────────────── helpers ───────────────────── */
    public static String getUsername(String token) {
        return verify(token).getBody().getSubject();
    }

    public static String getRole(String token) {
        return verify(token).getBody().get("role", String.class);
    }
}
