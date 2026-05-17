import { API_BASE_URL } from '../hooks/useApi';
import React, { useState, useEffect } from 'react';
import { getRiskBorderColor, getImpactLabel } from '../utils/helpers';

function BoundedContextMap({ viewMode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data based on viewMode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = viewMode === 'before' ? '/api/recommendations' : '/api/recommendations-after';
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
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
          <h2 className="panel-title">Bounded Context Risk Map</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
            Loading modules...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel border-data-critical">
        <div className="panel-header">
          <h2 className="panel-title text-data-critical">Bounded Context Risk Map</h2>
        </div>
        <p className="text-data-critical text-sm">Error loading data: {error}</p>
      </div>
    );
  }

  const recommendations = data?.recommendations || [];

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary light:text-light-text">
          Bounded Context Risk Map
        </h2>
        <div className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
          {recommendations.length} modules
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((module, index) => {
          const borderColor = getRiskBorderColor(module.risk_score);
          
          return (
            <div
              key={index}
              className="panel panel-hover border-l-4 transition-all duration-fast"
              style={{ borderLeftColor: borderColor }}
            >
              {/* Module Name */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-text-primary dark:text-text-primary light:text-light-text">
                  {module.bounded_context}
                </h3>
                {viewMode === 'after' && module.bounded_context === 'Handling' && (
                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500 text-green-400 text-xs font-mono">
                    MODERNISED
                  </span>
                )}
              </div>
              
              {/* Risk Score - Large monospace amber */}
              <div className="flex items-baseline gap-2 mb-3">
                {viewMode === 'after' && module.bounded_context === 'Handling' && module.previous_risk_score ? (
                  <>
                    <div className="font-mono text-4xl font-bold line-through text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary opacity-50">
                      {module.previous_risk_score}
                    </div>
                    <div className="text-2xl text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary mx-2">
                      →
                    </div>
                    <div className="font-mono text-4xl font-bold text-green-400">
                      {module.risk_score}
                    </div>
                  </>
                ) : (
                  <div className="font-mono text-4xl font-bold text-data-primary">
                    {module.risk_score}
                  </div>
                )}
                <div className="text-sm text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary">
                  / 100
                </div>
              </div>
              
              {/* Impact Badge */}
              <div className="mb-3">
                <span className={`badge ${
                  module.risk_score >= 75 ? 'badge-critical' :
                  module.risk_score >= 60 ? 'badge-warning' :
                  module.risk_score >= 40 ? 'badge-primary' :
                  'badge-success'
                }`}>
                  {getImpactLabel(module.impact)} Impact
                </span>
              </div>
              
              {/* Effort */}
              <div className="mb-4 text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
                <span className="font-medium">Upgrade effort:</span>{' '}
                <span className="text-text-primary dark:text-text-primary light:text-light-text font-mono font-semibold">
                  {module.upgrade_effort_days} days
                </span>
              </div>
              
              {/* Top Concerns */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary mb-2">
                  Top concerns:
                </div>
                <ul className="space-y-1.5">
                  {module.reasons.slice(0, 2).map((reason, idx) => (
                    <li key={idx} className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary flex items-start gap-2">
                      <span className="text-data-primary mt-0.5">•</span>
                      <span className="flex-1">{reason}</span>
                    </li>
                  ))}
                </ul>
                {module.reasons.length > 2 && (
                  <div className="text-xs text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary mt-2">
                    +{module.reasons.length - 2} more concerns
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 panel">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-risk-critical font-mono">
              {recommendations.filter(m => m.risk_score >= 75).length}
            </div>
            <div className="text-xs text-text-secondary dark:text-text-secondary light:text-light-text-secondary mt-1 uppercase tracking-wide">
              Critical Risk
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-risk-high font-mono">
              {recommendations.filter(m => m.risk_score >= 60 && m.risk_score < 75).length}
            </div>
            <div className="text-xs text-text-secondary dark:text-text-secondary light:text-light-text-secondary mt-1 uppercase tracking-wide">
              High Risk
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-risk-medium font-mono">
              {recommendations.filter(m => m.risk_score >= 40 && m.risk_score < 60).length}
            </div>
            <div className="text-xs text-text-secondary dark:text-text-secondary light:text-light-text-secondary mt-1 uppercase tracking-wide">
              Medium Risk
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-risk-low font-mono">
              {recommendations.filter(m => m.risk_score < 40).length}
            </div>
            <div className="text-xs text-text-secondary dark:text-text-secondary light:text-light-text-secondary mt-1 uppercase tracking-wide">
              Low Risk
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoundedContextMap;

// Made with Bob - Mission Control Design System
