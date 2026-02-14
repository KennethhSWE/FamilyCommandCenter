package familycommandcenter.util;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;

/**
 * JWT helper – generates & verifies HMAC-SHA256 tokens.
 * <p>The signing secret is read from <code>JWT_SECRET</code> in <code>.env</code>.
 * If the env-var is missing (local dev) a fallback secret is generated at runtime
 * so the application still starts, but a warning is logged.</p>
 */
public final class JwtUtil {

    private static final Dotenv DOTENV = Dotenv.load();
    private static final Key SIGNING_KEY = initSigningKey();

    private JwtUtil() {} // utility class – no instances

    /* ------------------------------------------------------------------
     *  Public API
     * ---------------------------------------------------------------- */
    public static String generateToken(String username, String role) {
        return Jwts.builder()
                   .setSubject(username)
                   .claim("role", role)
                   .setExpiration(Date.from(
                       Instant.now().plus(30, ChronoUnit.DAYS)))
                   .signWith(SIGNING_KEY, SignatureAlgorithm.HS256)
                   .compact();
    }

    /** Convenience overload: defaults to <code>role=kid</code>. */
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

    /* ------------------------------------------------------------------
     *  Internal helpers
     * ---------------------------------------------------------------- */
    private static Key initSigningKey() {
        String secretB64 = DOTENV.get("JWT_SECRET");
        byte[] secretBytes;

        if (secretB64 == null) {
            System.err.println("[WARN] JWT_SECRET not found – using runtime random key. "
                             + "Tokens will be invalid after restart.");
            secretBytes = new byte[64];            // 512-bit random dev key
            new java.security.SecureRandom().nextBytes(secretBytes);
        } else {
            secretBytes = Base64.getDecoder().decode(secretB64);
            if (secretBytes.length < 32) {         // 256-bit minimum
                throw new IllegalStateException(
                    "JWT_SECRET too short (" + secretBytes.length
                  + " bytes). Must be ≥ 32 bytes after base-64 decoding.");
            }
        }
        return Keys.hmacShaKeyFor(secretBytes);
    }
}
