package org.eclipse.cargotracker.infrastructure.health;

import jakarta.annotation.Resource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.jms.Connection;
import jakarta.jms.ConnectionFactory;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.HealthCheckResponseBuilder;
import org.eclipse.microprofile.health.Readiness;

import java.time.Instant;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * JMS health check for readiness probe.
 * Verifies that the JMS ConnectionFactory is available and connections can be established.
 * This check is used by container orchestration platforms (e.g., Kubernetes)
 * to determine if the application is ready to accept traffic.
 */
@Readiness
@ApplicationScoped
public class JmsHealthCheck implements HealthCheck {

    private static final Logger LOGGER = Logger.getLogger(JmsHealthCheck.class.getName());

    @Resource(lookup = "java:comp/DefaultJMSConnectionFactory")
    private ConnectionFactory connectionFactory;

    @Override
    public HealthCheckResponse call() {
        HealthCheckResponseBuilder responseBuilder = HealthCheckResponse.named("jms-connection");

        Connection connection = null;
        try {
            // Attempt to create a JMS connection to verify availability
            connection = connectionFactory.createConnection();
            
            // If we can create a connection, JMS is available
            responseBuilder.up()
                .withData("connection", "active")
                .withData("factory", "available")
                .withData("timestamp", Instant.now().toString());

            LOGGER.log(Level.FINE, "JMS health check passed. Connection factory is available.");

        } catch (Exception e) {
            // JMS is not accessible
            responseBuilder.down()
                .withData("connection", "failed")
                .withData("error", e.getClass().getName())
                .withData("message", e.getMessage() != null ? e.getMessage() : "Unknown error")
                .withData("timestamp", Instant.now().toString());

            LOGGER.log(Level.SEVERE, "JMS health check failed", e);

        } finally {
            // Always close the connection to avoid resource leaks
            if (connection != null) {
                try {
                    connection.close();
                } catch (Exception e) {
                    LOGGER.log(Level.WARNING, "Failed to close JMS connection during health check", e);
                }
            }
        }

        return responseBuilder.build();
    }
}

// Made with Bob
