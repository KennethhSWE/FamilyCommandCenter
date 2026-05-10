package familycommandcenter.calendar;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class CalendarRepository {

    private final DataSource dataSource;

    public CalendarRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String sql = """
                CREATE TABLE IF NOT EXISTS calendar_entries (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(150) NOT NULL,
                    entry_type VARCHAR(20) NOT NULL,
                    entry_date DATE NOT NULL,
                    paid BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.executeUpdate();
        }
    }

    public List<FamilyCalendarEntry> findAllEntries() throws SQLException {
        String sql = """
                SELECT *
                FROM calendar_entries
                ORDER BY entry_date ASC, created_at ASC
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            List<FamilyCalendarEntry> entries = new ArrayList<>();

            while (rs.next()) {
                entries.add(mapEntry(rs));
            }

            return entries;
        }
    }

    public Optional<FamilyCalendarEntry> findById(int entryId) throws SQLException {
        String sql = """
                SELECT *
                FROM calendar_entries
                WHERE id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, entryId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapEntry(rs));
                }

                return Optional.empty();
            }
        }
    }

    public FamilyCalendarEntry saveEntry(CreateCalendarEntryRequest request)
            throws SQLException {

        String sql = """
                INSERT INTO calendar_entries (
                    title,
                    entry_type,
                    entry_date,
                    paid
                )
                VALUES (?, ?, ?, FALSE)
                RETURNING *
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, request.getTitle().trim());
            ps.setString(2, request.getType().name());
            ps.setDate(3, Date.valueOf(request.getEntryDate()));

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapEntry(rs);
                }

                throw new SQLException("Calendar entry was not created");
            }
        }
    }

    public boolean toggleBillPaid(int entryId) throws SQLException {
        String sql = """
                UPDATE calendar_entries
                SET paid = NOT paid
                WHERE id = ?
                AND entry_type = 'BILL'
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, entryId);
            return ps.executeUpdate() == 1;
        }
    }

    public boolean deleteEntry(int entryId) throws SQLException {
        String sql = """
                DELETE FROM calendar_entries
                WHERE id = ?
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setInt(1, entryId);
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
                createdAt != null ? createdAt.toLocalDateTime() : null);
    }
}