package com.bookwithtech.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * SINGLE SOURCE OF TRUTH for database connections.
 *
 * ── Credential loading strategy (dotenv-java) ──────────────────────────────
 * 1. On startup, tries to load a .env file from the project root (for local dev
 *    in NetBeans).  If .env is missing (e.g., production server), dotenv silently
 *    falls back to real OS environment variables — no code change needed.
 * 2. Never hardcode host/port/db/user/password here or anywhere else.
 *
 * ── Supabase SSL requirement ────────────────────────────────────────────────
 * Supabase PostgreSQL requires SSL on port 5432.
 * The JDBC URL includes ?sslmode=require to enforce this.
 * Without it the connection will be refused.
 *
 * ── HikariCP pool settings ──────────────────────────────────────────────────
 * Pool size is intentionally kept small because Supabase's free/pro tier has a
 * limited maximum-connections budget (typically 25–60 depending on plan).
 */
public final class DBConnectionManager {

    private static final Logger log = LoggerFactory.getLogger(DBConnectionManager.class);

    private static volatile HikariDataSource dataSource;

    /** Private constructor — this class is a singleton utility. */
    private DBConnectionManager() {}

    /**
     * Initialises the HikariCP pool once.  Thread-safe via double-checked locking.
     * Called automatically on first {@link #getConnection()} call.
     */
    private static void init() {
        if (dataSource != null) return;

        synchronized (DBConnectionManager.class) {
            if (dataSource != null) return;

            // ── Load .env (local dev) OR fall back to OS env vars (production) ──
            Dotenv dotenv;
            try {
                dotenv = Dotenv.configure()
                               .ignoreIfMissing()  // OK if .env not present in prod
                               .load();
            } catch (DotenvException e) {
                log.warn("dotenv: could not load .env file — falling back to OS env vars: {}", e.getMessage());
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            }

            String host     = getEnv(dotenv, "SUPABASE_DB_HOST");
            String port     = getEnv(dotenv, "SUPABASE_DB_PORT");
            String dbName   = getEnv(dotenv, "SUPABASE_DB_NAME");
            String user     = getEnv(dotenv, "SUPABASE_DB_USER");
            String password = getEnv(dotenv, "SUPABASE_DB_PASSWORD");

            // ── Build JDBC URL — SSL is MANDATORY for Supabase ───────────────
            // sslmode=require  → enforces TLS (Supabase rejects without it)
            // connectTimeout=10 → fail fast instead of hanging
            String jdbcUrl = String.format(
                "jdbc:postgresql://%s:%s/%s?sslmode=require&connectTimeout=10",
                host, port, dbName
            );

            log.info("DBConnectionManager: initialising HikariCP pool → {}:{}/{}", host, port, dbName);

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(user);
            config.setPassword(password);
            config.setDriverClassName("org.postgresql.Driver");

            // ── Pool sizing — stay within Supabase connection budget ──────────
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setIdleTimeout(300_000);          // 5 min
            config.setConnectionTimeout(20_000);     // 20 sec max wait for connection
            config.setMaxLifetime(1_800_000);        // 30 min — rotate before Supabase kills it

            // Connection health check query (cheap)
            config.setConnectionTestQuery("SELECT 1");

            config.setPoolName("BookWithTech-Pool");

            dataSource = new HikariDataSource(config);
            log.info("DBConnectionManager: pool initialised successfully.");
        }
    }

    /**
     * Returns a live {@link Connection} from the pool.
     * Caller MUST close the connection (use try-with-resources) — returning it
     * to the pool automatically.
     *
     * @throws SQLException if the pool cannot provide a connection
     */
    public static Connection getConnection() throws SQLException {
        if (dataSource == null) init();
        return dataSource.getConnection();
    }

    /**
     * Gracefully shuts down the pool.  Call this from a ServletContextListener
     * on application undeploy / server shutdown.
     */
    public static void shutdown() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            log.info("DBConnectionManager: pool shut down.");
        }
    }

    // ── Internal helper ────────────────────────────────────────────────────

    /**
     * Reads a key from dotenv first, then OS env vars, then throws if absent.
     */
    private static String getEnv(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value == null || value.isBlank()) {
            value = System.getenv(key);
        }
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                "Missing required environment variable: " + key
                + ". Set it in .env (local dev) or as an OS env var (production)."
            );
        }
        return value;
    }
}
