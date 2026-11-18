package com.bookwithtech.util;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Lifecycle listener — shuts the HikariCP pool cleanly when the WAR is undeployed
 * or Tomcat shuts down, preventing "connection leak" warnings.
 *
 * NOTE: If you are on Tomcat 9 / javax.servlet, change the import to:
 *   import javax.servlet.ServletContextEvent;
 *   import javax.servlet.ServletContextListener;
 *   import javax.servlet.annotation.WebListener;
 */
@WebListener
public class AppLifecycleListener implements ServletContextListener {

    private static final Logger log = LoggerFactory.getLogger(AppLifecycleListener.class);

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        log.info("BookWithTech application starting up…");
        // Pool is lazy-initialised on first getConnection() call.
        // Pre-warm it here if desired:
        try {
            DBConnectionManager.getConnection().close();
            log.info("DB connection pool pre-warmed successfully.");
        } catch (Exception e) {
            log.error("DB pool pre-warm failed — check .env / environment variables: {}", e.getMessage());
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        log.info("BookWithTech application shutting down — closing DB pool…");
        DBConnectionManager.shutdown();
    }
}
