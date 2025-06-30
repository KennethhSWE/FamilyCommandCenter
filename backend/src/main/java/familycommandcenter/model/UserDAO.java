package familycommandcenter.model;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class UserDAO {

    private final Connection conn;

    public UserDAO(Connection conn) {
        this.conn = conn;
    }

    // Overload Method for registering a User with a role.
    public boolean registerUser(User user, String role) {
        String sql = "INSERT INTO users (username, password_hash, created_at, age, role) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getPasswordHash());
            stmt.setTimestamp(3, Timestamp.valueOf(user.getCreatedAt()));
            stmt.setInt(4, user.getAge());
            stmt.setString(5, role);
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("Error registering user with role: " + e.getMessage());
            return false;
        }
    }

    // Method for registering a User without a role
    public boolean registerUser(User user) {
        String sql = "INSERT INTO users (username, password_hash, created_at, age) " +
                "VALUES (?,?,?,?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getPasswordHash());
            stmt.setTimestamp(3, Timestamp.valueOf(user.getCreatedAt()));
            stmt.setInt(4, user.getAge());
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("Error registering user: " + e.getMessage());
            return false;
        }
    }

    public Optional<User> getUserByUsername(String username) {
        String sql = "SELECT * FROM users WHERE username = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                int id = rs.getInt("id");
                String uname = rs.getString("username");
                String hash = rs.getString("password_hash");
                LocalDateTime createdAt = rs.getTimestamp("created_at").toLocalDateTime();
                int age = rs.getInt("age");

                return Optional.of(new User(id, uname, hash, createdAt, age));
            }

        } catch (SQLException e) {
            System.err.println("Error retrieving user: " + e.getMessage());
        }

        return Optional.empty();
    }

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT * FROM users";

        try (PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                int id = rs.getInt("id");
                String uname = rs.getString("username");
                String hash = rs.getString("password_hash");
                LocalDateTime createdAt = rs.getTimestamp("created_at").toLocalDateTime();
                int age = rs.getInt("age");

                users.add(new User(id, uname, hash, createdAt, age));
            }

        } catch (SQLException e) {
            System.err.println("Error fetching users: " + e.getMessage());
        }

        return users;
    }

    public List<User> getUsersByRole(String role) throws SQLException {
        String sql = "SELECT * FROM users WHERE role = ?";
        List<User> list = new ArrayList<>();

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, role);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                int id = rs.getInt("id");
                String uname = rs.getString("username");
                String hash = rs.getString("password_hash");
                LocalDateTime createdAt = rs.getTimestamp("created_at").toLocalDateTime();
                int age = rs.getInt("age");

                list.add(new User(id, uname, hash, createdAt, age));
            }
        }

        return list;
    }

    public User mapRow(ResultSet rs) throws SQLException {
        int id = rs.getInt("id");
        String uname = rs.getString("username");
        String hash = rs.getString("password_hash");
        LocalDateTime createdAt = rs.getTimestamp("created_at").toLocalDateTime();
        int age = rs.getInt("age");
        return new User(id, uname, hash, createdAt, age);
    }
}
