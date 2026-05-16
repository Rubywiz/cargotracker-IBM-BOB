# Eclipse Cargo Tracker - DDD Architecture Diagram

## Overview

This document provides a comprehensive architectural view of the Eclipse Cargo Tracker application, showing the four DDD bounded contexts, their key classes, and interactions.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[JSF/PrimeFaces UI]
        REST[REST APIs]
        SSE[Server-Sent Events]
        MOBILE[Mobile Event Logger]
        BATCH[File-based Batch]
    end

    subgraph "Application Layer"
        BS[BookingService]
        HES[HandlingEventService]
        CIS[CargoInspectionService]
        AE[ApplicationEvents]
    end

    subgraph "Domain Layer - Bounded Contexts"
        CARGO[Cargo Context]
        HANDLING[Handling Context]
        LOCATION[Location Context]
        VOYAGE[Voyage Context]
    end

    subgraph "Infrastructure Layer"
        JPA[JPA Repositories]
        JMS[JMS Messaging]
        EXT[External Routing Service]
    end

    subgraph "External Systems"
        DB[(Database)]
        PATHFINDER[Pathfinder Service]
    end

    UI --> BS
    REST --> BS
    MOBILE --> HES
    BATCH --> HES
    SSE --> AE
    
    BS --> CARGO
    BS --> LOCATION
    BS --> VOYAGE
    HES --> HANDLING
    HES --> CARGO
    CIS --> CARGO
    
    CARGO --> JPA
    HANDLING --> JPA
    LOCATION --> JPA
    VOYAGE --> JPA
    
    HES --> JMS
    AE --> JMS
    
    BS --> EXT
    EXT --> PATHFINDER
    
    JPA --> DB
    
    style CARGO fill:#e1f5ff
    style HANDLING fill:#fff4e1
    style LOCATION fill:#e8f5e9
    style VOYAGE fill:#f3e5f5
```

---

## Bounded Context: Cargo

The Cargo bounded context manages the lifecycle and routing of cargo shipments.

```mermaid
classDiagram
    class Cargo {
        <<Aggregate Root>>
        -Long id
        -TrackingId trackingId
        -Location origin
        -RouteSpecification routeSpecification
        -Itinerary itinerary
        -Delivery delivery
        +specifyNewRoute(RouteSpecification)
        +assignToRoute(Itinerary)
        +deriveDeliveryProgress(HandlingHistory)
    }

    class TrackingId {
        <<Value Object>>
        -String id
        +sameValueAs(TrackingId)
    }

    class RouteSpecification {
        <<Value Object>>
        -Location origin
        -Location destination
        -LocalDate arrivalDeadline
        +isSatisfiedBy(Itinerary)
    }

    class Itinerary {
        <<Value Object>>
        -List~Leg~ legs
        +isExpected(HandlingEvent)
    }

    class Leg {
        <<Value Object>>
        -Voyage voyage
        -Location loadLocation
        -Location unloadLocation
        -LocalDateTime loadTime
        -LocalDateTime unloadTime
    }

    class Delivery {
        <<Value Object>>
        -TransportStatus transportStatus
        -Location lastKnownLocation
        -Voyage currentVoyage
        -boolean misdirected
        -LocalDateTime eta
        -HandlingActivity nextExpectedActivity
        -boolean isUnloadedAtDestination
        -RoutingStatus routingStatus
        +derivedFrom(RouteSpec, Itinerary, HandlingHistory)
        +updateOnRouting(RouteSpec, Itinerary)
    }

    class CargoRepository {
        <<Repository>>
        +find(TrackingId) Cargo
        +findAll() List~Cargo~
        +store(Cargo)
        +nextTrackingId() TrackingId
    }

    Cargo *-- TrackingId
    Cargo *-- RouteSpecification
    Cargo *-- Itinerary
    Cargo *-- Delivery
    Itinerary *-- Leg
    Leg --> Voyage
    Leg --> Location
    RouteSpecification --> Location
    CargoRepository ..> Cargo
```

**Key Responsibilities:**
- Track cargo from booking to delivery
- Manage routing and re-routing
- Calculate delivery status and ETA
- Detect misdirection

---

## Bounded Context: Handling

The Handling bounded context tracks physical handling events of cargo.

```mermaid
classDiagram
    class HandlingEvent {
        <<Aggregate Root>>
        -Long id
        -Type type
        -Voyage voyage
        -Location location
        -LocalDateTime completionTime
        -LocalDateTime registrationTime
        -Cargo cargo
        +getType() Type
        +getVoyage() Voyage
        +getLocation() Location
    }

    class Type {
        <<Enumeration>>
        LOAD
        UNLOAD
        RECEIVE
        CLAIM
        CUSTOMS
        +requiresVoyage() boolean
        +prohibitsVoyage() boolean
    }

    class HandlingEventFactory {
        <<Factory>>
        -CargoRepository cargoRepository
        -VoyageRepository voyageRepository
        -LocationRepository locationRepository
        +createHandlingEvent(params) HandlingEvent
    }

    class HandlingHistory {
        <<Value Object>>
        -List~HandlingEvent~ events
        +mostRecentlyCompletedEvent() HandlingEvent
        +distinctEventsByCompletionTime() List
    }

    class HandlingEventRepository {
        <<Repository>>
        +store(HandlingEvent)
        +lookupHandlingHistoryOfCargo(TrackingId) HandlingHistory
    }

    class CannotCreateHandlingEventException {
        <<Exception>>
    }

    HandlingEvent *-- Type
    HandlingEvent --> Cargo
    HandlingEvent --> Voyage
    HandlingEvent --> Location
    HandlingEventFactory ..> HandlingEvent
    HandlingEventFactory ..> CannotCreateHandlingEventException
    HandlingHistory o-- HandlingEvent
    HandlingEventRepository ..> HandlingEvent
    HandlingEventRepository ..> HandlingHistory
```

**Key Responsibilities:**
- Register handling events (load, unload, receive, claim, customs)
- Validate event consistency
- Maintain handling history
- Trigger cargo inspection on events

---

## Bounded Context: Location

The Location bounded context manages geographical locations where cargo operations occur.

```mermaid
classDiagram
    class Location {
        <<Aggregate Root>>
        -Long id
        -UnLocode unLocode
        -String name
        +getUnLocode() UnLocode
        +getName() String
        +sameIdentityAs(Location) boolean
    }

    class UnLocode {
        <<Value Object>>
        -String unlocode
        +getIdString() String
        +sameValueAs(UnLocode) boolean
    }

    class LocationRepository {
        <<Repository>>
        +find(UnLocode) Location
        +findAll() List~Location~
    }

    class SampleLocations {
        <<Factory>>
        +HONGKONG Location
        +MELBOURNE Location
        +STOCKHOLM Location
        +HELSINKI Location
        +CHICAGO Location
        +TOKYO Location
        +HAMBURG Location
        +SHANGHAI Location
        +ROTTERDAM Location
        +GOTHENBURG Location
        +HANGZOU Location
        +NEWYORK Location
        +DALLAS Location
    }

    Location *-- UnLocode
    LocationRepository ..> Location
    SampleLocations ..> Location
```

**Key Responsibilities:**
- Identify locations by UN/LOCODE
- Provide reference data for ports and warehouses
- Support location-based queries

---

## Bounded Context: Voyage

The Voyage bounded context represents carrier movements and schedules.

```mermaid
classDiagram
    class Voyage {
        <<Aggregate Root>>
        -Long id
        -VoyageNumber voyageNumber
        -Schedule schedule
        +getVoyageNumber() VoyageNumber
        +getSchedule() Schedule
        +sameIdentityAs(Voyage) boolean
    }

    class VoyageNumber {
        <<Value Object>>
        -String number
        +getIdString() String
        +sameValueAs(VoyageNumber) boolean
    }

    class Schedule {
        <<Value Object>>
        -List~CarrierMovement~ carrierMovements
        +getCarrierMovements() List
    }

    class CarrierMovement {
        <<Value Object>>
        -Location departureLocation
        -Location arrivalLocation
        -LocalDateTime departureTime
        -LocalDateTime arrivalTime
        +getDepartureLocation() Location
        +getArrivalLocation() Location
    }

    class VoyageRepository {
        <<Repository>>
        +find(VoyageNumber) Voyage
        +findAll() List~Voyage~
    }

    class VoyageBuilder {
        <<Builder>>
        -VoyageNumber voyageNumber
        -Location departureLocation
        -List~CarrierMovement~ movements
        +addMovement(Location, DateTime, DateTime) Builder
        +build() Voyage
    }

    class SampleVoyages {
        <<Factory>>
        +HONGKONG_TO_NEW_YORK Voyage
        +NEW_YORK_TO_DALLAS Voyage
        +DALLAS_TO_HELSINKI Voyage
        +HELSINKI_TO_HONGKONG Voyage
        +DALLAS_TO_HELSINKI_ALT Voyage
    }

    Voyage *-- VoyageNumber
    Voyage *-- Schedule
    Schedule *-- CarrierMovement
    CarrierMovement --> Location
    VoyageRepository ..> Voyage
    VoyageBuilder ..> Voyage
    SampleVoyages ..> Voyage
```

**Key Responsibilities:**
- Define carrier movement schedules
- Track voyage routes and timing
- Support itinerary planning
- Provide reference data for active voyages

---

## Application Services Layer

```mermaid
classDiagram
    class BookingService {
        <<Application Service>>
        +bookNewCargo(origin, destination, deadline) TrackingId
        +requestPossibleRoutesForCargo(trackingId) List~Itinerary~
        +assignCargoToRoute(itinerary, trackingId)
        +changeDestination(trackingId, destination)
        +changeDeadline(trackingId, deadline)
    }

    class HandlingEventService {
        <<Application Service>>
        +registerHandlingEvent(completionTime, trackingId, voyageNumber, location, type)
    }

    class CargoInspectionService {
        <<Application Service>>
        +inspectCargo(trackingId)
    }

    class ApplicationEvents {
        <<Event Publisher>>
        +cargoWasHandled(HandlingEvent)
        +cargoWasMisdirected(Cargo)
        +cargoHasArrived(Cargo)
        +receivedHandlingEventRegistrationAttempt(HandlingEventRegistrationAttempt)
    }

    BookingService --> CargoRepository
    BookingService --> LocationRepository
    BookingService --> RoutingService
    HandlingEventService --> HandlingEventRepository
    HandlingEventService --> ApplicationEvents
    CargoInspectionService --> CargoRepository
    ApplicationEvents --> JMS
```

---

## Infrastructure Layer

```mermaid
classDiagram
    class JpaCargoRepository {
        <<Repository Implementation>>
        -EntityManager entityManager
        -Event~Cargo~ cargoUpdated
        +find(TrackingId) Cargo
        +findAll() List~Cargo~
        +store(Cargo)
        +nextTrackingId() TrackingId
    }

    class JpaHandlingEventRepository {
        <<Repository Implementation>>
        -EntityManager entityManager
        +store(HandlingEvent)
        +lookupHandlingHistoryOfCargo(TrackingId) HandlingHistory
    }

    class JpaLocationRepository {
        <<Repository Implementation>>
        -EntityManager entityManager
        +find(UnLocode) Location
        +findAll() List~Location~
    }

    class JpaVoyageRepository {
        <<Repository Implementation>>
        -EntityManager entityManager
        +find(VoyageNumber) Voyage
        +findAll() List~Voyage~
    }

    class ExternalRoutingService {
        <<Domain Service Implementation>>
        -WebTarget graphTraversalResource
        -LocationRepository locationRepository
        -VoyageRepository voyageRepository
        +fetchRoutesForSpecification(RouteSpec) List~Itinerary~
    }

    class JmsApplicationEvents {
        <<Event Publisher Implementation>>
        -JMSContext jmsContext
        -Queue cargoHandledQueue
        -Queue misdirectedCargoQueue
        -Queue deliveredCargoQueue
        -Queue rejectedRegistrationAttemptsQueue
        -Queue handlingEventRegistrationAttemptQueue
        +cargoWasHandled(HandlingEvent)
        +cargoWasMisdirected(Cargo)
        +cargoHasArrived(Cargo)
    }

    JpaCargoRepository ..|> CargoRepository
    JpaHandlingEventRepository ..|> HandlingEventRepository
    JpaLocationRepository ..|> LocationRepository
    JpaVoyageRepository ..|> VoyageRepository
    ExternalRoutingService ..|> RoutingService
    JmsApplicationEvents ..|> ApplicationEvents
```

---

## Event Flow: Cargo Handling

```mermaid
sequenceDiagram
    participant UI as Mobile UI
    participant HES as HandlingEventService
    participant HEF as HandlingEventFactory
    participant HER as HandlingEventRepository
    participant JMS as JMS Queue
    participant Consumer as Event Consumer
    participant CIS as CargoInspectionService
    participant CR as CargoRepository

    UI->>HES: registerHandlingEvent(params)
    HES->>HEF: createHandlingEvent(params)
    HEF->>CR: find(trackingId)
    CR-->>HEF: Cargo
    HEF-->>HES: HandlingEvent
    HES->>HER: store(handlingEvent)
    HES->>JMS: publish(HandlingEventRegistrationAttempt)
    
    JMS->>Consumer: consume(attempt)
    Consumer->>CIS: inspectCargo(trackingId)
    CIS->>CR: find(trackingId)
    CR-->>CIS: Cargo
    CIS->>HER: lookupHandlingHistoryOfCargo(trackingId)
    HER-->>CIS: HandlingHistory
    CIS->>CR: cargo.deriveDeliveryProgress(history)
    CIS->>CR: store(cargo)
    
    alt Cargo Misdirected
        CIS->>JMS: publish(CargoMisdirected)
    else Cargo Delivered
        CIS->>JMS: publish(CargoDelivered)
    else Normal Handling
        CIS->>JMS: publish(CargoHandled)
    end
```

---

## Event Flow: Cargo Booking and Routing

```mermaid
sequenceDiagram
    participant UI as Admin UI
    participant BS as BookingService
    participant CR as CargoRepository
    participant RS as RoutingService
    participant EXT as External Pathfinder

    UI->>BS: bookNewCargo(origin, dest, deadline)
    BS->>CR: nextTrackingId()
    CR-->>BS: TrackingId
    BS->>CR: store(new Cargo)
    BS-->>UI: TrackingId
    
    UI->>BS: requestPossibleRoutesForCargo(trackingId)
    BS->>CR: find(trackingId)
    CR-->>BS: Cargo
    BS->>RS: fetchRoutesForSpecification(routeSpec)
    RS->>EXT: GET /shortest-path?origin=X&dest=Y
    EXT-->>RS: List<TransitPath>
    RS-->>BS: List<Itinerary>
    BS-->>UI: List<Itinerary>
    
    UI->>BS: assignCargoToRoute(itinerary, trackingId)
    BS->>CR: find(trackingId)
    CR-->>BS: Cargo
    BS->>CR: cargo.assignToRoute(itinerary)
    BS->>CR: store(cargo)
    BS-->>UI: Success
```

---

## Technology Stack

```mermaid
graph LR
    subgraph "Frontend"
        JSF[Jakarta Faces 4.0]
        PF[PrimeFaces 14.0.5]
        HTML[HTML/CSS/JavaScript]
        LEAFLET[Leaflet Maps]
    end

    subgraph "Backend"
        JEE[Jakarta EE 10]
        CDI[CDI 4.0]
        EJB[Enterprise Beans 4.0]
        JPA[Persistence 3.1]
        JAXRS[REST 3.1]
        JMS[Messaging 3.1]
        BATCH[Batch 2.1]
        BV[Bean Validation 3.0]
    end

    subgraph "Infrastructure"
        PAYARA[Payara 6.2025.3]
        GLASSFISH[GlassFish 7.0.22]
        LIBERTY[Open Liberty]
        H2[H2 Database 2.3.232]
        POSTGRES[PostgreSQL 42.7.5]
    end

    subgraph "Build & Test"
        MAVEN[Maven 3.x]
        JUNIT[JUnit 5.12.1]
        ARQ[Arquillian 1.8.0]
        ASSERTJ[AssertJ 3.27.3]
    end

    JSF --> JEE
    PF --> JSF
    CDI --> JEE
    EJB --> JEE
    JPA --> JEE
    JAXRS --> JEE
    JMS --> JEE
    BATCH --> JEE
    BV --> JEE
    
    JEE --> PAYARA
    JEE --> GLASSFISH
    JEE --> LIBERTY
    
    PAYARA --> H2
    PAYARA --> POSTGRES
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client Tier"
        BROWSER[Web Browser]
        MOBILE[Mobile Browser]
    end

    subgraph "Application Server"
        WAR[cargo-tracker.war]
        subgraph "Application Components"
            UI_LAYER[Presentation Layer]
            APP_LAYER[Application Layer]
            DOMAIN_LAYER[Domain Layer]
            INFRA_LAYER[Infrastructure Layer]
        end
    end

    subgraph "Data Tier"
        DB[(H2/PostgreSQL Database)]
        FILES[/tmp/uploads<br/>File System]
    end

    subgraph "External Services"
        PATHFINDER[Pathfinder<br/>Routing Service]
    end

    BROWSER --> WAR
    MOBILE --> WAR
    
    WAR --> UI_LAYER
    UI_LAYER --> APP_LAYER
    APP_LAYER --> DOMAIN_LAYER
    DOMAIN_LAYER --> INFRA_LAYER
    
    INFRA_LAYER --> DB
    INFRA_LAYER --> FILES
    INFRA_LAYER --> PATHFINDER
    
    style WAR fill:#4CAF50
    style DB fill:#2196F3
    style PATHFINDER fill:#FF9800
```

---

## Key Architectural Patterns

### 1. Domain-Driven Design (DDD)
- **Bounded Contexts**: Four clear contexts (Cargo, Handling, Location, Voyage)
- **Aggregates**: Each context has a clear aggregate root
- **Value Objects**: Immutable objects like TrackingId, UnLocode, VoyageNumber
- **Repositories**: Abstract data access
- **Domain Services**: RoutingService for cross-aggregate operations
- **Factories**: HandlingEventFactory, VoyageBuilder

### 2. Layered Architecture
- **Presentation**: JSF views, REST endpoints, SSE
- **Application**: Service facades, DTOs, assemblers
- **Domain**: Pure business logic, no infrastructure concerns
- **Infrastructure**: JPA, JMS, external service clients

### 3. Event-Driven Architecture
- **Async Processing**: JMS for handling events
- **Event Consumers**: Separate consumers for different event types
- **Eventual Consistency**: Cargo delivery status updated asynchronously

### 4. Hexagonal Architecture (Ports & Adapters)
- **Ports**: Repository interfaces, service interfaces
- **Adapters**: JPA implementations, JMS implementations, REST clients

---

## Data Model (Simplified)

```mermaid
erDiagram
    CARGO ||--o{ LEG : contains
    CARGO ||--|| LOCATION : "has origin"
    CARGO ||--|| DELIVERY : "has current"
    CARGO ||--|| ROUTE_SPECIFICATION : has
    
    HANDLING_EVENT }o--|| CARGO : tracks
    HANDLING_EVENT }o--|| LOCATION : "occurs at"
    HANDLING_EVENT }o--o| VOYAGE : "may involve"
    
    LEG }o--|| VOYAGE : uses
    LEG }o--|| LOCATION : "loads at"
    LEG }o--|| LOCATION : "unloads at"
    
    VOYAGE ||--o{ CARRIER_MOVEMENT : contains
    CARRIER_MOVEMENT }o--|| LOCATION : "departs from"
    CARRIER_MOVEMENT }o--|| LOCATION : "arrives at"
    
    CARGO {
        bigint id PK
        string tracking_id UK
        bigint origin_id FK
    }
    
    HANDLING_EVENT {
        bigint id PK
        bigint cargo_id FK
        bigint location_id FK
        bigint voyage_id FK
        string type
        timestamp completion_time
        timestamp registration_time
    }
    
    LOCATION {
        bigint id PK
        string unlocode UK
        string name
    }
    
    VOYAGE {
        bigint id PK
        string voyage_number UK
    }
    
    LEG {
        bigint id PK
        bigint voyage_id FK
        bigint load_location_id FK
        bigint unload_location_id FK
        timestamp load_time
        timestamp unload_time
    }
```

---

## Summary

### Strengths
1. **Clean DDD Implementation**: Clear bounded contexts with well-defined aggregates
2. **Separation of Concerns**: Layered architecture with minimal coupling
3. **Rich Domain Model**: Business logic encapsulated in domain objects
4. **Event-Driven**: Async processing for scalability
5. **Well-Tested**: Comprehensive test coverage with Arquillian

### Weaknesses
1. **Monolithic Deployment**: Single WAR file limits independent scaling
2. **Legacy UI Technology**: JSF/PrimeFaces harder to maintain than modern frameworks
3. **JMS Coupling**: Tight coupling to JMS for messaging
4. **File-Based Processing**: Not cloud-native or scalable
5. **No API Versioning**: REST endpoints lack versioning strategy

### Modernization Opportunities
1. **Microservices**: Decompose into separate services per bounded context
2. **Modern Frontend**: Replace JSF with React/Vue/Angular
3. **Cloud-Native Messaging**: Replace JMS with Kafka or cloud services
4. **API Gateway**: Add centralized API management
5. **Containerization**: Docker/Kubernetes deployment
6. **Observability**: Add distributed tracing, metrics, logging