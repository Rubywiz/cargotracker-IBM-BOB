import React, { useState, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { formatDependencyName, formatVersion, countCVEs } from '../utils/helpers';

function DependencyRisk() {
  const { data: dependencies, loading, error } = useApi('/api/dependencies');
  const [filter, setFilter] = useState('all');

  const filteredAndSorted = useMemo(() => {
    if (!dependencies || !Array.isArray(dependencies)) return [];

    let filtered = dependencies;
    
    // Apply filter
    if (filter !== 'all') {
      filtered = dependencies.filter(dep => dep.risk_level === filter);
    }

    // Apply sorting by risk level
    const sorted = [...filtered].sort((a, b) => {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return riskOrder[a.risk_level] - riskOrder[b.risk_level];
    });

    return sorted;
  }, [dependencies, filter]);

  if (loading) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Dependency Risk Analysis</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
            Loading dependencies...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel border-data-critical">
        <div className="panel-header">
          <h2 className="panel-title text-data-critical">Dependency Risk Analysis</h2>
        </div>
        <p className="text-data-critical text-sm">Error loading data: {error}</p>
      </div>
    );
  }

  const getRiskBadgeClass = (level) => {
    const classes = {
      critical: 'badge-critical',
      high: 'badge-warning',
      medium: 'badge-primary',
      low: 'badge-success'
    };
    return classes[level] || 'badge-success';
  };

  const filterTabs = [
    { value: 'all', label: 'All' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary light:text-light-text">
          Dependency Risk Analysis
        </h2>
        <div className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
          <span className="font-mono">{filteredAndSorted.length}</span> of{' '}
          <span className="font-mono">{dependencies?.length || 0}</span> dependencies
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="panel p-1 mb-4">
        <div className="flex gap-1">
          {filterTabs.map(tab => {
            const count = tab.value === 'all' 
              ? dependencies?.length || 0
              : dependencies?.filter(d => d.risk_level === tab.value).length || 0;
            
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded transition-all duration-fast ${
                  filter === tab.value
                    ? 'bg-data-primary text-mission-bg dark:text-mission-bg light:text-white'
                    : 'text-text-secondary dark:text-text-secondary light:text-light-text-secondary hover:bg-mission-surface-hover dark:hover:bg-mission-surface-hover light:hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs font-mono ${
                  filter === tab.value 
                    ? 'text-mission-bg/80 dark:text-mission-bg/80 light:text-white/80' 
                    : 'text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary'
                }`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Terminal-style Table */}
      <div className="panel overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-mission-surface-hover dark:bg-mission-surface-hover light:bg-gray-50 border-b border-mission-border dark:border-mission-border light:border-light-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-text-secondary light:text-light-text-secondary uppercase tracking-wider">
                  Dependency
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-text-secondary light:text-light-text-secondary uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-text-secondary light:text-light-text-secondary uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-text-secondary dark:text-text-secondary light:text-light-text-secondary uppercase tracking-wider">
                  CVEs
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-text-secondary dark:text-text-secondary light:text-light-text-secondary uppercase tracking-wider">
                  Upgrade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mission-border-subtle dark:divide-mission-border-subtle light:divide-light-border">
              {filteredAndSorted.map((dep, index) => {
                const versionInfo = formatVersion(dep.version);
                const cveCount = countCVEs(dep);

                return (
                  <tr key={index} className="table-row">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary dark:text-text-primary light:text-light-text">
                        {dep.artifactId}
                      </div>
                      <div className="text-xs text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary font-mono">
                        {dep.groupId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-mono ${
                        versionInfo.isWarning 
                          ? 'text-data-critical font-semibold' 
                          : 'text-text-secondary dark:text-text-secondary light:text-light-text-secondary'
                      }`}>
                        {versionInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getRiskBadgeClass(dep.risk_level)}`}>
                        {dep.risk_level.charAt(0).toUpperCase() + dep.risk_level.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {cveCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-data-critical/15 border border-data-critical/30 text-data-critical text-sm font-bold font-mono">
                          {cveCount}
                        </span>
                      ) : (
                        <span className="text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary text-sm font-mono">
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {dep.upgrade_available ? (
                        <span className="badge badge-success">
                          Yes
                        </span>
                      ) : (
                        <span className="badge bg-mission-border/15 dark:bg-mission-border/15 light:bg-gray-100 text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary border-mission-border/30 dark:border-mission-border/30 light:border-gray-300">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12 text-text-secondary dark:text-text-secondary light:text-light-text-secondary text-sm">
            No dependencies found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}

export default DependencyRisk;

// Made with Bob - Mission Control Design System
