import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getImpactLabel } from '../utils/helpers';

function QuickWins() {
  const { data, loading, error } = useApi('/api/quick-wins');
  const [expanded, setExpanded] = useState([]);
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem('quickWinsCompleted');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleExpanded = (index) => {
    setExpanded(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleCompleted = (index) => {
    const newCompleted = completed.includes(index)
      ? completed.filter(i => i !== index)
      : [...completed, index];
    
    setCompleted(newCompleted);
    localStorage.setItem('quickWinsCompleted', JSON.stringify(newCompleted));
  };

  if (loading) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Quick Wins</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
            Loading tasks...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel border-data-critical">
        <div className="panel-header">
          <h2 className="panel-title text-data-critical">Quick Wins</h2>
        </div>
        <p className="text-data-critical text-sm">Error loading data: {error}</p>
      </div>
    );
  }

  const quickWins = data?.quick_wins || [];
  const totalEffort = data?.total_effort_hours || 0;
  const completedCount = completed.length;
  const completedEffort = quickWins
    .filter((_, idx) => completed.includes(idx))
    .reduce((sum, win) => sum + win.effort_hours, 0);

  const getImpactBadgeClass = (impact) => {
    const classes = {
      critical: 'badge-critical',
      high: 'badge-warning',
      medium: 'badge-primary',
      low: 'badge-success'
    };
    return classes[impact?.toLowerCase()] || 'badge-success';
  };

  const getImpactBorderColor = (impact) => {
    const colors = {
      critical: '#FF4757',
      high: '#FF9F43',
      medium: '#FFB800',
      low: '#26DE81'
    };
    return colors[impact?.toLowerCase()] || colors.low;
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary light:text-light-text">
          Quick Wins
        </h2>
        <div className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
          Low effort, high impact
        </div>
      </div>

      {/* Summary Stats */}
      <div className="panel mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-data-primary font-mono">{quickWins.length}</div>
            <div className="text-xs text-text-secondary dark:text-text-secondary light:text-light-text-secondary mt-1 uppercase tracking-wide">
              Total Tasks
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-data-success font-mono">{completedCount}</div>
            <div className="text-xs text-text-secondary dark:text-text-secondary light:text-light-text-secondary mt-1 uppercase tracking-wide">
              Completed
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-data-warning font-mono">{totalEffort}h</div>
            <div className="text-xs text-text-secondary dark:text-text-secondary light:text-light-text-secondary mt-1 uppercase tracking-wide">
              Total Effort
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-data-secondary font-mono">{completedEffort}h</div>
            <div className="text-xs text-text-secondary dark:text-text-secondary light:text-light-text-secondary mt-1 uppercase tracking-wide">
              Completed Effort
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {quickWins.length > 0 && (
        <div className="panel mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-data-primary font-mono">
              {Math.round((completedCount / quickWins.length) * 100)}%
            </span>
          </div>
          <div className="progress-bar h-2">
            <div
              className="progress-bar-fill h-2"
              style={{ width: `${(completedCount / quickWins.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Quick Wins List */}
      <div className="space-y-4">
        {quickWins.map((win, index) => {
          const isExpanded = expanded.includes(index);
          const isCompleted = completed.includes(index);
          const borderColor = isCompleted ? '#26DE81' : getImpactBorderColor(win.impact);

          return (
            <div
              key={index}
              className={`panel panel-hover border-l-4 transition-all duration-fast ${
                isCompleted ? 'opacity-60' : ''
              }`}
              style={{ borderLeftColor: borderColor }}
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleCompleted(index)}
                    className="w-5 h-5 text-data-primary border-mission-border dark:border-mission-border light:border-light-border rounded focus:ring-data-primary cursor-pointer"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className={`text-base font-semibold ${
                      isCompleted 
                        ? 'line-through text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary' 
                        : 'text-text-primary dark:text-text-primary light:text-light-text'
                    }`}>
                      {win.title}
                    </h3>
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="flex-shrink-0 text-data-primary hover:text-data-primary/80 transition-colors text-sm"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
                      <span className="font-semibold font-mono text-data-primary">{win.effort_hours}h</span> effort
                    </span>
                    <span className={`badge ${getImpactBadgeClass(win.impact)}`}>
                      {getImpactLabel(win.impact)} Impact
                    </span>
                  </div>

                  {/* Description */}
                  <p className={`text-sm mb-3 ${
                    isCompleted 
                      ? 'text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary' 
                      : 'text-text-secondary dark:text-text-secondary light:text-light-text-secondary'
                  }`}>
                    {win.description}
                  </p>

                  {/* Implementation Details (Expandable) */}
                  {isExpanded && win.implementation && (
                    <div className="mt-4 p-4 bg-mission-surface-hover dark:bg-mission-surface-hover light:bg-gray-50 rounded border border-mission-border-subtle dark:border-mission-border-subtle light:border-light-border">
                      <div className="text-xs font-semibold text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary mb-2 uppercase tracking-wide">
                        Implementation
                      </div>
                      <p className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary font-mono whitespace-pre-wrap">
                        {win.implementation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {quickWins.length === 0 && (
        <div className="panel p-12 text-center text-text-secondary dark:text-text-secondary light:text-light-text-secondary text-sm">
          No quick wins available.
        </div>
      )}

      {/* Completion Message */}
      {quickWins.length > 0 && completedCount === quickWins.length && (
        <div className="mt-6 panel border-2 border-data-success bg-data-success/10 text-center">
          <h3 className="text-lg font-semibold text-data-success mb-2">
            All tasks completed!
          </h3>
          <p className="text-sm text-data-success">
            Total effort: <span className="font-mono font-bold">{totalEffort} hours</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default QuickWins;

// Made with Bob - Mission Control Design System
