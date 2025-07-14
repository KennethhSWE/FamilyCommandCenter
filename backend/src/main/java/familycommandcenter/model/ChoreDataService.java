package familycommandcenter.model;

import familycommandcenter.Database;

import java.sql.*;
import java.time.LocalDate;
import java.util.*;

public class ChoreDataService {

    private static Chore map(ResultSet rs) throws SQLException {
        java.sql.Date sqlDate = rs.getDate("due_date");

        return new Chore(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getString("assigned_to"),
                rs.getInt("points"),
                sqlDate != null ? sqlDate.toString() : null,
                rs.getBoolean("is_complete"),
                rs.getBoolean("requested_complete"),
                rs.getObject("min_age") != null ? rs.getInt("min_age") : null,
                rs.getObject("max_age") != null ? rs.getInt("max_age") : null,
                rs.getBoolean("is_verified"),
                rs.getBoolean("is_recurring"),
                rs.getObject("created_by") != null ? rs.getInt("created_by") : null);
    }

    public static void addChore(Chore chore) {
        try (Connection conn = Database.getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO chores (name, assigned_to, is_complete, due_date, points, is_verified, requested_complete, complete, min_age, max_age, created_by, is_recurring) "
                            +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            ps.setString(1, chore.getName());
            ps.setString(2, chore.getAssignedTo());
            ps.setBoolean(3, chore.isComplete());

            // If due date is null, use current date
            if (chore.getDueDate() == null) {
                ps.setDate(4, java.sql.Date.valueOf(LocalDate.now()));
            } else {
                ps.setDate(4, java.sql.Date.valueOf(chore.getDueDate()));
            }

            ps.setInt(5, chore.getPoints());
            ps.setBoolean(6, chore.isVerified());
            ps.setBoolean(7, chore.isRequestedComplete());
            ps.setBoolean(8, chore.isComplete());
            ps.setObject(9, chore.getMinAge(), java.sql.Types.INTEGER);
            ps.setObject(10, chore.getMaxAge(), java.sql.Types.INTEGER);
            ps.setObject(11, chore.getCreatedBy(), java.sql.Types.INTEGER);
            ps.setBoolean(12, chore.isRecurring());

            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void insertAssignedChore(Chore c) throws SQLException {
        String sql = """
                    INSERT INTO chores (name, assigned_to, is_complete, due_date, points,
                                        requested_complete, min_age, max_age, is_recurring,
                                        is_verified, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        try (Connection conn = Database.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, c.getName());
            ps.setString(2, c.getAssignedTo());
            ps.setBoolean(3, c.isComplete());

            if (c.getDueDate() != null)
                ps.setDate(4, java.sql.Date.valueOf(c.getDueDate()));
            else
                ps.setNull(4, Types.DATE);

            ps.setInt(5, c.getPoints());
            ps.setBoolean(6, c.isRequestedComplete());
            ps.setObject(7, c.getMinAge(), Types.INTEGER);
            ps.setObject(8, c.getMaxAge(), Types.INTEGER);
            ps.setBoolean(9, c.isRecurring());
            ps.setBoolean(10, c.isVerified());
            ps.setObject(11, c.getCreatedBy(), Types.INTEGER);

            ps.executeUpdate();
        }
    }

    private static void addChoreToPool(Chore c) throws SQLException {
        String sql = """
                    INSERT INTO chores (name, assigned_to, is_complete, due_date, points,
                                        requested_complete, min_age, max_age, is_recurring,
                                        is_verified, created_by)
                    VALUES (?, NULL, FALSE, NULL, ?, FALSE, ?, ?, ?, ?, ?)
                """;

        try (Connection conn = Database.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, c.getName());
            ps.setInt(2, c.getPoints());
            ps.setObject(3, c.getMinAge(), Types.INTEGER);
            ps.setObject(4, c.getMaxAge(), Types.INTEGER);
            ps.setBoolean(5, c.isRecurring());
            ps.setBoolean(6, c.isVerified());
            ps.setObject(7, c.getCreatedBy(), Types.INTEGER);

            ps.executeUpdate();
        }
    }

    public static List<Chore> getAllChores() throws SQLException {
        String sql = "SELECT * FROM chores";
        try (Connection c = Database.getConnection();
                PreparedStatement ps = c.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            List<Chore> list = new ArrayList<>();
            while (rs.next())
                list.add(map(rs));
            return list;
        }
    }

    public static List<Chore> getPoolForKidAge(int age) throws SQLException {
        String sql = """
                    SELECT * FROM chores
                    WHERE assigned_to IS NULL
                    AND (min_age IS NULL OR min_age <= ?)
                    AND (max_age IS NULL OR max_age >= ?)
                """;

        try (Connection conn = Database.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, age);
            ps.setInt(2, age);
            ResultSet rs = ps.executeQuery();

            List<Chore> list = new ArrayList<>();
            while (rs.next())
                list.add(map(rs));
            return list;
        }
    }

    public static List<Chore> getIncompleteByKid(String username) throws SQLException {
        String sql = "SELECT * FROM chores WHERE assigned_to = ? AND is_complete = FALSE";
        try (Connection c = Database.getConnection();
                PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, username);
            ResultSet rs = ps.executeQuery();
            List<Chore> list = new ArrayList<>();
            while (rs.next())
                list.add(map(rs));
            return list;
        }
    }

    public static List<Chore> getChoresDueToday() throws SQLException {
        String sql = "SELECT * FROM chores WHERE due_date = CURRENT_DATE";
        try (Connection c = Database.getConnection();
                PreparedStatement ps = c.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            List<Chore> list = new ArrayList<>();
            while (rs.next())
                list.add(map(rs));
            return list;
        }
    }

    public static List<Chore> getOverdueChores() throws SQLException {
        String sql = "SELECT * FROM chores WHERE due_date < CURRENT_DATE AND is_complete = FALSE";
        try (Connection c = Database.getConnection();
                PreparedStatement ps = c.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            List<Chore> list = new ArrayList<>();
            while (rs.next())
                list.add(map(rs));
            return list;
        }
    }

    public static void deleteChore(int id) throws SQLException {
        String sql = "DELETE FROM chores WHERE id = ?";
        try (Connection c = Database.getConnection();
                PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    public static Map<String, Integer> getTotalPointsByUser() throws SQLException {
        String sql = """
                    SELECT assigned_to, SUM(points) AS total
                    FROM chores
                    WHERE is_complete = TRUE
                    GROUP BY assigned_to
                """;
        try (Connection c = Database.getConnection();
                PreparedStatement ps = c.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            Map<String, Integer> map = new HashMap<>();
            while (rs.next())
                map.put(rs.getString(1), rs.getInt(2));
            return map;
        }
    }
}
