package familycommandcenter.model;

import familycommandcenter.Database;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

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
        String sql = "UPDATE chores SET name = ?, assigned to = ?, is complete = ?, due_date = ?, points = ? WHERE id = ?";
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
}