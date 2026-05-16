package org.eclipse.cargotracker.domain.model.handling;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.cargotracker.domain.model.cargo.Cargo;
import org.eclipse.cargotracker.domain.model.cargo.CargoRepository;
import org.eclipse.cargotracker.domain.model.cargo.TrackingId;
import org.eclipse.cargotracker.domain.model.location.Location;
import org.eclipse.cargotracker.domain.model.location.LocationRepository;
import org.eclipse.cargotracker.domain.model.location.UnLocode;
import org.eclipse.cargotracker.domain.model.voyage.Voyage;
import org.eclipse.cargotracker.domain.model.voyage.VoyageNumber;
import org.eclipse.cargotracker.domain.model.voyage.VoyageRepository;

/**
 * Factory for creating {@link HandlingEvent} instances.
 *
 * <p>This factory encapsulates the creation logic for handling events, ensuring that all
 * required domain objects (Cargo, Voyage, Location) are properly resolved from their
 * respective repositories before creating the event. This prevents the creation of
 * invalid handling events with non-existent references.
 *
 * <p><strong>Thread Safety:</strong> This factory is thread-safe as it is managed as an
 * {@code @ApplicationScoped} CDI bean. The injected repositories are also thread-safe,
 * making this factory suitable for concurrent use in a multi-threaded environment.
 *
 * <p><strong>Usage Example:</strong>
 * <pre>{@code
 * @Inject
 * private HandlingEventFactory factory;
 *
 * public void registerEvent() {
 *     try {
 *         HandlingEvent event = factory.createHandlingEvent(
 *             LocalDateTime.now(),                    // registration time
 *             LocalDateTime.now().minusHours(2),      // completion time
 *             new TrackingId("ABC123"),               // cargo tracking ID
 *             new VoyageNumber("V100"),               // voyage number (or null)
 *             new UnLocode("USNYC"),                  // location UN/LOCODE
 *             HandlingEvent.Type.LOAD                 // event type
 *         );
 *         // Process the created event...
 *     } catch (CannotCreateHandlingEventException e) {
 *         // Handle creation failure...
 *     }
 * }
 * }</pre>
 *
 * @see HandlingEvent
 * @see CargoRepository
 * @see VoyageRepository
 * @see LocationRepository
 */
@ApplicationScoped
public class HandlingEventFactory implements Serializable {

  private static final long serialVersionUID = 1L;

  @Inject private CargoRepository cargoRepository;
  @Inject private VoyageRepository voyageRepository;
  @Inject private LocationRepository locationRepository;

  /**
   * Creates a new {@link HandlingEvent} with the specified parameters.
   *
   * <p>This method validates that the cargo, location, and (if provided) voyage exist
   * in the system before creating the handling event. The voyage parameter is optional
   * and should only be provided for event types that require it (LOAD and UNLOAD).
   *
   * <p><strong>Usage Example:</strong>
   * <pre>{@code
   * // Create a RECEIVE event (no voyage required)
   * HandlingEvent receiveEvent = factory.createHandlingEvent(
   *     LocalDateTime.now(),                    // registration time
   *     LocalDateTime.now().minusHours(1),      // completion time
   *     new TrackingId("XYZ789"),               // cargo tracking ID
   *     null,                                   // no voyage for RECEIVE
   *     new UnLocode("CNHKG"),                  // Hong Kong
   *     HandlingEvent.Type.RECEIVE
   * );
   *
   * // Create a LOAD event (voyage required)
   * HandlingEvent loadEvent = factory.createHandlingEvent(
   *     LocalDateTime.now(),                    // registration time
   *     LocalDateTime.now().minusMinutes(30),   // completion time
   *     new TrackingId("XYZ789"),               // cargo tracking ID
   *     new VoyageNumber("V200"),               // voyage number
   *     new UnLocode("CNHKG"),                  // Hong Kong
   *     HandlingEvent.Type.LOAD
   * );
   * }</pre>
   *
   * @param registrationTime the time when this event was received and registered by the system;
   *                         must not be null
   * @param completionTime the time when the physical handling operation was completed
   *                       (e.g., when loading finished); must not be null and typically
   *                       occurs before or at the registration time
   * @param trackingId the unique tracking identifier of the cargo being handled;
   *                   must not be null and must correspond to an existing cargo
   * @param voyageNumber the voyage number if the event is associated with a voyage
   *                     (required for LOAD and UNLOAD events, must be null for other types);
   *                     if provided, must correspond to an existing voyage
   * @param unlocode the United Nations Location Code (UN/LOCODE) identifying where
   *                 the handling event took place; must not be null and must correspond
   *                 to an existing location in the system
   * @param type the type of handling event (RECEIVE, LOAD, UNLOAD, CLAIM, or CUSTOMS);
   *             must not be null and must be consistent with the voyage parameter
   *             (LOAD/UNLOAD require a voyage, others must not have one)
   *
   * @return a newly created and validated {@link HandlingEvent} instance
   *
   * @throws CannotCreateHandlingEventException if the handling event cannot be created,
   *         which wraps one of the following specific exceptions:
   *         <ul>
   *           <li>{@link UnknownCargoException} - if no cargo exists with the given tracking ID</li>
   *           <li>{@link UnknownVoyageException} - if a voyage number is provided but no
   *               corresponding voyage exists</li>
   *           <li>{@link UnknownLocationException} - if no location exists with the given UN/LOCODE</li>
   *           <li>{@link IllegalArgumentException} - if the event type and voyage parameter
   *               are inconsistent (e.g., LOAD without a voyage, or RECEIVE with a voyage)</li>
   *         </ul>
   */
  // TODO [Clean Code] Look at the exception handling more seriously.
  public HandlingEvent createHandlingEvent(
      LocalDateTime registrationTime,
      LocalDateTime completionTime,
      TrackingId trackingId,
      VoyageNumber voyageNumber,
      UnLocode unlocode,
      HandlingEvent.Type type)
      throws CannotCreateHandlingEventException {
    Cargo cargo = findCargo(trackingId);
    Voyage voyage = findVoyage(voyageNumber);
    Location location = findLocation(unlocode);

    try {
      if (voyage == null) {
        return new HandlingEvent(cargo, completionTime, registrationTime, type, location);
      } else {
        return new HandlingEvent(cargo, completionTime, registrationTime, type, location, voyage);
      }
    } catch (Exception e) {
      throw new CannotCreateHandlingEventException(e);
    }
  }

  private Cargo findCargo(TrackingId trackingId) throws UnknownCargoException {
    Cargo cargo = cargoRepository.find(trackingId);

    if (cargo == null) {
      throw new UnknownCargoException(trackingId);
    }

    return cargo;
  }

  private Voyage findVoyage(VoyageNumber voyageNumber) throws UnknownVoyageException {
    if (voyageNumber == null) {
      return null;
    }

    Voyage voyage = voyageRepository.find(voyageNumber);

    if (voyage == null) {
      throw new UnknownVoyageException(voyageNumber);
    }

    return voyage;
  }

  private Location findLocation(UnLocode unlocode) throws UnknownLocationException {
    Location location = locationRepository.find(unlocode);

    if (location == null) {
      throw new UnknownLocationException(unlocode);
    }

    return location;
  }
}
