package familycommandcenter;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

public final class Database {

    private static final HikariDataSource ds = init();

    private Database() {}                      // utility class

    private static HikariDataSource init() {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl("jdbc:postgresql://localhost:5432/family_command_center");
        cfg.setUsername("kenneth");            // <- your role
        cfg.setPassword("EllaAustin1");   // <- the password you just set
        cfg.setMaximumPoolSize(10);
        return new HikariDataSource(cfg);
    }

    /** Preferred: pass the pool around as a DataSource. */
    public static DataSource getDataSource() {
        return ds;
    }

    /** Convenience – works exactly like before. */
    public static Connection getConnection() throws SQLException {
        return ds.getConnection();
    }
}
