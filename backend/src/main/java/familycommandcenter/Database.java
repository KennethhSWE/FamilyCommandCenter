package familycommandcenter;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import io.github.cdimascio.dotenv.Dotenv;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Centralized PostgreSQL connection-pool (HikariCP).  
 * All DAOs receive the {@link javax.sql.DataSource} produced here.
 */
public final class Database {

    private static final Dotenv DOTENV = Dotenv.configure()
        .ignoreIfMissing()
        .load();
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
     *  Internal pool initialization
     * ---------------------------------------------------------------- */
    private static HikariDataSource initPool() {
        HikariConfig cfg = new HikariConfig();

        /* Use env-vars first (safe for prod / CI); fall back to defaults
           so local dev “just works” without extra setup. */
        String dbUrl = System.getenv("FCC_DB_URL");
if (dbUrl == null || dbUrl.isBlank()) {
    dbUrl = DOTENV.get("FCC_DB_URL");
}
if (dbUrl == null || dbUrl.isBlank()) {
    dbUrl = "jdbc:postgresql://localhost:5432/family_command_center";
}

String dbUser = System.getenv("FCC_DB_USER");
if (dbUser == null || dbUser.isBlank()) {
    dbUser = DOTENV.get("FCC_DB_USER");
}
if (dbUser == null || dbUser.isBlank()) {
    dbUser = "postgres";
}

String dbPass = System.getenv("FCC_DB_PASS");
if (dbPass == null || dbPass.isBlank()) {
    dbPass = DOTENV.get("FCC_DB_PASS");
}
if (dbPass == null) {
    dbPass = "";
}

cfg.setJdbcUrl(dbUrl);
cfg.setUsername(dbUser);
cfg.setPassword(dbPass);

        cfg.setMaximumPoolSize(10);
        cfg.setPoolName("FamilyCommandCenter-Hikari");

        return new HikariDataSource(cfg);
    }
}
