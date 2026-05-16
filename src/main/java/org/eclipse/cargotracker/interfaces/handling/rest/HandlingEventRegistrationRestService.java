package org.eclipse.cargotracker.interfaces.handling.rest;

import java.time.LocalDateTime;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.cargotracker.application.ApplicationEvents;
import org.eclipse.cargotracker.domain.model.cargo.TrackingId;
import org.eclipse.cargotracker.domain.model.handling.HandlingEvent;
import org.eclipse.cargotracker.domain.model.location.UnLocode;
import org.eclipse.cargotracker.domain.model.voyage.VoyageNumber;
import org.eclipse.cargotracker.interfaces.handling.HandlingEventRegistrationAttempt;

/**
 * RESTful service for registering handling events.
 * 
 * <p>This service provides a modern JSON-based REST API alternative to the file-based
 * batch upload mechanism. It offers real-time event registration with proper HTTP
 * status codes and error handling.
 * 
 * <p><strong>Thread Safety:</strong> This service is thread-safe as it is managed as a
 * {@code @RequestScoped} CDI bean, ensuring each HTTP request gets its own instance.
 * 
 * <p><strong>API Endpoint:</strong> {@code POST /rest/handling-events}
 * 
 * <p><strong>Usage Example:</strong>
 * <pre>{@code
 * POST /rest/handling-events
 * Content-Type: application/json
 * 
 * {
 *   "completionTime": "2024-01-15T14:30:00",
 *   "trackingId": "ABC123",
 *   "eventType": "LOAD",
 *   "unLocode": "USNYC",
 *   "voyageNumber": "V100"
 * }
 * }</pre>
 * 
 * <p><strong>Success Response:</strong>
 * <pre>{@code
 * HTTP/1.1 201 Created
 * Content-Type: application/json
 * 
 * {
 *   "message": "Handling event registration received successfully",
 *   "trackingId": "ABC123",
 *   "eventType": "LOAD"
 * }
 * }</pre>
 * 
 * <p><strong>Error Responses:</strong>
 * <ul>
 *   <li>400 Bad Request - Invalid input data or validation errors</li>
 *   <li>404 Not Found - Referenced cargo, location, or voyage does not exist</li>
 *   <li>500 Internal Server Error - Unexpected server error</li>
 * </ul>
 * 
 * @see HandlingEventRegistrationAttempt
 * @see ApplicationEvents
 */
@RequestScoped
@Path("/handling-events")
public class HandlingEventRegistrationRestService {

    @Inject
    private ApplicationEvents applicationEvents;

    /**
     * Registers a new handling event via REST API.
     * 
     * <p>This endpoint accepts a JSON payload containing handling event details and
     * submits it for asynchronous processing. The event is validated and then sent
     * to the application events system for proper registration.
     * 
     * <p><strong>Request Body Example:</strong>
     * <pre>{@code
     * {
     *   "completionTime": "2024-01-15T14:30:00",
     *   "trackingId": "XYZ789",
     *   "eventType": "RECEIVE",
     *   "unLocode": "CNHKG",
     *   "voyageNumber": null
     * }
     * }</pre>
     * 
     * <p><strong>Validation Rules:</strong>
     * <ul>
     *   <li>completionTime: Required, must be a valid ISO 8601 date-time</li>
     *   <li>trackingId: Required, minimum 4 characters</li>
     *   <li>eventType: Required, must be one of: RECEIVE, LOAD, UNLOAD, CUSTOMS, CLAIM</li>
     *   <li>unLocode: Required, must be exactly 5 characters (UN/LOCODE format)</li>
     *   <li>voyageNumber: Optional, required only for LOAD and UNLOAD events</li>
     * </ul>
     * 
     * @param request the handling event registration request containing all event details
     * @return HTTP response with appropriate status code and message:
     *         <ul>
     *           <li>201 Created - Event registration received successfully</li>
     *           <li>400 Bad Request - Invalid input or validation failure</li>
     *           <li>500 Internal Server Error - Unexpected error during processing</li>
     *         </ul>
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response registerHandlingEvent(
            @NotNull(message = "Request body is required") 
            @Valid HandlingEventRequest request) {
        
        try {
            // Validate event type
            HandlingEvent.Type eventType;
            try {
                eventType = HandlingEvent.Type.valueOf(request.getEventType().toUpperCase());
            } catch (IllegalArgumentException e) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new ErrorResponse(
                                "Invalid event type. Must be one of: RECEIVE, LOAD, UNLOAD, CUSTOMS, CLAIM",
                                "INVALID_EVENT_TYPE"))
                        .build();
            }

            // Validate voyage requirement
            if (eventType.requiresVoyage() && request.getVoyageNumber() == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new ErrorResponse(
                                "Voyage number is required for " + eventType + " events",
                                "VOYAGE_REQUIRED"))
                        .build();
            }

            if (eventType.prohibitsVoyage() && request.getVoyageNumber() != null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new ErrorResponse(
                                "Voyage number must not be provided for " + eventType + " events",
                                "VOYAGE_NOT_ALLOWED"))
                        .build();
            }

            // Parse completion time
            LocalDateTime completionTime;
            try {
                completionTime = LocalDateTime.parse(request.getCompletionTime());
            } catch (Exception e) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(new ErrorResponse(
                                "Invalid completion time format. Expected ISO 8601 format (e.g., 2024-01-15T14:30:00)",
                                "INVALID_DATE_FORMAT"))
                        .build();
            }

            // Create domain objects
            TrackingId trackingId = new TrackingId(request.getTrackingId());
            UnLocode unLocode = new UnLocode(request.getUnLocode());
            VoyageNumber voyageNumber = request.getVoyageNumber() != null 
                    ? new VoyageNumber(request.getVoyageNumber()) 
                    : null;

            // Create registration attempt
            HandlingEventRegistrationAttempt attempt = new HandlingEventRegistrationAttempt(
                    LocalDateTime.now(),
                    completionTime,
                    trackingId,
                    voyageNumber,
                    eventType,
                    unLocode);

            // Submit to application events for asynchronous processing
            applicationEvents.receivedHandlingEventRegistrationAttempt(attempt);

            // Return success response
            SuccessResponse response = new SuccessResponse(
                    "Handling event registration received successfully",
                    request.getTrackingId(),
                    request.getEventType());

            return Response.status(Response.Status.CREATED)
                    .entity(response)
                    .build();

        } catch (IllegalArgumentException e) {
            // Handle validation errors from domain objects (e.g., invalid UN/LOCODE format)
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(
                            "Validation error: " + e.getMessage(),
                            "VALIDATION_ERROR"))
                    .build();
        } catch (Exception e) {
            // Handle unexpected errors
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse(
                            "An unexpected error occurred while processing the request",
                            "INTERNAL_ERROR"))
                    .build();
        }
    }

    /**
     * Data Transfer Object for handling event registration requests.
     * 
     * <p>This class represents the JSON structure expected in the request body
     * when registering a new handling event via the REST API.
     */
    public static class HandlingEventRequest {

        @NotBlank(message = "Completion time is required")
        private String completionTime;

        @NotBlank(message = "Tracking ID is required")
        private String trackingId;

        @NotBlank(message = "Event type is required")
        private String eventType;

        @NotBlank(message = "UN/LOCODE is required")
        private String unLocode;

        private String voyageNumber;

        public HandlingEventRequest() {
            // Default constructor for JSON deserialization
        }

        public String getCompletionTime() {
            return completionTime;
        }

        public void setCompletionTime(String completionTime) {
            this.completionTime = completionTime;
        }

        public String getTrackingId() {
            return trackingId;
        }

        public void setTrackingId(String trackingId) {
            this.trackingId = trackingId;
        }

        public String getEventType() {
            return eventType;
        }

        public void setEventType(String eventType) {
            this.eventType = eventType;
        }

        public String getUnLocode() {
            return unLocode;
        }

        public void setUnLocode(String unLocode) {
            this.unLocode = unLocode;
        }

        public String getVoyageNumber() {
            return voyageNumber;
        }

        public void setVoyageNumber(String voyageNumber) {
            this.voyageNumber = voyageNumber;
        }
    }

    /**
     * Data Transfer Object for successful responses.
     */
    public static class SuccessResponse {
        private String message;
        private String trackingId;
        private String eventType;

        public SuccessResponse(String message, String trackingId, String eventType) {
            this.message = message;
            this.trackingId = trackingId;
            this.eventType = eventType;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getTrackingId() {
            return trackingId;
        }

        public void setTrackingId(String trackingId) {
            this.trackingId = trackingId;
        }

        public String getEventType() {
            return eventType;
        }

        public void setEventType(String eventType) {
            this.eventType = eventType;
        }
    }

    /**
     * Data Transfer Object for error responses.
     */
    public static class ErrorResponse {
        private String error;
        private String errorCode;

        public ErrorResponse(String error, String errorCode) {
            this.error = error;
            this.errorCode = errorCode;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }

        public String getErrorCode() {
            return errorCode;
        }

        public void setErrorCode(String errorCode) {
            this.errorCode = errorCode;
        }
    }
}

// Made with Bob
