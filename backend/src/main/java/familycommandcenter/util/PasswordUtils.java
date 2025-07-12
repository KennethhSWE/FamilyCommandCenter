package familycommandcenter.util;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Utility class for securely hashing and verifying passwords using BCrypt.
 */
public final class PasswordUtils {

    private PasswordUtils() {} // prevent instantiation

    /**
     * Hashes a plaintext password using BCrypt with a generated salt.
     *
     * @param plainTextPassword the raw password
     * @return the hashed password string
     */
    public static String hashPassword(String plainTextPassword) {
        return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt());
    }

    /**
     * Verifies a plaintext password against a stored hash.
     *
     * @param plainTextPassword the raw password
     * @param hashedPassword    the stored hashed password
     * @return true if the password matches, false otherwise
     */
    public static boolean checkPassword(String plainTextPassword, String hashedPassword) {
        return BCrypt.checkpw(plainTextPassword, hashedPassword);
    }
}
