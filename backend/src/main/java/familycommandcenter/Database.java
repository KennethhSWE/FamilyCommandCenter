package familycommandcenter;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Centralised PostgreSQL connection-pool (HikariCP).  
 * All DAOs receive the {@link javax.sql.DataSource} produced here.
 */
public final class Database {

    private static final HikariDataSource DS = initPool();

    private Database() {
        /* utility class – do not instantiate */
    }

    /* ------------------------------------------------------------------
     *  Public accessors
     * ---------------------------------------------------------------- */
    public static DataSource getDataSource() {
        return DS;
    }

    public static Connection getConnection() throws SQLException {
        return DS.getConnection();
    }

    /* ------------------------------------------------------------------
     *  Internal pool initialisation
     * ---------------------------------------------------------------- */
    private static HikariDataSource initPool() {
        HikariConfig cfg = new HikariConfig();

        /* Use env-vars first (safe for prod / CI); fall back to defaults
           so local dev “just works” without extra setup. */
        cfg.setJdbcUrl (System.getenv().getOrDefault(
                "FCC_DB_URL", "jdbc:postgresql://localhost:5432/family_command_center"));
        cfg.setUsername(System.getenv().getOrDefault(
                "FCC_DB_USER", "kenneth"));
        cfg.setPassword(System.getenv().getOrDefault(
                "FCC_DB_PASS", "EllaAustin1"));

        cfg.setMaximumPoolSize(10);
        cfg.setPoolName("FamilyCommandCenter-Hikari");

        return new HikariDataSource(cfg);
    }
}
