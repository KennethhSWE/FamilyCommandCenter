package familycommandcenter.model;

import familycommandcenter.Database;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ChoreDataService {
    public static List<Chore> getAllChores() throws SQLException {
        List<Chore> chores = new ArrayList<>();
        String sql = "SELECT * FROM chores";

        try (Connection conn = Database.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Chore chore = new Chore();
                chore.setId(rs.getInt("id"));
                chore.setName(rs.getString("name"));
                chore.setAssignedTo(rs.getString("assigned_to"));
                chore.setComplete(rs.getBoolean("is_complete"));
                chore.setDueDate(rs.getString("due_date") != null ? rs.getString("due_date") : null);
                chore.setPoints(rs.getInt("points"));
                chores.add(chore);
            }

        }
        return chores;
    }

    public static void addChore(Chore chore) throws SQLException {
        String sql = "INSERT INTO chores (name, assigned_to, is_complete, due_date, points) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = Database.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, chore.getName());
            stmt.setString(2, chore.getAssignedTo());
            stmt.setBoolean(3, chore.isComplete());
            stmt.setDate(4, Date.valueOf(chore.getDueDate()));
            stmt.setInt(5, chore.getPoints());

            stmt.executeUpdate();
        }
    }

    public static void markChoreComplete(int id) throws SQLException {
        String sql = "UPDATE chores SET is_complete = TRUE WHERE id = ?";

        try (Connection conn = Database.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
    }

    public static void deleteChore(int id) throws SQLException {
        String sql = "DELETE FROM chores WHERE id = ?";

        try (Connection conn = Database.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
    }

    public static void updateChore(Chore chore) throws SQLException {
        String sql = "UPDATE chores SET name = ?, assigned_to = ?, is_complete = ?, due_date = ?, points = ? WHERE id = ?";
        try (Connection conn = Database.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, chore.getName());
            stmt.setString(2, chore.getAssignedTo());
            stmt.setBoolean(3, chore.isComplete());
            stmt.setDate(4, Date.valueOf(chore.getDueDate()));
            stmt.setInt(5, chore.getPoints());
            stmt.setInt(6, chore.getId());

            stmt.executeUpdate();
        }
    }

    // Helper Methods to validate chore data before adding or updating.
    public static void validateChore(Chore chore) throws IllegalArgumentException {
        if (chore.getName() == null || chore.getName().isEmpty()) {
            throw new IllegalArgumentException("Chore name cannot be null or empty");
        }

        if (chore.getAssignedTo() == null || chore.getAssignedTo().isEmpty()) {
            throw new IllegalArgumentException("Assigned user cannot be null or empty");
        }

        if (chore.getDueDate() == null || chore.getDueDate().isEmpty()) {
            throw new IllegalArgumentException("Due date cannot be null or empty");
        }

        if (chore.getPoints() < 0) {
            throw new IllegalArgumentException("Points cannot be negative");
        }

        if (chore.getId() < 0) {
            throw new IllegalArgumentException("Chore ID cannot be negative");
        }

        if (chore.getDueDate() != null) {
            try {
                Date.valueOf(chore.getDueDate());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid date format for due date");
            }
        }

        if (chore.getPoints() < 0) {
            throw new IllegalArgumentException("Points cannot be negative");
        }
    }

    public static Map<String, List<Chore>> getChoresGroupedByUser() throws SQLException {
        Map<String, List<Chore>> grouped = new HashMap<>();
        List<Chore> chores = getAllChores();

        for (Chore chore : chores) {
            String user = chore.getAssignedTo();
            grouped.computeIfAbsent(user, k -> new ArrayList<>()).add(chore);
        }

        return grouped;
    }

    public static Map<String, Integer> getTotalPointsByUser() throws SQLException {
        Map<String, Integer> pointsMap = new HashMap<>();
        String sql = "SELECT assigned_to, SUM(points) AS total_points FROM chores WHERE is_complete = TRUE GROUP BY assigned_to";

        try (Connection conn = Database.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                String user = rs.getString("assigned_to");
                int totalPoints = rs.getInt("total_points");
                pointsMap.put(user, totalPoints);
            }
        }
        return pointsMap;
    }

    public static List<Chore> getChoresDueToday() throws SQLException {
        List<Chore> chores = new ArrayList<>();
        String sql = "SELECT * FROM chores WHERE due_date = CURRENT_DATE";

        try (Connection conn = Database.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Chore chore = new Chore();
                chore.setId(rs.getInt("id"));
                chore.setName(rs.getString("name"));
                chore.setAssignedTo(rs.getString("assigned_to"));
                chore.setComplete(rs.getBoolean("is_complete"));
                chore.setDueDate(rs.getString("due_date"));
                chore.setPoints(rs.getInt("points"));
                chores.add(chore);
            }
        }
        return chores;
    }

    public static List<Chore> getOverdueChores() throws SQLException {
        List<Chore> chores = new ArrayList<>();
        String sql = "SELECT * FROM chores WHERE due_date < CURRENT_DATE AND is_complete = FALSE";

        try (Connection conn = Database.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Chore chore = new Chore();
                chore.setId(rs.getInt("id"));
                chore.setName(rs.getString("name"));
                chore.setAssignedTo(rs.getString("assigned_to"));
                chore.setComplete(rs.getBoolean("is_complete"));
                chore.setDueDate(rs.getString("due_date"));
                chore.setPoints(rs.getInt("points"));
                chores.add(chore);
            }
        }
        return chores;
    }

    public static void verifyChore(int id) throws SQLException {
        String sql = "UPDATE chores SET is_verified = TRUE WHERE id = ?";
        try (Connection conn = Database.getConnection();
        PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
    }

    public static void awardPointsToUser(String userName, int points) throws SQLException {
        String updateSql = "UPDATE points_bank SET total_points = total_points + ? WHERE user_name = ?";
        String insertSql = "INSERT INTO points_bank (user_name, total_points) VALUES (?, ?)";

        try (Connection conn = Database.getConnection()) {
            PreparedStatement updateStmt = conn.prepareStatement(updateSql);
            updateStmt.setInt(1, points);
            updateStmt.setString(2, userName);
            int rowsAffected = updateStmt.executeUpdate();

            if (rowsAffected == 0) {
                // No existing rowm insert new
            PreparedStatement insertStmt = conn.prepareStatement(insertSql);
            insertStmt.setString(1, userName);
            insertStmt.setInt(2, points);
            insertStmt.executeUpdate();
            }
        }
    }
}