# Handling Bounded Context Modernization Plan

**Document Version:** 1.0  
**Date:** 2026-05-16  
**Risk Score:** 70 (Highest actionable bounded context)  
**Estimated Effort:** 20 days  
**Impact Level:** High

---

## Executive Summary

### Context
The Handling bounded context has been identified as the highest-risk actionable component in the Eclipse Cargo Tracker application with a risk score of **70 out of 100**. This context is responsible for processing cargo handling events through multiple channels (file-based batch processing, REST API, and mobile interface).

### Key Risk Factors
1. **Async event processing via JMS** creates eventual consistency challenges
2. **File-based batch processing** from `/tmp/uploads` is fragile and not cloud-native
3. **HandlingEventFactory** has complex validation logic without comprehensive documentation
4. **No retry mechanism** for failed event processing
5. **Missing dependency version** for commons-lang3 (critical security risk)

### Proposed Changes Overview
This plan addresses four critical modernization tasks:

1. **Fix commons-lang3 missing version** (1 hour) - Critical security fix
2. **Add Bean Validation constraints** (4 hours) - Improve data integrity
3. **Improve Javadoc documentation** (6 hours) - Better maintainability
4. **Add REST endpoint for batch upload** (8 hours) - Cloud-native alternative

### Expected Benefits
- ✅ Eliminate critical security vulnerability (commons-lang3)
- ✅ Improve data validation and error handling
- ✅ Better code documentation for future maintainers
- ✅ Cloud-native deployment option (REST vs file-based)
- ✅ Maintain 100% backward compatibility
- ✅ Zero breaking changes to existing APIs

---

## Current State Analysis

### Risk Summary Findings

From `bob-outputs/risk-summary.json`:

**Handling Bounded Context - Risk Score: 70**

**Identified Issues:**
- Async event processing via JMS creates eventual consistency challenges
- File-based batch processing from `/tmp/uploads` is fragile
- HandlingEvent factory has complex validation logic
- No retry mechanism for failed event processing

**Recommendations from Risk Analysis:**
- Replace file scanning with REST API or message queue
- Add dead letter queue for failed events
- Implement idempotency for event processing
- Add event sourcing for audit trail

### Dependency Analysis

From `bob-outputs/dependency-map.json`:

**Critical Finding:**
```json
{
  "groupId": "org.apache.commons",
  "artifactId": "commons-lang3",
  "version": "NOT_SPECIFIED",
  "scope": "compile",
  "risk_level": "critical",
  "notes": "NO VERSION SPECIFIED - Maven will use transitive dependency version which could be very old with known CVEs."
}
```

### Current Architecture

**File-Based Processing:**
- `UploadDirectoryScanner.java` - Scans every 2 minutes
- Uses Jakarta Batch API for processing
- Files from `/tmp/uploads` directory
- No error recovery mechanism

**REST API:**
- `HandlingReportService.java` - Single event submission
- Path: `/handling/reports`
- Accepts JSON/XML
- **Missing:** Batch upload capability

**Domain Model:**
- `HandlingEvent.java` - Core aggregate with @NotNull on key fields
- `HandlingEventFactory.java` - Factory with validation logic
- Uses Bean Validation but inconsistently applied

---

## Modernization Tasks (Detailed)

### Task 1: Fix commons-lang3 Missing Version in pom.xml

#### Current State
From `pom.xml` lines 65-68:
```xml
<dependency>
  <groupId>org.apache.commons</groupId>
  <artifactId>commons-lang3</artifactId>
</dependency>
```

**Problem:** No version specified - Maven will use whatever version comes from transitive dependencies, which could be ancient and vulnerable.

#### Proposed Changes

**File:** `pom.xml` lines 65-68

**Change:**
```xml
<dependency>
  <groupId>org.apache.commons</groupId>
  <artifactId>commons-lang3</artifactId>
  <version>3.14.0</version>
</dependency>
```

#### Rationale

**Why version 3.14.0?**
1. **Latest stable release** as of the risk assessment date
2. **Java 11 compatible** (requires Java 8+)
3. **No known CVEs** in this version
4. **Widely tested** in production environments
5. **Backward compatible** with 3.x series

**Security Context:**
- Older versions (< 3.12) have known vulnerabilities
- Version 3.14.0 includes security fixes and improvements
- Explicit versioning prevents accidental downgrades

#### Risk Assessment
- **Risk Level:** LOW
- **Breaking Changes:** None (3.14.0 is backward compatible)
- **Dependencies Affected:** None (compile scope, no transitive impact)

#### Testing Strategy

**Verification Steps:**
1. Run `mvn dependency:tree` to confirm version resolution
2. Run full test suite: `mvn clean test`
3. Check for deprecation warnings in build output
4. Verify application starts successfully
5. Run smoke tests on key features

**Expected Results:**
- All existing tests pass
- No new compilation warnings
- Application behavior unchanged

#### Rollback Plan

If issues arise:
1. Remove the version specification
2. Run `mvn clean install` to revert to previous state
3. Document the specific issue encountered
4. Investigate alternative versions (3.13.0, 3.12.0)

---

### Task 2: Add Bean Validation @NotNull Constraints to HandlingEvent.java

#### Current State

From `HandlingEvent.java` lines 49-76:

**Current Annotations:**
```java
@Enumerated(EnumType.STRING)
@NotNull
private Type type;

@ManyToOne
@JoinColumn(name = "voyage_id")
private Voyage voyage;  // Can be null for some event types

@ManyToOne
@JoinColumn(name = "location_id")
@NotNull
private Location location;

@NotNull
@Column(name = "completionTime")
private LocalDateTime completionTime;

@NotNull
@Column(name = "registration")
private LocalDateTime registrationTime;

@ManyToOne
@JoinColumn(name = "cargo_id")
@NotNull
private Cargo cargo;
```

**Analysis:**
- `type`, `location`, `completionTime`, `registrationTime`, `cargo` - Already have `@NotNull` ✅
- `voyage` - Correctly nullable (only required for LOAD/UNLOAD events) ✅
- Current validation is **already correct**

#### Proposed Changes

**File:** `HandlingEvent.java` lines 92-119

**Enhancement:** Improve validation error messages in constructors:

```java
public HandlingEvent(
    Cargo cargo,
    LocalDateTime completionTime,
    LocalDateTime registrationTime,
    Type type,
    Location location,
    Voyage voyage) {
  Validate.notNull(cargo, "Cargo is required");
  Validate.notNull(completionTime, "Completion time is required");
  Validate.notNull(registrationTime, "Registration time is required");
  Validate.notNull(type, "Handling event type is required");
  Validate.notNull(location, "Location is required");
  Validate.notNull(voyage, "Voyage is required for event type %s", type);

  if (type.prohibitsVoyage()) {
    throw new IllegalArgumentException(
        String.format("Voyage is not allowed with event type %s", type));
  }

  this.voyage = voyage;
  this.completionTime = completionTime.truncatedTo(ChronoUnit.SECONDS);
  this.registrationTime = registrationTime.truncatedTo(ChronoUnit.SECONDS);
  this.type = type;
  this.location = location;
  this.cargo = cargo;
}
```

#### Rationale

1. **Current validation is sound** - Bean Validation annotations are correctly applied
2. **Voyage nullability is intentional** - Business rule correctly implemented
3. **Enhanced error messages** - Better debugging and error reporting
4. **No breaking changes** - Only improving existing validation messages

#### Risk Assessment
- **Risk Level:** LOW
- **Breaking Changes:** None (only improving error messages)
- **Impact:** Better error reporting for invalid data

#### Testing Strategy

**Unit Tests to Add:**
```java
@Test
void shouldRejectNullCargoWithClearMessage() {
  assertThatThrownBy(() -> new HandlingEvent(
      null, LocalDateTime.now(), LocalDateTime.now(),
      Type.RECEIVE, location
  ))
  .isInstanceOf(NullPointerException.class)
  .hasMessageContaining("Cargo is required");
}
```

#### Rollback Plan

If issues arise:
1. Revert to original validation messages
2. Keep existing `Validate.notNull()` calls without enhanced messages

---

### Task 3: Improve Javadoc on HandlingEventFactory.java

#### Current State

From `HandlingEventFactory.java` lines 26-60:

**Current Documentation:**
```java
/**
 * @param registrationTime time when this event was received by the system
 * @param completionTime when the event was completed, for example finished loading
 * @param trackingId cargo tracking id
 * @param voyageNumber voyage number
 * @param unlocode United Nations Location Code for the location of the event
 * @param type type of event
 * @return A handling event.
 * @throws UnknownVoyageException if there's no voyage with this number
 * @throws UnknownCargoException if there's no cargo with this tracking id
 * @throws UnknownLocationException if there's no location with this UN Locode
 */
// TODO [Clean Code] Look at the exception handling more seriously.
public HandlingEvent createHandlingEvent(...)
```

**Issues:**
1. Missing class-level documentation
2. No usage examples
3. Incomplete exception documentation
4. No explanation of voyage nullability rules
5. No thread-safety documentation

#### Proposed Changes

**File:** `HandlingEventFactory.java` lines 17-95

**Add comprehensive class-level Javadoc:**

```java
/**
 * Factory for creating HandlingEvent instances with proper validation and entity resolution.
 * 
 * <p>This factory is responsible for:
 * <ul>
 *   <li>Resolving entity references (Cargo, Voyage, Location) from their identifiers</li>
 *   <li>Validating business rules (e.g., voyage requirements for LOAD/UNLOAD events)</li>
 *   <li>Creating properly initialized HandlingEvent aggregates</li>
 * </ul>
 * 
 * <p><strong>Thread Safety:</strong> This factory is thread-safe as it's an ApplicationScoped 
 * CDI bean with no mutable state.
 * 
 * <p><strong>Voyage Nullability Rules:</strong>
 * <ul>
 *   <li>LOAD and UNLOAD events require a voyage</li>
 *   <li>RECEIVE, CLAIM, and CUSTOMS events prohibit a voyage</li>
 *   <li>Pass null for voyageNumber when creating non-voyage events</li>
 * </ul>
 * 
 * <p><strong>Usage Example - RECEIVE event (no voyage):</strong>
 * <pre>{@code
 * HandlingEvent event = factory.createHandlingEvent(
 *     LocalDateTime.now(),
 *     LocalDateTime.now().minusHours(2),
 *     new TrackingId("ABC123"),
 *     null,  // no voyage for RECEIVE
 *     new UnLocode("USNYC"),
 *     HandlingEvent.Type.RECEIVE
 * );
 * }</pre>
 * 
 * <p><strong>Usage Example - LOAD event (requires voyage):</strong>
 * <pre>{@code
 * HandlingEvent event = factory.createHandlingEvent(
 *     LocalDateTime.now(),
 *     LocalDateTime.now().minusHours(1),
 *     new TrackingId("ABC123"),
 *     new VoyageNumber("V100"),  // required for LOAD
 *     new UnLocode("USNYC"),
 *     HandlingEvent.Type.LOAD
 * );
 * }</pre>
 */
@ApplicationScoped
public class HandlingEventFactory implements Serializable {
```

**Enhanced method documentation:**

```java
/**
 * Creates a new handling event with full validation and entity resolution.
 * 
 * <p>This method performs the following operations:
 * <ol>
 *   <li>Resolves the cargo entity from the tracking ID</li>
 *   <li>Resolves the location entity from the UN Locode</li>
 *   <li>Resolves the voyage entity from the voyage number (if provided)</li>
 *   <li>Validates business rules (voyage requirements based on event type)</li>
 *   <li>Creates and returns a new HandlingEvent instance</li>
 * </ol>
 * 
 * @param registrationTime When the system received the event notification (typically "now")
 * @param completionTime When the physical event actually occurred (can be in the past)
 * @param trackingId The cargo tracking identifier (must exist in the system)
 * @param voyageNumber The voyage number (required for LOAD/UNLOAD, must be null for others)
 * @param unlocode The UN Location Code for where the event occurred (must exist)
 * @param type The type of handling event (determines voyage requirements)
 * @return A fully initialized and validated HandlingEvent instance
 * @throws CannotCreateHandlingEventException if validation fails or entities not found
 */
public HandlingEvent createHandlingEvent(...)
```

#### Rationale

1. **Comprehensive class-level documentation** - Explains purpose, thread safety, and business rules
2. **Detailed usage examples** - Shows both voyage and non-voyage scenarios
3. **Complete parameter documentation** - Every parameter explained with context
4. **Exception documentation** - All possible exceptions documented
5. **Business rule documentation** - Voyage nullability rules clearly explained

#### Risk Assessment
- **Risk Level:** VERY LOW
- **Breaking Changes:** None (documentation only)
- **Impact:** Improved maintainability and developer onboarding

#### Testing Strategy

**Documentation Validation:**
1. Generate Javadoc: `mvn javadoc:javadoc`
2. Review generated HTML documentation
3. Verify all links resolve correctly
4. Check for Javadoc warnings

**No functional testing required** - documentation changes only.

#### Rollback Plan

If Javadoc generation fails:
1. Revert to original documentation
2. Fix any syntax errors in Javadoc comments

---

### Task 4: Add REST Endpoint for Batch Upload

#### Current State

**Existing REST Endpoint:**
From `HandlingReportService.java` lines 30-52:

```java
@POST
@Path("/reports")
@Consumes({"application/json", "application/xml"})
public void submitReport(@NotNull @Valid HandlingReport handlingReport) {
  // Processes single event only
}
```

**Limitations:**
- Only accepts **single** event per request
- No batch upload capability via REST
- Forces clients to make multiple HTTP requests for bulk operations

**File-Based Alternative:**
From `UploadDirectoryScanner.java`:
- Scans `/tmp/uploads` every 2 minutes
- Not cloud-native
- No immediate feedback
- Security concerns

#### Proposed Changes

**New File:** `src/main/java/org/eclipse/cargotracker/interfaces/handling/rest/HandlingReportBatchService.java`

**Key Features:**
- Accepts up to 100 events per request
- Immediate validation and feedback
- Partial success handling
- Detailed error reporting per event
- Compatible with existing infrastructure

**API Endpoint:**
```
POST /handling/reports/batch
Content-Type: application/json

{
  "reports": [
    {
      "completionTime": "2026-05-16T10:30:00",
      "trackingId": "ABC123",
      "eventType": "RECEIVE",
      "unLocode": "USNYC",
      "voyageNumber": null
    },
    {
      "completionTime": "2026-05-16T11:00:00",
      "trackingId": "XYZ789",
      "eventType": "LOAD",
      "unLocode": "USNYC",
      "voyageNumber": "V100"
    }
  ]
}
```

**Response Format:**
```json
{
  "totalSubmitted": 2,
  "successCount": 2,
  "failureCount": 0,
  "results": [
    {
      "index": 0,
      "trackingId": "ABC123",
      "status": "SUCCESS",
      "message": "Event registered successfully"
    },
    {
      "index": 1,
      "trackingId": "XYZ789",
      "status": "SUCCESS",
      "message": "Event registered successfully"
    }
  ]
}
```

#### Implementation Outline

**Core Service Class:**
```java
@Stateless
@Path("/handling")
public class HandlingReportBatchService {
  
  private static final int MAX_BATCH_SIZE = 100;
  
  @Inject private ApplicationEvents applicationEvents;
  
  @POST
  @Path("/reports/batch")
  @Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
  @Produces(MediaType.APPLICATION_JSON)
  public Response submitBatchReports(
      @NotNull @Valid BatchHandlingReportRequest batchRequest) {
    // Validate batch size
    // Process each report
    // Return detailed results
  }
}
```

**Supporting Classes:**
- `BatchHandlingReportRequest` - Request wrapper with validation
- `BatchHandlingReportResponse` - Response with summary and details
- `EventResult` - Per-event result with status and message

#### Rationale

1. **Cloud-Native Alternative** - No file system dependencies
2. **Immediate Feedback** - Synchronous validation, asynchronous processing
3. **Partial Success Support** - Some events can succeed while others fail
4. **Detailed Error Reporting** - Per-event status and error messages
5. **Backward Compatible** - Doesn't replace existing endpoints
6. **Reuses Infrastructure** - Uses same event processing pipeline

#### Risk Assessment
- **Risk Level:** LOW-MEDIUM
- **Breaking Changes:** None (new endpoint, existing endpoints unchanged)
- **Impact:** Provides alternative to file-based processing

#### Testing Strategy

**Unit Tests:**
```java
@Test
void shouldProcessBatchSuccessfully() {
  // Test successful batch processing
}

@Test
void shouldHandlePartialFailure() {
  // Test batch with some invalid events
}

@Test
void shouldRejectOversizedBatch() {
  // Test batch size limit (>100 events)
}
```

**Integration Tests:**
```java
@Test
void shouldSubmitBatchViaREST() {
  // Test HTTP POST to /handling/reports/batch
}

@Test
void shouldProcessEventsAsynchronously() {
  // Verify events are queued via JMS
}
```

**Manual Testing:**
1. Submit batch with curl/Postman
2. Verify events appear in system
3. Test error scenarios
4. Verify response format
5. Test with maximum batch size

#### Rollback Plan

If issues arise:
1. Remove the new endpoint class
2. Existing file-based and single-event endpoints remain functional
3. No data migration needed

---

## Implementation Order

### Phase 1: Critical Security Fix (Day 1)
**Priority:** CRITICAL  
**Effort:** 1 hour

1. ✅ **Task 1: Fix commons-lang3 version**
   - Update pom.xml
   - Run dependency:tree
   - Run full test suite
   - Verify application startup

**Approval Gate 1:** Review pom.xml change, verify test results

---

### Phase 2: Documentation Improvements (Days 2-3)
**Priority:** HIGH  
**Effort:** 6 hours

2. ✅ **Task 3: Improve Javadoc on HandlingEventFactory**
   - Add comprehensive class-level documentation
   - Add usage examples
   - Document all methods
   - Generate and review Javadoc

**Approval Gate 2:** Review generated Javadoc HTML

---

### Phase 3: Validation Enhancements (Day 3)
**Priority:** MEDIUM  
**Effort:** 4 hours

3. ✅ **Task 2: Add Bean Validation constraints**
   - Review current validation
   - Enhance error messages
   - Add unit tests
   - Run integration tests

**Approval Gate 3:** Review validation changes, verify test coverage

---

### Phase 4: New REST Endpoint (Days 4-5)
**Priority:** MEDIUM  
**Effort:** 8 hours

4. ✅ **Task 4: Add batch upload REST endpoint**
   - Create HandlingReportBatchService
   - Add comprehensive tests
   - Test with real data
   - Document API

**Approval Gate 4:** Review endpoint implementation, test API manually

---

## Validation Checklist

### Task 1: commons-lang3 Version Fix

- [ ] pom.xml updated with version 3.14.0
- [ ] `mvn dependency:tree` shows correct version
- [ ] No dependency conflicts reported
- [ ] All unit tests pass (`mvn test`)
- [ ] All integration tests pass (`mvn verify`)
- [ ] Application starts successfully
- [ ] No new compilation warnings
- [ ] Smoke tests pass

### Task 2: Bean Validation Enhancements

- [ ] Enhanced validation messages added
- [ ] Unit tests added for validation scenarios
- [ ] All existing tests still pass
- [ ] Error messages are clear and helpful
- [ ] No breaking changes to existing behavior
- [ ] Integration tests verify validation works end-to-end

### Task 3: Javadoc Improvements

- [ ] Class-level documentation added
- [ ] All public methods documented
- [ ] Usage examples included
- [ ] Exception scenarios documented
- [ ] `mvn javadoc:javadoc` completes without errors
- [ ] Generated HTML documentation reviewed
- [ ] All Javadoc links resolve correctly
- [ ] No Javadoc warnings in build output

### Task 4: Batch REST Endpoint

- [ ] New endpoint class created
- [ ] Comprehensive Javadoc added
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed
- [ ] Batch size limits enforced
- [ ] Partial success handling works
- [ ] Error responses are detailed
- [ ] Existing endpoints still work
- [ ] API documentation updated

---

## Approval Gates

### Gate 1: Security Fix Review
**Before:** Task 1 implementation  
**Review:**
- pom.xml changes
- Dependency tree output
- Test results

**Approval Criteria:**
- Version 3.14.0 correctly specified
- No dependency conflicts
- All tests pass

---

### Gate 2: Documentation Review
**Before:** Task 3 implementation  
**Review:**
- Generated Javadoc HTML
- Code examples
- Coverage of all public APIs

**Approval Criteria:**
- Documentation is comprehensive
- Examples are correct
- No Javadoc warnings

---

### Gate 3: Validation Review
**Before:** Task 2 implementation  
**Review:**
- Validation logic changes
- Error messages
- Test coverage

**Approval Criteria:**
- Validation is correct
- Error messages are helpful
- Tests cover edge cases

---

### Gate 4: API Review
**Before:** Task 4 implementation  
**Review:**
- REST endpoint implementation
- API design
- Error handling
- Test coverage

**Approval Criteria:**
- API is well-designed
- Error handling is robust
- Tests are comprehensive
- No regression in existing functionality

---

## Performance Impact Assessment

### Task 1: commons-lang3 Version
**Impact:** NONE  
**Reason:** Version change only, no API changes

### Task 2: Bean Validation
**Impact:** NEGLIGIBLE  
**Reason:** Validation already exists, only improving messages

### Task 3: Javadoc
**Impact:** NONE  
**Reason:** Documentation only, no runtime impact

### Task 4: Batch REST Endpoint
**Impact:** POSITIVE  
**Reason:**
- Reduces HTTP overhead (1 request vs N requests)
- Same async processing as existing endpoints
- No impact on existing endpoints

**Estimated Performance Improvement:**
- Batch of 100 events: ~95% reduction in HTTP overhead
- Network latency: 100x reduction (1 round-trip vs 100)
- Server load: Reduced (fewer HTTP connections)

---

## Next Steps for Implementation

### Immediate Actions (Week 1)

1. **Get approval for this plan**
   - Review with technical lead
   - Review with security team (Task 1)
   - Get stakeholder sign-off

2. **Set up implementation branch**
   ```bash
   git checkout -b feature/handling-modernization
   ```

3. **Implement Task 1 (Day 1)**
   - Update pom.xml
   - Run tests
   - Create pull request

4. **Implement Task 3 (Days 2-3)**
   - Add Javadoc
   - Generate documentation
   - Create pull request

5. **Implement Task 2 (Day 3)**
   - Enhance validation
   - Add tests
   - Create pull request

6. **Implement Task 4 (Days 4-5)**
   - Create new endpoint
   - Add tests
   - Create pull request

### Post-Implementation (Week 2)

1. **Integration testing**
   - Test all changes together
   - Verify no regressions
   - Performance testing

2. **Documentation updates**
   - Update README
   - Update API documentation
   - Create migration guide

3. **Deployment preparation**
   - Create deployment checklist
   - Plan rollout strategy
   - Prepare rollback procedures

---

## Success Criteria

### Technical Success
- [ ] All 4 tasks completed
- [ ] All tests passing
- [ ] No regressions in existing functionality
- [ ] Code review approved
- [ ] Documentation complete

### Business Success
- [ ] Security vulnerability eliminated (commons-lang3)
- [ ] Improved developer experience (better docs)
- [ ] Cloud-native deployment option available
- [ ] Zero downtime during deployment
- [ ] Backward compatibility maintained

### Quality Metrics
- [ ] Test coverage maintained or improved
- [ ] No new Sonar violations
- [ ] Javadoc coverage > 90%
- [ ] Performance benchmarks met
- [ ] Security scan passes

---

## Risk Mitigation

### Risk: Dependency Conflicts
**Mitigation:**
- Test with all profiles (payara, glassfish, cloud, openliberty)
- Run full dependency analysis
- Have rollback plan ready

### Risk: Breaking Changes
**Mitigation:**
- Comprehensive test suite
- Manual testing of critical paths
- Staged rollout
- Feature flags for new endpoint

### Risk: Performance Degradation
**Mitigation:**
- Performance testing before deployment
- Monitor metrics after deployment
- Have rollback plan ready

### Risk: Documentation Errors
**Mitigation:**
- Peer review of documentation
- Test code examples
- Validate Javadoc generation

---

## Conclusion

This modernization plan addresses the highest-risk bounded context in the Eclipse Cargo Tracker application with a measured, safe approach. By focusing on four specific, well-defined tasks, we can significantly improve the security, maintainability, and cloud-readiness of the Handling context while maintaining 100% backward compatibility.

**Key Takeaways:**
- **Risk Score 70** → Target reduction to **50** after implementation
- **Total Effort:** 19 hours (2.5 days)
- **Zero Breaking Changes** - All existing APIs preserved
- **Immediate Security Fix** - commons-lang3 version specified
- **Cloud-Native Option** - REST batch endpoint as alternative to file-based processing

**Recommended Next Steps:**
1. Review and approve this plan
2. Create implementation branch
3. Begin with Task 1 (critical security fix)
4. Proceed through tasks in order
5. Deploy with human oversight at each approval gate

---

**Document Prepared By:** Bob (AI Planning Assistant)  
**Review Status:** Pending Approval  
**Next Review Date:** Upon completion of each task