package familycommandcenter.model;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.UUID;

/**
 * DAO for the points_bank table.
 * Handles the running total of points each kid has earned or spent.
 */
public final class PointsBankDAO {

    private final DataSource ds;

    public PointsBankDAO(DataSource ds) {
        this.ds = ds;
    }

    public void makeSureTableExists() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS points_bank (
                    user_name VARCHAR(100) NOT NULL,
                    total_points INTEGER NOT NULL DEFAULT 0,
                    household_id UUID NOT NULL
                )
                """;

        String addHouseholdColumn = """
                ALTER TABLE points_bank
                ADD COLUMN IF NOT EXISTS household_id UUID
                """;

        String removeUnsafeOldPoints = """
                DELETE FROM points_bank
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE points_bank
                ALTER COLUMN household_id SET NOT NULL
                """;

        String dropOldPrimaryKey = """
                ALTER TABLE points_bank
                DROP CONSTRAINT IF EXISTS points_bank_pkey
                """;

        String dropOldUsernameUnique = """
                ALTER TABLE points_bank
                DROP CONSTRAINT IF EXISTS points_bank_user_name_key
                """;

        String createHouseholdUserIndex = """
                CREATE UNIQUE INDEX IF NOT EXISTS idx_points_bank_user_household
                ON points_bank (user_name, household_id)
                """;

        try (Connection connection = ds.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(createTable)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Old point balances without household_id are unsafe in a multi-family app.
             * Since this is still development data, delete them instead of risking
             * shared point balances between households.
             */
            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeOldPoints)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(requireHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Older versions may have used user_name as the primary key/unique key.
             * That will not work once two households can both have a kid named Liam.
             */
            try (PreparedStatement ps = connection.prepareStatement(dropOldPrimaryKey)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(dropOldUsernameUnique)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(createHouseholdUserIndex)) {
                ps.executeUpdate();
            }
        }
    }

    public int getPoints(
            String username,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT total_points
                FROM points_bank
                WHERE user_name = ?
                AND household_id = ?
                """;

        try (Connection connection = ds.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setObject(2, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt("total_points") : 0;
            }
        }
    }

    public void addPoints(
            String username,
            int pointsToAdd,
            UUID householdId) throws SQLException {

        String sql = """
                INSERT INTO points_bank (
                    user_name,
                    total_points,
                    household_id
                )
                VALUES (?, ?, ?)
                ON CONFLICT (user_name, household_id) DO UPDATE
                    SET total_points = points_bank.total_points + EXCLUDED.total_points
                """;

        try (Connection connection = ds.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setInt(2, pointsToAdd);
            ps.setObject(3, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    public void awardPoints(
            String username,
            int points,
            UUID householdId) throws SQLException {

        addPoints(username, points, householdId);
    }

    public void deductPoints(
            String username,
            int points,
            UUID householdId) throws SQLException {

        addPoints(username, -points, householdId);
    }
}