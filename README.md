# LegacyLift
### AI-Powered Legacy Modernisation Risk Dashboard
**IBM Bob Hackathon — May 2026**

## What it does
LegacyLift uses IBM Bob to autonomously analyse, visualise, and govern
the modernisation of Eclipse Cargo Tracker — a real-world Jakarta EE 10
Java 11 application built on Domain-Driven Design.

## Impact Metrics

| Metric | Before Bob | After Bob |
|---|---|---|
| Overall risk score | 68/100 | 48/100 |
| Handling context risk | 70 HIGH | 45 MEDIUM |
| Critical CVEs | 2 | 0 |
| Est. remediation cost | $147,000 | $132,000 |
| Est. timeline | 18 months | 15 months |
| Bob modernisation time | — | 24 hours |

## Bob Features Used

| Feature | How |
|---|---|
| Ask mode | Initial codebase orientation |
| Advanced mode | Dependency and architecture analysis |
| Plan mode | Modernisation planning with human approval |
| Code mode | Risk API, dashboard, and modernisation |
| Orchestrator mode | Multi-file coordinated redesign |
| BobShell | Full audit trail of every action |

## How to Run

Risk Engine API: cd risk-engine && npm install && npm start
Dashboard: cd dashboard && npm install && npm run dev
Dashboard opens at http://localhost:5173

## Project Structure

src/ — Jakarta EE legacy Java app
bob-outputs/ — All Bob-generated analysis
  risk-summary.json — Before modernisation
  risk-summary-after.json — After modernisation
  dependency-map.json — 20 deps with CVE scoring
  architecture-diagram.md — DDD bounded context maps
  modernisation-plan.md — Handling context modernisation
  java17-upgrade-plan.md — Java 17 upgrade roadmap
risk-engine/ — Node.js API serving risk data
dashboard/ — React risk visualisation dashboard

## What Bob Did
1. Read 105 source files and mapped all dependencies
2. Scored risk across 6 DDD modules and 4 categories
3. Generated dependency map, architecture diagrams, risk summary
4. Planned safe modernisation with human approval gates
5. Fixed critical CVE — commons-lang3 pinned to 3.14.0
6. Improved Javadoc on HandlingEventFactory
7. Added cloud-native batch REST endpoint
8. Re-analysed codebase — 35.7% risk reduction on Handling context

## DDD Bounded Contexts
- Interfaces — Risk 80 Critical
- Infrastructure — Risk 75 Critical
- Handling — Risk 70 to 45 Modernised
- Cargo — Risk 65 High
- Voyage — Risk 45 Medium
- Location — Risk 40 Low

## Future Roadmap
- Java 11 to 17 LTS upgrade (plan in bob-outputs/)
- H2 to PostgreSQL migration
- MicroProfile Health endpoints
- Circuit breaker on ExternalRoutingService
- OpenAPI documentation
- GitHub Actions CI with automated Bob analysis
