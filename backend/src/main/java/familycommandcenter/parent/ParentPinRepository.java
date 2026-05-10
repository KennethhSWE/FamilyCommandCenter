package familycommandcenter.parent;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public class ParentPinRepository {

    private final DataSource dataSource;

    public ParentPinRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void makeSureTableExists() throws SQLException {
        String sql = """
                CREATE TABLE IF NOT EXISTS parent_pin (
                    id SERIAL PRIMARY KEY,
                    pin_hash VARCHAR(255) NOT NULL,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.executeUpdate();
        }
    }

    public boolean hasPin() throws SQLException {
        String sql = """
                SELECT 1
                FROM parent_pin
                LIMIT 1
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            return rs.next();
        }
    }

    public Optional<String> findPinHash() throws SQLException {
        String sql = """
                SELECT pin_hash
                FROM parent_pin
                ORDER BY id ASC
                LIMIT 1
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                return Optional.of(rs.getString("pin_hash"));
            }

            return Optional.empty();
        }
    }

    public void saveFirstPinHash(String pinHash) throws SQLException {
        String sql = """
                INSERT INTO parent_pin (pin_hash)
                VALUES (?)
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, pinHash);
            ps.executeUpdate();
        }
    }

    public void updatePinHash(String pinHash) throws SQLException {
        String sql = """
                UPDATE parent_pin
                SET pin_hash = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = (
                    SELECT id
                    FROM parent_pin
                    ORDER BY id ASC
                    LIMIT 1
                )
                """;

        try (Connection connection = dataSource.getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {

            ps.setString(1, pinHash);
            ps.executeUpdate();
        }
    }
}