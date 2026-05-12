package familycommandcenter.parent;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Optional;
import java.util.UUID;

public class ParentPinRepository {

    private final DataSource dataSource;

    public ParentPinRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS parent_pin (
                    id SERIAL PRIMARY KEY,
                    pin_hash VARCHAR(255) NOT NULL,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    household_id UUID NOT NULL
                )
                """;

        String addHouseholdColumn = """
                ALTER TABLE parent_pin
                ADD COLUMN IF NOT EXISTS household_id UUID
                """;

        String removeUnsafeOldPins = """
                DELETE FROM parent_pin
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE parent_pin
                ALTER COLUMN household_id SET NOT NULL
                """;

        String createHouseholdIndex = """
                CREATE UNIQUE INDEX IF NOT EXISTS idx_parent_pin_household_id
                ON parent_pin (household_id)
                """;

        try (Connection connection = dataSource.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(createTable)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Old parent PIN rows without household_id are unsafe because they
             * would act like one shared parent PIN for every family.
             */
            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeOldPins)) {
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

    public boolean hasPin(UUID householdId) throws SQLException {
        String sql = """
                SELECT 1
                FROM parent_pin
                WHERE household_id = ?
                LIMIT 1
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    public Optional<String> findPinHash(UUID householdId) throws SQLException {
        String sql = """
                SELECT pin_hash
                FROM parent_pin
                WHERE household_id = ?
                LIMIT 1
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(rs.getString("pin_hash"));
                }

                return Optional.empty();
            }
        }
    }

    public void saveFirstPinHash(
            String pinHash,
            UUID householdId) throws SQLException {

        String sql = """
                INSERT INTO parent_pin (
                    pin_hash,
                    household_id
                )
                VALUES (?, ?)
                ON CONFLICT (household_id) DO NOTHING
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, pinHash);
            ps.setObject(2, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }

    public void updatePinHash(
            String pinHash,
            UUID householdId) throws SQLException {

        String sql = """
                UPDATE parent_pin
                SET pin_hash = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, pinHash);
            ps.setObject(2, householdId, Types.OTHER);

            ps.executeUpdate();
        }
    }
}