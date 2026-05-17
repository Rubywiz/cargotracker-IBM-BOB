# LegacyLift
### AI-Powered Legacy Modernisation Risk Dashboard
**IBM Bob Hackathon — May 2026**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](YOUR_VERCEL_URL_HERE)
[![API](https://img.shields.io/badge/API-Live-blue?style=for-the-badge)](YOUR_RENDER_URL_HERE)

## 🎯 What it does
LegacyLift uses IBM Bob to autonomously analyse, visualise, and govern
the modernisation of Eclipse Cargo Tracker — a real-world Jakarta EE 10
Java 11 application built on Domain-Driven Design.

**Key Innovation:** Interactive before/after dashboard showing real-time impact of AI-driven modernisation decisions.

## 📊 Impact Metrics

| Metric | Before Bob | After Bob | Improvement |
|---|---|---|---|
| Overall risk score | 68/100 | 38/100 | **44.1% ↓** |
| Handling context risk | 70 HIGH | 45 MEDIUM | **35.7% ↓** |
| Security risk | 72 | 47 | **34.7% ↓** |
| Java version | 11 (EOL) | 17 LTS | **Active until 2029** |
| Critical CVEs | 2 | 0 | **100% resolved** |
| Health monitoring | None | Kubernetes-ready | **Cloud-native** |
| Est. remediation cost | $147,000 | $120,000 | **$27,000 saved** |
| Est. timeline | 18 months | 14 months | **4 months faster** |
| Bob modernisation time | — | **24 hours** | **Autonomous** |

## 🚀 Live Demo

**Dashboard:** [YOUR_VERCEL_URL_HERE](YOUR_VERCEL_URL_HERE)
- Toggle between "Before" and "After" modernisation states
- Real-time risk visualization with radar charts
- Dark/light mode with Mission Control design aesthetic

**API Endpoints:** [YOUR_RENDER_URL_HERE](YOUR_RENDER_URL_HERE)
- `/api/summary` - Risk assessment data
- `/api/modules` - Bounded context analysis
- `/api/recommendations` - Quick wins

**Health Checks:** (when running locally)
- `/health` - Combined health status
- `/health/live` - Liveness probe
- `/health/ready` - Readiness probe (database + JMS)

## 🤖 Bob Features Used

| Feature | How We Used It |
|---|---|
| **Ask mode** | Initial codebase orientation and Q&A |
| **Advanced mode** | Deep dependency and architecture analysis |
| **Plan mode** | Modernisation planning with human approval gates |
| **Code mode** | Risk API, dashboard, health checks, and modernisation |
| **Orchestrator mode** | Multi-file coordinated dashboard redesign |
| **BobShell** | Full audit trail of every action (see `bobshell-audit.log`) |

## 🏗️ What Bob Built

### Phase 1: Analysis (6 hours)
1. ✅ Read 105 source files and mapped all dependencies
2. ✅ Scored risk across 6 DDD modules and 4 categories
3. ✅ Generated dependency map, architecture diagrams, risk summary
4. ✅ Identified 2 critical CVEs and 8 high-priority improvements

### Phase 2: Modernisation (12 hours)
5. ✅ Fixed critical CVE — commons-lang3 pinned to 3.14.0
6. ✅ Improved Javadoc on HandlingEventFactory (70+ lines)
7. ✅ Added cloud-native batch REST endpoint (339 lines)
8. ✅ Upgraded Java 11 → 17 LTS (active support until 2029)
9. ✅ Added MicroProfile Health checks (database, JMS, liveness)
10. ✅ Re-analysed codebase — 44.1% overall risk reduction

### Phase 3: Visualization (6 hours)
11. ✅ Built React dashboard with Mission Control design
12. ✅ Created Node.js risk engine API
13. ✅ Implemented before/after toggle comparison
14. ✅ Added dark/light mode with theme persistence
15. ✅ Deployed to Vercel (dashboard) and Render (API)

## 🎨 Dashboard Features

**Mission Control Design System:**
- Industrial brutalist UI inspired by Linear and IBM developer tools
- Monospace typography (JetBrains Mono)
- Terminal-inspired color palette
- Amber telemetry accents (#FFB800)
- No gradients, no emoji, no consumer UI patterns

**Interactive Components:**
- Before/After toggle (red/green highlighting)
- Real-time risk score updates
- Radar chart visualization
- Bounded context risk map with color-coded borders
- Dependency risk table
- Quick wins recommendations
- BobShell audit log viewer

## 📁 Project Structure

```
├── src/                          # Jakarta EE legacy Java app
│   └── main/java/.../health/     # NEW: MicroProfile Health checks
├── bob-outputs/                  # All Bob-generated analysis
│   ├── risk-summary.json         # Before modernisation
│   ├── risk-summary-after.json   # After modernisation (NEW)
│   ├── dependency-map.json       # 20 deps with CVE scoring
│   ├── architecture-diagram.md   # DDD bounded context maps
│   ├── modernisation-plan.md     # Handling context modernisation
│   └── java17-upgrade-plan.md    # Java 17 upgrade roadmap (NEW)
├── risk-engine/                  # Node.js API serving risk data
│   └── server.js                 # Express API with before/after endpoints
├── dashboard/                    # React risk visualisation dashboard
│   ├── src/components/           # Mission Control UI components
│   │   ├── Overview.jsx          # Risk score with toggle (NEW)
│   │   ├── BoundedContextMap.jsx # Module cards with badges (NEW)
│   │   ├── DependencyRisk.jsx    # Terminal-style table
│   │   ├── QuickWins.jsx         # Recommendations
│   │   ├── BobShell.jsx          # Audit log viewer (NEW)
│   │   └── Header.jsx            # Theme toggle (NEW)
│   └── tailwind.config.js        # Mission Control design tokens
└── pom.xml                       # Maven config (Java 17, Health API)
```

## 🏃 How to Run

### Prerequisites
- Java 17 (OpenJDK or Oracle)
- Node.js 18+
- Maven 3.8+

### Quick Start

**1. Risk Engine API:**
```bash
cd risk-engine
npm install
npm start
# API runs on http://localhost:3001
```

**2. Dashboard:**
```bash
cd dashboard
npm install
npm run dev
# Dashboard opens at http://localhost:5173
```

**3. Java Application (optional):**
```bash
./mvnw clean package
# Build succeeds with Java 17
# Health checks available at /health endpoints
```

## 🎯 DDD Bounded Contexts

| Context | Risk Before | Risk After | Status |
|---|---|---|---|
| Interfaces | 80 Critical | 75 Critical | Needs modernisation |
| Infrastructure | 75 Critical | 60 High | Improved (Health checks) |
| **Handling** | **70 High** | **45 Medium** | ✅ **Modernised** |
| Cargo | 65 High | 65 High | Pending |
| Voyage | 45 Medium | 45 Medium | Stable |
| Location | 40 Low | 40 Low | Stable |

## 🔧 Technologies Used

**Backend:**
- Jakarta EE 10
- Payara 6
- Java 17 LTS
- MicroProfile Health 4.0
- JAX-RS (REST API)
- JPA (Persistence)
- JMS (Messaging)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Recharts (visualization)
- Mission Control design system

**Infrastructure:**
- Node.js + Express (Risk Engine)
- Vercel (Dashboard hosting)
- Render (API hosting)

## 📈 Modernisation Achievements

### ✅ Completed (24 hours)
1. **Java 17 LTS Upgrade** - Security patches until 2029
2. **MicroProfile Health Checks** - Kubernetes-ready monitoring
3. **REST API Modernization** - Cloud-native batch endpoint
4. **Enhanced Documentation** - Comprehensive Javadoc
5. **Dependency Management** - CVE resolution
6. **Risk Dashboard** - Before/after visualization
7. **Mission Control UI** - Industrial brutalist design

### 🎯 Future Roadmap
- H2 to PostgreSQL migration (10 point risk reduction)
- MicroProfile Metrics + Prometheus (5 point reduction)
- OpenAPI documentation (3 point reduction)
- Circuit breaker on ExternalRoutingService (5 point reduction)
- Expand REST API to all bounded contexts (8 point reduction)
- GitHub Actions CI with automated Bob analysis

## 📄 License & Attribution

**Original Project:** [Eclipse Cargo Tracker](https://github.com/eclipse-ee4j/cargotracker)  
**License:** Eclipse Public License 2.0  
**Modernisation Work:** LegacyLift team (May 2026)

This project demonstrates modernisation of the Eclipse Cargo Tracker application.
All modifications respect the original EPL 2.0 license. See LICENSE file for details.

## 🏆 Hackathon Submission

**Category:** Best Use of IBM Bob for Legacy Modernisation  
**Team:** LegacyLift  
**Date:** May 2026

See [HACKATHON.md](HACKATHON.md) for detailed submission information, demo instructions, and judging criteria.

## 🤝 Contributing

This is a hackathon demonstration project. For the original Eclipse Cargo Tracker,
see the [upstream repository](https://github.com/eclipse-ee4j/cargotracker).

## 📞 Contact

For questions about this modernisation project, please open an issue or contact the team.

---

**Built with IBM Bob** | **Powered by AI** | **Modernised in 24 hours**
