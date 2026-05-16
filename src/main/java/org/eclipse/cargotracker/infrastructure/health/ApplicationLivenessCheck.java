package org.eclipse.cargotracker.infrastructure.health;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.HealthCheckResponseBuilder;
import org.eclipse.microprofile.health.Liveness;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.time.Instant;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Application liveness check for liveness probe.
 * Verifies that the application is running and not in a deadlocked or unrecoverable state.
 * This check is used by container orchestration platforms (e.g., Kubernetes)
 * to determine if the application should be restarted.
 * 
 * A liveness check should be simple and always return UP unless there's a critical failure
 * that requires application restart. This implementation includes basic JVM health metrics.
 */
@Liveness
@ApplicationScoped
public class ApplicationLivenessCheck implements HealthCheck {

    private static final Logger LOGGER = Logger.getLogger(ApplicationLivenessCheck.class.getName());
    
    // Memory threshold for warning (90% of max heap)
    private static final double MEMORY_WARNING_THRESHOLD = 0.90;

    @Override
    public HealthCheckResponse call() {
        HealthCheckResponseBuilder responseBuilder = HealthCheckResponse.named("application-liveness");

        try {
            // Get JVM memory information
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
            
            long usedMemory = heapUsage.getUsed();
            long maxMemory = heapUsage.getMax();
            double memoryUsageRatio = (double) usedMemory / maxMemory;
            
            // Calculate memory percentage
            long memoryPercentage = Math.round(memoryUsageRatio * 100);
            
            // Application is alive - return UP
            // Note: We return UP even if memory is high, as this is a liveness check
            // High memory should be handled by monitoring/alerting, not by restarting the app
            responseBuilder.up()
                .withData("status", "alive")
                .withData("uptime_ms", ManagementFactory.getRuntimeMXBean().getUptime())
                .withData("heap_used_mb", usedMemory / (1024 * 1024))
                .withData("heap_max_mb", maxMemory / (1024 * 1024))
                .withData("heap_usage_percent", memoryPercentage)
                .withData("timestamp", Instant.now().toString());
            
            // Log warning if memory usage is high (but still return UP)
            if (memoryUsageRatio > MEMORY_WARNING_THRESHOLD) {
                LOGGER.log(Level.WARNING, 
                    "High memory usage detected: {0}% of max heap", memoryPercentage);
                responseBuilder.withData("warning", "High memory usage");
            }
            
            LOGGER.log(Level.FINE, "Application liveness check passed. Memory usage: {0}%", 
                memoryPercentage);

        } catch (Exception e) {
            // Only return DOWN if there's a critical failure
            // In most cases, we should return UP to avoid unnecessary restarts
            responseBuilder.down()
                .withData("status", "critical_failure")
                .withData("error", e.getClass().getName())
                .withData("message", e.getMessage() != null ? e.getMessage() : "Unknown error")
                .withData("timestamp", Instant.now().toString());

            LOGGER.log(Level.SEVERE, "Application liveness check failed critically", e);
        }

        return responseBuilder.build();
    }
}

// Made with Bob
