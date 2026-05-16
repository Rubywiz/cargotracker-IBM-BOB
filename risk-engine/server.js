import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Helper function to load JSON files with fallback to sample data
function loadJsonFile(filename, sampleData) {
  try {
    const filePath = join(__dirname, '..', 'bob-outputs', filename);
    const data = readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Warning: Could not load ${filename}, using sample data. Error: ${error.message}`);
    return sampleData;
  }
}

// Sample data for fallback
const sampleRiskSummary = {
  overall_risk_score: 68,
  assessment_date: new Date().toISOString().split('T')[0],
  project_info: {
    name: "Eclipse Cargo Tracker",
    version: "3.1-SNAPSHOT",
    java_version: "11",
    jakarta_ee_version: "10.0.0"
  },
  categories: {
    security: 72,
    compatibility: 55,
    maintainability: 70,
    documentation: 75
  },
  top_modules: [
    {
      bounded_context: "Interfaces",
      risk_score: 80,
      reasons: ["JSF/Faces is legacy technology", "No API versioning"],
      upgrade_effort_days: 30,
      impact: "high"
    }
  ],
  quick_wins: [
    {
      title: "Specify commons-lang3 version",
      effort_hours: 1,
      impact: "critical",
      description: "Add explicit version to prevent vulnerable versions"
    }
  ]
};

const sampleDependencies = [
  {
    groupId: "jakarta.platform",
    artifactId: "jakarta.jakartaee-api",
    version: "10.0.0",
    known_cves: [],
    is_deprecated: false,
    upgrade_available: false,
    risk_level: "low"
  }
];

// Load data on startup
let riskSummary = loadJsonFile('risk-summary.json', sampleRiskSummary);
let dependencies = loadJsonFile('dependency-map.json', sampleDependencies);

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'cargo-tracker-risk-engine',
    version: '1.0.0'
  });
});

// Get complete risk summary
app.get('/api/summary', (req, res) => {
  res.json(riskSummary);
});

// Get all dependencies
app.get('/api/dependencies', (req, res) => {
  res.json(dependencies);
});

// Get recommendations (top modules sorted by risk score descending)
app.get('/api/recommendations', (req, res) => {
  const topModules = riskSummary.top_modules || [];
  const sortedModules = [...topModules].sort((a, b) => b.risk_score - a.risk_score);
  
  res.json({
    total_modules: sortedModules.length,
    recommendations: sortedModules.map(module => ({
      ...module,
      priority: module.risk_score >= 75 ? 'critical' : 
                module.risk_score >= 60 ? 'high' : 
                module.risk_score >= 40 ? 'medium' : 'low'
    }))
  });
});

// Get quick wins
app.get('/api/quick-wins', (req, res) => {
  const quickWins = riskSummary.quick_wins || [];
  
  // Sort by impact (critical > high > medium > low) and then by effort
  const impactOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedWins = [...quickWins].sort((a, b) => {
    const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
    if (impactDiff !== 0) return impactDiff;
    return a.effort_hours - b.effort_hours;
  });
  
  res.json({
    total_quick_wins: sortedWins.length,
    total_effort_hours: sortedWins.reduce((sum, win) => sum + win.effort_hours, 0),
    quick_wins: sortedWins
  });
});

// Get dependencies by risk level
app.get('/api/dependencies/by-risk/:level', (req, res) => {
  const { level } = req.params;
  const validLevels = ['critical', 'high', 'medium', 'low'];
  
  if (!validLevels.includes(level)) {
    return res.status(400).json({
      error: 'Invalid risk level',
      valid_levels: validLevels
    });
  }
  
  const filtered = dependencies.filter(dep => dep.risk_level === level);
  res.json({
    risk_level: level,
    count: filtered.length,
    dependencies: filtered
  });
});

// Get overall statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    overall_risk_score: riskSummary.overall_risk_score,
    categories: riskSummary.categories,
    total_dependencies: dependencies.length,
    dependencies_by_risk: {
      critical: dependencies.filter(d => d.risk_level === 'critical').length,
      high: dependencies.filter(d => d.risk_level === 'high').length,
      medium: dependencies.filter(d => d.risk_level === 'medium').length,
      low: dependencies.filter(d => d.risk_level === 'low').length
    },
    total_modules: riskSummary.top_modules?.length || 0,
    total_quick_wins: riskSummary.quick_wins?.length || 0,
    total_quick_wins_effort_hours: riskSummary.quick_wins?.reduce((sum, win) => sum + win.effort_hours, 0) || 0,
    migration_roadmap: riskSummary.migration_roadmap ? {
      total_phases: Object.keys(riskSummary.migration_roadmap).length,
      estimated_cost: riskSummary.cost_benefit_analysis?.estimated_cost_usd || 0
    } : null
  };
  
  res.json(stats);
});

// Reload data endpoint (useful for development)
app.post('/api/reload', (req, res) => {
  try {
    riskSummary = loadJsonFile('risk-summary.json', sampleRiskSummary);
    dependencies = loadJsonFile('dependency-map.json', sampleDependencies);
    res.json({
      success: true,
      message: 'Data reloaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    available_endpoints: [
      'GET /health',
      'GET /api/summary',
      'GET /api/dependencies',
      'GET /api/recommendations',
      'GET /api/quick-wins',
      'GET /api/dependencies/by-risk/:level',
      'GET /api/stats',
      'POST /api/reload'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cargo Tracker Risk Engine API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health`);
  console.log(`  GET  /api/summary`);
  console.log(`  GET  /api/dependencies`);
  console.log(`  GET  /api/recommendations`);
  console.log(`  GET  /api/quick-wins`);
  console.log(`  GET  /api/dependencies/by-risk/:level`);
  console.log(`  GET  /api/stats`);
  console.log(`  POST /api/reload`);
});

// Made with Bob
