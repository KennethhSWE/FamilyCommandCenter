package familycommandcenter.chores;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ChoreRepository {

    private final DataSource dataSource;

    public ChoreRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void saveChore(CreateChoreRequest chore) throws SQLException {
        String sql = """
                INSERT INTO chores (
                    name,
                    assigned_to,
                    is_complete,
                    due_date,
                    points,
                    requested_complete,
                    min_age,
                    max_age,
                    is_recurring,
                    is_verified,
                    created_by,
                    complete
                )
                VALUES (?, ?, FALSE, ?, ?, FALSE, ?, ?, ?, FALSE, ?, FALSE)
                """;

        String assignedKid = cleanBlank(chore.getAssignedTo());

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, chore.getName());
            ps.setString(2, assignedKid);

            if (chore.getDueDate() != null && !chore.getDueDate().isBlank()) {
                ps.setDate(3, Date.valueOf(chore.getDueDate()));
            } else if (assignedKid != null) {
                ps.setDate(3, Date.valueOf(LocalDate.now()));
            } else {
                ps.setNull(3, Types.DATE);
            }

            ps.setInt(4, chore.getPoints());
            ps.setObject(5, chore.getMinAge(), Types.INTEGER);
            ps.setObject(6, chore.getMaxAge(), Types.INTEGER);
            ps.setBoolean(7, chore.repeatsEveryWeek());
            ps.setObject(8, chore.getCreatedBy(), Types.INTEGER);

            ps.executeUpdate();
        }
    }

    public List<ChoreCard> findAllChores() throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                ORDER BY due_date NULLS LAST, assigned_to NULLS LAST, name ASC
                """;

        return findChores(sql);
    }

    public List<ChoreCard> findPendingApprovals() throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                WHERE requested_complete = TRUE
                AND is_complete = FALSE
                ORDER BY due_date ASC, assigned_to ASC
                """;

        return findChores(sql);
    }

    public List<ChoreCard> findChoresDueToday() throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                WHERE due_date = CURRENT_DATE
                ORDER BY assigned_to ASC, name ASC
                """;

        return findChores(sql);
    }

    public List<ChoreCard> findOverdueChores() throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                WHERE due_date < CURRENT_DATE
                AND is_complete = FALSE
                ORDER BY due_date ASC, assigned_to ASC
                """;

        return findChores(sql);
    }

    public List<ChoreCard> findIncompleteChoresForKid(String username) throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                WHERE assigned_to = ?
                AND is_complete = FALSE
                ORDER BY due_date ASC, name ASC
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {
                List<ChoreCard> chores = new ArrayList<>();

                while (rs.next()) {
                    chores.add(mapChoreCard(rs));
                }

                return chores;
            }
        }
    }

    public Optional<ChoreCard> findById(int choreId) throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                WHERE id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, choreId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapChoreCard(rs));
                }

                return Optional.empty();
            }
        }
    }

    public boolean requestParentCheck(int choreId) throws SQLException {
        String sql = """
                UPDATE chores
                SET requested_complete = TRUE
                WHERE id = ?
                AND is_complete = FALSE
                AND requested_complete = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, choreId);
            return ps.executeUpdate() == 1;
        }
    }

    public boolean approveChore(int choreId) throws SQLException {
        String sql = """
                UPDATE chores
                SET is_complete = TRUE,
                    complete = TRUE,
                    requested_complete = FALSE,
                    is_verified = TRUE
                WHERE id = ?
                AND is_complete = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, choreId);
            return ps.executeUpdate() == 1;
        }
    }

    public boolean rejectChore(int choreId) throws SQLException {
        String sql = """
                UPDATE chores
                SET requested_complete = FALSE
                WHERE id = ?
                AND is_complete = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, choreId);
            return ps.executeUpdate() == 1;
        }
    }

    public void deleteChoreForNow(int choreId) throws SQLException {
        String sql = """
                DELETE FROM chores
                WHERE id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, choreId);
            ps.executeUpdate();
        }
    }

    public List<ChoreCard> findPoolChoresForKidAge(int age) throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                WHERE assigned_to IS NULL
                AND (min_age IS NULL OR min_age <= ?)
                AND (max_age IS NULL OR max_age >= ?)
                ORDER BY name ASC
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, age);
            ps.setInt(2, age);

            try (ResultSet rs = ps.executeQuery()) {
                List<ChoreCard> chores = new ArrayList<>();

                while (rs.next()) {
                    chores.add(mapChoreCard(rs));
                }

                return chores;
            }
        }
    }

    public boolean isAlreadyAssignedToday(String username, String choreName) throws SQLException {
        String sql = """
                SELECT 1
                FROM chores
                WHERE assigned_to = ?
                AND name = ?
                AND due_date = CURRENT_DATE
                LIMIT 1
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setString(2, choreName);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    public int countOpenChoresForKidOnDate(String username, LocalDate dueDate) throws SQLException {
        String sql = """
                SELECT COUNT(*)
                FROM chores
                WHERE assigned_to = ?
                AND due_date = ?
                AND is_complete = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setDate(2, Date.valueOf(dueDate));

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }

    public int moveMissedChoresToToday(String username, LocalDate today) throws SQLException {
        String sql = """
                UPDATE chores
                SET due_date = ?,
                    requested_complete = FALSE
                WHERE assigned_to = ?
                AND due_date < ?
                AND is_complete = FALSE
                AND requested_complete = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setDate(1, Date.valueOf(today));
            ps.setString(2, username);
            ps.setDate(3, Date.valueOf(today));

            return ps.executeUpdate();
        }
    }

    public void assignPoolChoreToKid(ChoreCard poolChore, String username, LocalDate dueDate)
            throws SQLException {

        String sql = """
                INSERT INTO chores (
                    name,
                    assigned_to,
                    is_complete,
                    due_date,
                    points,
                    requested_complete,
                    min_age,
                    max_age,
                    is_recurring,
                    is_verified,
                    created_by,
                    complete
                )
                VALUES (?, ?, FALSE, ?, ?, FALSE, ?, ?, ?, FALSE, ?, FALSE)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, poolChore.getName());
            ps.setString(2, username);
            ps.setDate(3, Date.valueOf(dueDate));
            ps.setInt(4, poolChore.getPoints());
            ps.setObject(5, poolChore.getMinAge(), Types.INTEGER);
            ps.setObject(6, poolChore.getMaxAge(), Types.INTEGER);
            ps.setBoolean(7, poolChore.isRecurring());
            ps.setObject(8, poolChore.getCreatedBy(), Types.INTEGER);

            ps.executeUpdate();
        }
    }

    private List<ChoreCard> findChores(String sql) throws SQLException {
        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            List<ChoreCard> chores = new ArrayList<>();

            while (rs.next()) {
                chores.add(mapChoreCard(rs));
            }

            return chores;
        }
    }

    private ChoreCard mapChoreCard(ResultSet rs) throws SQLException {
        Date sqlDate = rs.getDate("due_date");

        return new ChoreCard(
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

    private String cleanBlank(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value;
    }
}