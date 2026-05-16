# Cargo Tracker Risk Engine API

A Node.js/Express REST API that provides risk analysis data for the Eclipse Cargo Tracker modernization assessment.

## Features

- 🚀 Fast and lightweight Express.js server
- 📊 Risk analysis endpoints for modernization planning
- 🔄 CORS enabled for frontend integration
- 🛡️ Graceful fallback to sample data if JSON files are missing
- 📈 Multiple data views (summary, dependencies, recommendations, quick wins)
- 🔍 Filtering and sorting capabilities

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

## Installation

```bash
cd risk-engine
npm install
```

## Usage

### Start the server

```bash
npm start
```

The server will start on `http://localhost:3000` by default.

### Development mode (with auto-reload)

```bash
npm run dev
```

### Custom port

```bash
PORT=4000 npm start
```

## API Endpoints

### Health Check

```http
GET /health
```

Returns server health status and uptime.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-16T05:00:00.000Z",
  "uptime": 123.456,
  "service": "cargo-tracker-risk-engine",
  "version": "1.0.0"
}
```

---

### Get Risk Summary

```http
GET /api/summary
```

Returns the complete risk assessment summary including overall scores, categories, modules, and migration roadmap.

**Response:** Full `risk-summary.json` content

---

### Get Dependencies

```http
GET /api/dependencies
```

Returns all Maven dependencies with CVE information and risk levels.

**Response:** Full `dependency-map.json` content (array of dependencies)

---

### Get Recommendations

```http
GET /api/recommendations
```

Returns top modules sorted by risk score (descending) with priority levels.

**Response:**
```json
{
  "total_modules": 6,
  "recommendations": [
    {
      "bounded_context": "Interfaces",
      "risk_score": 80,
      "reasons": ["JSF/Faces is legacy technology", "..."],
      "upgrade_effort_days": 30,
      "impact": "high",
      "priority": "critical"
    }
  ]
}
```

**Priority levels:**
- `critical`: risk_score >= 75
- `high`: risk_score >= 60
- `medium`: risk_score >= 40
- `low`: risk_score < 40

---

### Get Quick Wins

```http
GET /api/quick-wins
```

Returns quick win tasks sorted by impact (critical → high → medium → low) and effort.

**Response:**
```json
{
  "total_quick_wins": 8,
  "total_effort_hours": 30,
  "quick_wins": [
    {
      "title": "Specify commons-lang3 version",
      "effort_hours": 1,
      "impact": "critical",
      "description": "Add explicit version to prevent vulnerable versions",
      "implementation": "Add <version>3.14.0</version> to pom.xml"
    }
  ]
}
```

---

### Get Dependencies by Risk Level

```http
GET /api/dependencies/by-risk/:level
```

Filter dependencies by risk level.

**Parameters:**
- `level`: `critical`, `high`, `medium`, or `low`

**Example:**
```http
GET /api/dependencies/by-risk/critical
```

**Response:**
```json
{
  "risk_level": "critical",
  "count": 2,
  "dependencies": [...]
}
```

---

### Get Statistics

```http
GET /api/stats
```

Returns aggregated statistics across all data.

**Response:**
```json
{
  "overall_risk_score": 68,
  "categories": {
    "security": 72,
    "compatibility": 55,
    "maintainability": 70,
    "documentation": 75
  },
  "total_dependencies": 20,
  "dependencies_by_risk": {
    "critical": 2,
    "high": 3,
    "medium": 8,
    "low": 7
  },
  "total_modules": 6,
  "total_quick_wins": 8,
  "total_quick_wins_effort_hours": 30,
  "migration_roadmap": {
    "total_phases": 4,
    "estimated_cost": 147000
  }
}
```

---

### Reload Data

```http
POST /api/reload
```

Reloads JSON data from files without restarting the server (useful for development).

**Response:**
```json
{
  "success": true,
  "message": "Data reloaded successfully",
  "timestamp": "2026-05-16T05:00:00.000Z"
}
```

---

## Data Sources

The API reads data from JSON files in the `../bob-outputs/` directory:

- `risk-summary.json` - Overall risk assessment and recommendations
- `dependency-map.json` - Maven dependency analysis with CVE information

If these files are not found, the API will use sample data and log a warning.

## CORS Configuration

CORS is enabled for the following origins:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

To add more origins, modify the `cors` configuration in `server.js`.

## Error Handling

The API includes comprehensive error handling:

- **404 Not Found**: Returns available endpoints
- **400 Bad Request**: Invalid parameters (e.g., invalid risk level)
- **500 Internal Server Error**: Server errors with error message

## Project Structure

```
risk-engine/
├── server.js          # Main Express server
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## Example Usage with curl

```bash
# Health check
curl http://localhost:3000/health

# Get risk summary
curl http://localhost:3000/api/summary

# Get all dependencies
curl http://localhost:3000/api/dependencies

# Get recommendations
curl http://localhost:3000/api/recommendations

# Get quick wins
curl http://localhost:3000/api/quick-wins

# Get critical dependencies
curl http://localhost:3000/api/dependencies/by-risk/critical

# Get statistics
curl http://localhost:3000/api/stats

# Reload data
curl -X POST http://localhost:3000/api/reload
```

## Example Usage with JavaScript/Fetch

```javascript
// Get recommendations
const response = await fetch('http://localhost:3000/api/recommendations');
const data = await response.json();
console.log(data.recommendations);

// Get quick wins
const quickWins = await fetch('http://localhost:3000/api/quick-wins');
const wins = await quickWins.json();
console.log(`Total effort: ${wins.total_effort_hours} hours`);
```

## Integration with Frontend

This API is designed to work with frontend applications running on `localhost:5173` (e.g., Vite dev server).

Example React component:

```jsx
import { useEffect, useState } from 'react';

function RiskDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1>Risk Score: {stats.overall_risk_score}/100</h1>
      <p>Total Dependencies: {stats.total_dependencies}</p>
      <p>Quick Wins: {stats.total_quick_wins}</p>
    </div>
  );
}
```

## Development

### Adding New Endpoints

1. Add route handler in `server.js`
2. Update the available endpoints list in the 404 handler
3. Document the endpoint in this README

### Modifying Data Sources

To change the data source location, update the `loadJsonFile` function in `server.js`.

## License

MIT

## Support

For issues or questions, please refer to the main Cargo Tracker project documentation.