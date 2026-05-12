package familycommandcenter.model;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * DAO for the users table.
 *
 * Parent usernames are globally unique.
 * Kid names are only unique inside one household.
 */
public final class UserDAO {

    private final DataSource ds;

    public UserDAO(DataSource ds) {
        this.ds = ds;
    }

    public void makeSureUserTableIsReady() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    age INTEGER NOT NULL DEFAULT 0,
                    role VARCHAR(20) NOT NULL,
                    household_id UUID NOT NULL
                )
                """;

        String addHouseholdColumn = """
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS household_id UUID
                """;

        String removeUnsafeOldUsers = """
                DELETE FROM users
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE users
                ALTER COLUMN household_id SET NOT NULL
                """;

        String dropOldUsernameUniqueConstraint = """
                ALTER TABLE users
                DROP CONSTRAINT IF EXISTS users_username_key
                """;

        String dropOldUsernameUniqueIndex = """
                DROP INDEX IF EXISTS users_username_key
                """;

        String createParentUsernameIndex = """
                CREATE UNIQUE INDEX IF NOT EXISTS idx_users_parent_username_unique
                ON users (LOWER(username))
                WHERE role = 'parent'
                """;

        String createKidHouseholdUsernameIndex = """
                CREATE UNIQUE INDEX IF NOT EXISTS idx_users_kid_username_household_unique
                ON users (LOWER(username), household_id)
                WHERE role = 'kid'
                """;

        String createHouseholdRoleIndex = """
                CREATE INDEX IF NOT EXISTS idx_users_household_role
                ON users (household_id, role)
                """;

        try (Connection connection = ds.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(createTable)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Old users without household_id are unsafe in the multi-family version.
             * This is development data, so delete them instead of guessing ownership.
             */
            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeOldUsers)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(requireHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Older versions may have blocked duplicate usernames globally.
             * That does not work for kid names once multiple families use the app.
             */
            try (PreparedStatement ps = connection.prepareStatement(dropOldUsernameUniqueConstraint)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(dropOldUsernameUniqueIndex)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(createParentUsernameIndex)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(createKidHouseholdUsernameIndex)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(createHouseholdRoleIndex)) {
                ps.executeUpdate();
            }
        }
    }

    public void save(User user) throws SQLException {
        String sql = """
                INSERT INTO users (
                    username,
                    password_hash,
                    age,
                    role,
                    created_at,
                    household_id
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        try (Connection connection = ds.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, user.getUsername());
            ps.setString(2, user.getPasswordHash());
            ps.setInt(3, user.getAge());
            ps.setString(4, user.getRole());

            LocalDateTime createdAt = user.getCreatedAt() != null
                    ? user.getCreatedAt()
                    : LocalDateTime.now();

            ps.setTimestamp(5, Timestamp.valueOf(createdAt));
            ps.setObject(6, user.getHouseholdId(), Types.OTHER);

            ps.executeUpdate();
        }
    }

    /*
     * Temporary compatibility method.
     * Do not use this for new multi-family logic.
     */
    public Optional<User> findByUsername(String username) throws SQLException {
        String sql = """
                SELECT *
                FROM users
                WHERE LOWER(username) = LOWER(?)
                ORDER BY id ASC
                LIMIT 1
                """;

        try (Connection connection = ds.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        }
    }

    public Optional<User> findParentByUsername(String username) throws SQLException {
        String sql = """
                SELECT *
                FROM users
                WHERE LOWER(username) = LOWER(?)
                AND role = 'parent'
                LIMIT 1
                """;

        try (Connection connection = ds.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        }
    }

    public Optional<User> findKidByUsernameInHousehold(
            String username,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT *
                FROM users
                WHERE LOWER(username) = LOWER(?)
                AND household_id = ?
                AND role = 'kid'
                LIMIT 1
                """;

        try (Connection connection = ds.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setObject(2, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        }
    }

    public boolean parentUsernameExists(String username) throws SQLException {
        return findParentByUsername(username).isPresent();
    }

    public boolean kidNameExistsInHousehold(
            String username,
            UUID householdId) throws SQLException {

        return findKidByUsernameInHousehold(username, householdId).isPresent();
    }

    public List<User> getUsersByRole(String role) throws SQLException {
        String sql = """
                SELECT *
                FROM users
                WHERE role = ?
                ORDER BY id ASC
                """;

        try (Connection connection = ds.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, role);

            try (ResultSet rs = ps.executeQuery()) {
                List<User> users = new ArrayList<>();

                while (rs.next()) {
                    users.add(map(rs));
                }

                return users;
            }
        }
    }

    public List<User> getKidsByHousehold(UUID householdId) throws SQLException {
        String sql = """
                SELECT *
                FROM users
                WHERE household_id = ?
                AND role = 'kid'
                ORDER BY id ASC
                """;

        try (Connection connection = ds.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                List<User> kids = new ArrayList<>();

                while (rs.next()) {
                    kids.add(map(rs));
                }

                return kids;
            }
        }
    }

    public List<User> findAll() throws SQLException {
        String sql = """
                SELECT *
                FROM users
                ORDER BY id ASC
                """;

        try (Connection connection = ds.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            List<User> users = new ArrayList<>();

            while (rs.next()) {
                users.add(map(rs));
            }

            return users;
        }
    }

    private User map(ResultSet rs) throws SQLException {
        return new User(
                rs.getInt("id"),
                rs.getString("username"),
                rs.getString("password_hash"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getInt("age"),
                rs.getString("role"),
                rs.getObject("household_id", UUID.class));
    }
}
