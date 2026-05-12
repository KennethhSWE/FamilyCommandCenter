package familycommandcenter.util;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

/**
 * JWT helper – generates and verifies HMAC-SHA256 tokens.
 *
 * The signing secret is read from JWT_SECRET in .env.
 * If the env-var is missing during local dev, a fallback secret is generated at
 * runtime.
 */
public final class JwtUtil {

    private static final Dotenv DOTENV = Dotenv.configure().ignoreIfMissing().load();
    private static final Key SIGNING_KEY = initSigningKey();

    private JwtUtil() {
        // Utility class
    }

    public static String generateToken(
            int userId,
            String username,
            String role,
            UUID householdId) {

        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .claim("role", role)
                .claim("householdId", householdId.toString())
                .setExpiration(Date.from(
                        Instant.now().plus(30, ChronoUnit.DAYS)))
                .signWith(SIGNING_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Temporary compatibility overload.
     *
     * Do not use this for new routes. New tokens must include userId and
     * householdId.
     */
    public static String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setExpiration(Date.from(
                        Instant.now().plus(30, ChronoUnit.DAYS)))
                .signWith(SIGNING_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Temporary compatibility overload.
     *
     * Do not use this for new routes. New tokens must include userId and
     * householdId.
     */
    public static String generateToken(String username) {
        return generateToken(username, "kid");
    }

    public static Jws<Claims> verify(String token) throws JwtException {
        return Jwts.parserBuilder()
                .setSigningKey(SIGNING_KEY)
                .build()
                .parseClaimsJws(token);
    }

    public static String getUsername(String token) {
        return verify(token).getBody().getSubject();
    }

    public static String getRole(String token) {
        return verify(token).getBody().get("role", String.class);
    }

    public static Integer getUserId(String token) {
        return verify(token).getBody().get("userId", Integer.class);
    }

    public static UUID getHouseholdId(String token) {
        String rawHouseholdId = verify(token).getBody().get("householdId", String.class);
        return UUID.fromString(rawHouseholdId);
    }

    private static Key initSigningKey() {
        String secretB64 = System.getenv("JWT_SECRET");

        if (secretB64 == null || secretB64.isBlank()) {
            secretB64 = DOTENV.get("JWT_SECRET");
        }

        byte[] secretBytes;

        if (secretB64 == null || secretB64.isBlank()) {
            System.err.println("[WARN] JWT_SECRET not found – using runtime random key. "
                    + "Tokens will be invalid after restart.");

            secretBytes = new byte[64];
            new java.security.SecureRandom().nextBytes(secretBytes);
        } else {
            secretBytes = Base64.getDecoder().decode(secretB64);

            if (secretBytes.length < 32) {
                throw new IllegalStateException(
                        "JWT_SECRET too short (" + secretBytes.length
                                + " bytes). Must be >= 32 bytes after base-64 decoding.");
            }
        }

        return Keys.hmacShaKeyFor(secretBytes);
    }
}