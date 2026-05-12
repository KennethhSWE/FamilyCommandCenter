package familycommandcenter.calendar;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class CalendarRepository {

    private final DataSource dataSource;

    public CalendarRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String createTable = """
                CREATE TABLE IF NOT EXISTS calendar_entries (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(150) NOT NULL,
                    entry_type VARCHAR(20) NOT NULL,
                    entry_date DATE NOT NULL,
                    paid BOOLEAN NOT NULL DEFAULT FALSE,
                    amount NUMERIC(10, 2),
                    notes TEXT,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    household_id UUID NOT NULL
                )
                """;

        String addAmountColumn = """
                ALTER TABLE calendar_entries
                ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2)
                """;

        String addNotesColumn = """
                ALTER TABLE calendar_entries
                ADD COLUMN IF NOT EXISTS notes TEXT
                """;

        String addHouseholdColumn = """
                ALTER TABLE calendar_entries
                ADD COLUMN IF NOT EXISTS household_id UUID
                """;

        String removeUnsafeOldEntries = """
                DELETE FROM calendar_entries
                WHERE household_id IS NULL
                """;

        String requireHouseholdColumn = """
                ALTER TABLE calendar_entries
                ALTER COLUMN household_id SET NOT NULL
                """;

        String createHouseholdIndex = """
                CREATE INDEX IF NOT EXISTS idx_calendar_entries_household_id
                ON calendar_entries (household_id)
                """;

        try (Connection connection = dataSource.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(createTable)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addAmountColumn)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addNotesColumn)) {
                ps.executeUpdate();
            }

            try (PreparedStatement ps = connection.prepareStatement(addHouseholdColumn)) {
                ps.executeUpdate();
            }

            /*
             * Old calendar entries without household_id are unsafe in a multi-family app.
             * Since this is still development data, delete them instead of exposing
             * them across households.
             */
            try (PreparedStatement ps = connection.prepareStatement(removeUnsafeOldEntries)) {
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

    public List<FamilyCalendarEntry> findAllEntries(UUID householdId)
            throws SQLException {

        String sql = """
                SELECT *
                FROM calendar_entries
                WHERE household_id = ?
                ORDER BY entry_date ASC, created_at ASC
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setObject(1, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                List<FamilyCalendarEntry> entries = new ArrayList<>();

                while (rs.next()) {
                    entries.add(mapEntry(rs));
                }

                return entries;
            }
        }
    }

    public Optional<FamilyCalendarEntry> findById(
            int entryId,
            UUID householdId) throws SQLException {

        String sql = """
                SELECT *
                FROM calendar_entries
                WHERE id = ?
                AND household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, entryId);
            ps.setObject(2, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapEntry(rs));
                }

                return Optional.empty();
            }
        }
    }

    public FamilyCalendarEntry saveEntry(
            CreateCalendarEntryRequest request,
            UUID householdId) throws SQLException {

        String sql = """
                INSERT INTO calendar_entries (
                    title,
                    entry_type,
                    entry_date,
                    paid,
                    amount,
                    notes,
                    household_id
                )
                VALUES (?, ?, ?, FALSE, ?, ?, ?)
                RETURNING *
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, request.getTitle().trim());
            ps.setString(2, request.getType().name());
            ps.setDate(3, Date.valueOf(request.getEntryDate()));
            ps.setBigDecimal(4, request.getAmount());
            ps.setString(5, cleanNotes(request.getNotes()));
            ps.setObject(6, householdId, Types.OTHER);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapEntry(rs);
                }

                throw new SQLException("Calendar entry was not created");
            }
        }
    }

    public boolean toggleBillPaid(
            int entryId,
            UUID householdId) throws SQLException {

        String sql = """
                UPDATE calendar_entries
                SET paid = NOT paid
                WHERE id = ?
                AND household_id = ?
                AND entry_type = 'BILL'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, entryId);
            ps.setObject(2, householdId, Types.OTHER);

            return ps.executeUpdate() == 1;
        }
    }

    public boolean deleteEntry(
            int entryId,
            UUID householdId) throws SQLException {

        String sql = """
                DELETE FROM calendar_entries
                WHERE id = ?
                AND household_id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, entryId);
            ps.setObject(2, householdId, Types.OTHER);

            return ps.executeUpdate() == 1;
        }
    }

    private FamilyCalendarEntry mapEntry(ResultSet rs) throws SQLException {
        Timestamp createdAt = rs.getTimestamp("created_at");

        return new FamilyCalendarEntry(
                rs.getInt("id"),
                rs.getString("title"),
                CalendarEntryType.valueOf(rs.getString("entry_type")),
                rs.getDate("entry_date").toLocalDate(),
                rs.getBoolean("paid"),
                rs.getBigDecimal("amount"),
                rs.getString("notes"),
                createdAt != null ? createdAt.toLocalDateTime() : null);
    }

    private String cleanNotes(String notes) {
        if (notes == null || notes.isBlank()) {
            return null;
        }

        return notes.trim();
    }
}