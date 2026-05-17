import { API_BASE_URL } from '../hooks/useApi';
import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { getGaugeColor, getGaugeLabel } from '../utils/helpers';

function Overview({ viewMode, setViewMode }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data based on viewMode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = viewMode === 'before' ? '/api/summary' : '/api/summary-after';
        const response = await fetch(`${API_BASE_URL}${endpoint}`);≈
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Transform data to match stats format
        const transformedStats = {
          overall_risk_score: data.overall_risk_score,
          categories: data.categories,
          assessment_date: data.assessment_date
        };
        
        setStats(transformedStats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode]);

  if (loading) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Overview</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
            Loading telemetry...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel border-data-critical">
        <div className="panel-header">
          <h2 className="panel-title text-data-critical">Overview</h2>
        </div>
        <p className="text-data-critical text-sm">Error loading data: {error}</p>
      </div>
    );
  }

  const riskScore = stats?.overall_risk_score || 0;
  const categories = stats?.categories || {};

  // Prepare data for radar chart
  const radarData = [
    { category: 'Security', value: categories.security || 0, fullMark: 100 },
    { category: 'Compatibility', value: categories.compatibility || 0, fullMark: 100 },
    { category: 'Maintainability', value: categories.maintainability || 0, fullMark: 100 },
    { category: 'Documentation', value: categories.documentation || 0, fullMark: 100 }
  ];

  const riskColor = getGaugeColor(riskScore);
  const riskLabel = getGaugeLabel(riskScore);

  return (
    <div className="space-y-6">
      {/* Toggle Buttons */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className={`px-4 py-2 border font-mono text-sm transition-colors ${
            viewMode === 'before'
              ? 'bg-red-500/10 border-red-500 text-red-400'
              : 'bg-surface-dark border-border-dark text-text-secondary hover:border-accent-amber'
          }`}
          onClick={() => setViewMode('before')}
        >
          BEFORE MODERNISATION
        </button>
        <button
          className={`px-4 py-2 border font-mono text-sm transition-colors ${
            viewMode === 'after'
              ? 'bg-green-500/10 border-green-500 text-green-400'
              : 'bg-surface-dark border-border-dark text-text-secondary hover:border-accent-amber'
          }`}
          onClick={() => setViewMode('after')}
        >
          AFTER MODERNISATION
        </button>
        {stats?.assessment_date && (
          <div className="ml-auto text-sm text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary font-mono">
            Assessment: {stats.assessment_date}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Risk Score */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Overall Risk Score</h3>
          </div>
          
          {/* Large telemetry value - amber monospace */}
          <div className="flex items-baseline gap-2 mb-4">
            <div className="font-mono text-6xl font-bold text-data-primary">
              {riskScore}
            </div>
            <div className="text-2xl text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary font-mono">
              / 100
            </div>
          </div>
          
          {/* Risk level badge */}
          <div className={`inline-flex items-center badge ${
            riskScore >= 75 ? 'badge-critical' :
            riskScore >= 60 ? 'badge-warning' :
            riskScore >= 40 ? 'badge-primary' :
            'badge-success'
          } mb-6`}>
            {riskLabel}
          </div>

          {/* Category Progress Bars */}
          <div className="space-y-4 mt-6">
            {radarData.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
                    {item.category}
                  </span>
                  <span className="text-sm font-mono font-semibold text-data-primary">
                    {item.value}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: getGaugeColor(item.value)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Radar Chart */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Risk Categories</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1E3A5F" />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fill: '#8BA3C7', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: '#4A6080', fontSize: 10 }}
              />
              <Radar
                name="Risk Score"
                dataKey="value"
                stroke="#FFB800"
                fill="#FFB800"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Java Migration Panel */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Java Version Migration Path</h3>
        </div>
        <div className="flex items-center justify-center gap-8 py-4">
          <div className="flex flex-col items-center">
            <div className="px-6 py-3 rounded border-2 border-data-critical bg-data-critical/10">
              <div className="text-xl font-mono font-bold text-data-critical">Java 11</div>
            </div>
            <div className="text-xs text-data-critical mt-2 font-semibold uppercase tracking-wide">
              Current (EOL)
            </div>
          </div>
          
          <div className="text-2xl text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary">
            →
          </div>
          
          <div className="flex flex-col items-center">
            <div className="px-6 py-3 rounded border-2 border-data-success bg-data-success/10">
              <div className="text-xl font-mono font-bold text-data-success">Java 21</div>
            </div>
            <div className="text-xs text-data-success mt-2 font-semibold uppercase tracking-wide">
              Target (LTS)
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary mt-4">
          Migration required: Java 11 reached end-of-life in September 2023
        </p>
      </div>
    </div>
  );
}

export default Overview;

// Made with Bob - Mission Control Design System
