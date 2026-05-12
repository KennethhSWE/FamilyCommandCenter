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
import java.util.UUID;

public class ChoreRepository {

    private final DataSource dataSource;

    public ChoreRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureChoreTableIsReady() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS chores (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    assigned_to VARCHAR(100),
                    is_complete BOOLEAN NOT NULL DEFAULT FALSE,
                    due_date DATE,
                    points INTEGER NOT NULL DEFAULT 0,
                    requested_complete BOOLEAN NOT NULL DEFAULT FALSE,
                    min_age INTEGER,
                    max_age INTEGER,
                    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
                    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
                    created_by INTEGER,
                    complete BOOLEAN NOT NULL DEFAULT FALSE,
                    household_id UUID NOT NULL
                )
                """;

        String[] columnFixes = {
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(100)",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS is_complete BOOLEAN NOT NULL DEFAULT FALSE",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS due_date DATE",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS requested_complete BOOLEAN NOT NULL DEFAULT FALSE",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS min_age INTEGER",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS max_age INTEGER",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS created_by INTEGER",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS complete BOOLEAN NOT NULL DEFAULT FALSE",
                "ALTER TABLE chores ADD COLUMN IF NOT EXISTS household_id UUID"
        };

        String removeUnsafeOldChores = """
                DELETE FROM chores
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE chores
                ALTER COLUMN household_id SET NOT NULL
                """;

        String createHouseholdIndex = """
                CREATE INDEX IF NOT EXISTS idx_chores_household_id
                ON chores (household_id)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(createTable)) {
            ps.executeUpdate();
        }

        try (Connection connection = dataSource.getConnection()) {
            for (String sql : columnFixes) {
                try (PreparedStatement ps = connection.prepareStatement(sql)) {
                    ps.executeUpdate();
                }
            }

            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeOldChores)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(requireHouseholdColumn)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(createHouseholdIndex)) {
                ps.executeUpdate();
            }
        }
    }

    public void saveChore(
            CreateChoreRequest chore,
            UUID householdId) throws SQLException {

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
                    complete,
                    household_id
                )
                VALUES (?, ?, FALSE, ?, ?, FALSE, ?, ?, ?, FALSE, ?, FALSE, ?)
                """;

        String assignedKid = cleanBlank(chore.getAssignedTo());

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, chore.getName().trim());
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
            ps.setObject(9, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    public List<ChoreCard> findAllChores(UUID householdId) throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                WHERE household_id = ?
                ORDER BY due_date NULLS LAST, assigned_to NULLS LAST, name ASC
                """;

        return findChores(sql, householdId);
    }

    public List<ChoreCard> findPendingApprovals(UUID householdId) throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                WHERE household_id = ?
                AND requested_complete = TRUE
                AND is_complete = FALSE
                ORDER BY due_date ASC, assigned_to ASC
                """;

        return findChores(sql, householdId);
    }

    public List<ChoreCard> findChoresDueToday(UUID householdId) throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                WHERE household_id = ?
                AND due_date = CURRENT_DATE
                ORDER BY assigned_to ASC, name ASC
                """;

        return findChores(sql, householdId);
    }

    public List<ChoreCard> findOverdueChores(UUID householdId) throws SQLException {
        String sql = """
                SELECT *
                FROM chores
                WHERE household_id = ?
                AND due_date < CURRENT_DATE
                AND is_complete = FALSE
                ORDER BY due_date ASC, assigned_to ASC
                """;

        return findChores(sql, householdId);
    }

    public List<ChoreCard> findChoresForKidDashboard(
            String username,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT *
                FROM chores
                WHERE household_id = ?
                AND assigned_to = ?
                AND (
                    due_date = CURRENT_DATE
                    OR (due_date < CURRENT_DATE AND is_complete = FALSE)
                )
                ORDER BY is_complete ASC, requested_complete ASC, due_date ASC, name ASC
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);
            ps.setString(2, username);

            try (ResultSet rs = ps.executeQuery()) {
                List<ChoreCard> chores = new ArrayList<>();

                while (rs.next()) {
                    chores.add(mapChoreCard(rs));
                }

                return chores;
            }
        }
    }

    public Optional<ChoreCard> findById(
            int choreId,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT *
                FROM chores
                WHERE id = ?
                AND household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, choreId);
            ps.setObject(2, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapChoreCard(rs));
                }

                return Optional.empty();
            }
        }
    }

    public boolean requestParentCheck(
            int choreId,
            UUID householdId) throws SQLException {

        String sql = """
                UPDATE chores
                SET requested_complete = TRUE
                WHERE id = ?
                AND household_id = ?
                AND is_complete = FALSE
                AND requested_complete = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, choreId);
            ps.setObject(2, householdId, Types.OTHER);

            return ps.executeUpdate() == 1;
        }
    }

    public boolean approveChore(
            int choreId,
            UUID householdId) throws SQLException {

        String sql = """
                UPDATE chores
                SET is_complete = TRUE,
                    complete = TRUE,
                    requested_complete = FALSE,
                    is_verified = TRUE
                WHERE id = ?
                AND household_id = ?
                AND is_complete = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, choreId);
            ps.setObject(2, householdId, Types.OTHER);

            return ps.executeUpdate() == 1;
        }
    }

    public boolean rejectChore(
            int choreId,
            UUID householdId) throws SQLException {

        String sql = """
                UPDATE chores
                SET requested_complete = FALSE
                WHERE id = ?
                AND household_id = ?
                AND is_complete = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, choreId);
            ps.setObject(2, householdId, Types.OTHER);

            return ps.executeUpdate() == 1;
        }
    }

    public void deleteChoreForNow(
            int choreId,
            UUID householdId) throws SQLException {

        String sql = """
                DELETE FROM chores
                WHERE id = ?
                AND household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, choreId);
            ps.setObject(2, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    public List<ChoreCard> findPoolChoresForKidAge(
            int age,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT *
                FROM chores
                WHERE household_id = ?
                AND assigned_to IS NULL
                AND (min_age IS NULL OR min_age <= ?)
                AND (max_age IS NULL OR max_age >= ?)
                ORDER BY name ASC
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);
            ps.setInt(2, age);
            ps.setInt(3, age);

            try (ResultSet rs = ps.executeQuery()) {
                List<ChoreCard> chores = new ArrayList<>();

                while (rs.next()) {
                    chores.add(mapChoreCard(rs));
                }

                return chores;
            }
        }
    }

    public boolean isAlreadyAssignedToday(
            String username,
            String choreName,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT 1
                FROM chores
                WHERE household_id = ?
                AND assigned_to = ?
                AND name = ?
                AND due_date = CURRENT_DATE
                LIMIT 1
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);
            ps.setString(2, username);
            ps.setString(3, choreName);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    public int countOpenChoresForKidOnDate(
            String username,
            LocalDate dueDate,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT COUNT(*)
                FROM chores
                WHERE household_id = ?
                AND assigned_to = ?
                AND due_date = ?
                AND is_complete = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);
            ps.setString(2, username);
            ps.setDate(3, Date.valueOf(dueDate));

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }

    public int moveMissedChoresToToday(
            String username,
            LocalDate today,
            UUID householdId) throws SQLException {

        String sql = """
                UPDATE chores
                SET due_date = ?,
                    requested_complete = FALSE
                WHERE household_id = ?
                AND assigned_to = ?
                AND due_date < ?
                AND is_complete = FALSE
                AND requested_complete = FALSE
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setDate(1, Date.valueOf(today));
            ps.setObject(2, householdId, Types.OTHER);
            ps.setString(3, username);
            ps.setDate(4, Date.valueOf(today));

            return ps.executeUpdate();
        }
    }

    public void assignPoolChoreToKid(
            ChoreCard poolChore,
            String username,
            LocalDate dueDate,
            UUID householdId) throws SQLException {

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
                    complete,
                    household_id
                )
                VALUES (?, ?, FALSE, ?, ?, FALSE, ?, ?, ?, FALSE, ?, FALSE, ?)
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
            ps.setObject(9, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    private List<ChoreCard> findChores(
            String sql,
            UUID householdId) throws SQLException {

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                List<ChoreCard> chores = new ArrayList<>();

                while (rs.next()) {
                    chores.add(mapChoreCard(rs));
                }

                return chores;
            }
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

        return value.trim();
    }
}
