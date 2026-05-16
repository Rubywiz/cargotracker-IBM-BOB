package org.eclipse.cargotracker.infrastructure.health;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.HealthCheckResponseBuilder;
import org.eclipse.microprofile.health.Readiness;

import java.time.Instant;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Database health check for readiness probe.
 * Verifies that the database is accessible and operational.
 * This check is used by container orchestration platforms (e.g., Kubernetes)
 * to determine if the application is ready to accept traffic.
 */
@Readiness
@ApplicationScoped
public class DatabaseHealthCheck implements HealthCheck {

    private static final Logger LOGGER = Logger.getLogger(DatabaseHealthCheck.class.getName());

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public HealthCheckResponse call() {
        HealthCheckResponseBuilder responseBuilder = HealthCheckResponse.named("database-connection");

        try {
            // Execute a simple query to verify database connectivity
            // Using a native query to check if Location table exists and is accessible
            Long count = entityManager.createQuery(
                "SELECT COUNT(l) FROM Location l", Long.class)
                .setMaxResults(1)
                .getSingleResult();

            // Database is accessible
            responseBuilder.up()
                .withData("connection", "active")
                .withData("location_count", count)
                .withData("timestamp", Instant.now().toString());

            LOGGER.log(Level.FINE, "Database health check passed. Location count: {0}", count);

        } catch (Exception e) {
            // Database is not accessible
            responseBuilder.down()
                .withData("connection", "failed")
                .withData("error", e.getClass().getName())
                .withData("message", e.getMessage() != null ? e.getMessage() : "Unknown error")
                .withData("timestamp", Instant.now().toString());

            LOGGER.log(Level.SEVERE, "Database health check failed", e);
        }

        return responseBuilder.build();
    }
}

// Made with Bob
