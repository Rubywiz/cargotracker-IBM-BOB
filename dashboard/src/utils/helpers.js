// Risk color helper - returns colors based on risk score (LEGACY - for backward compatibility)
export function getRiskColor(score) {
  if (score >= 75) {
    return {
      bg: '#FEE2E2',
      border: '#EF4444',
      text: '#991B1B',
      label: 'Critical'
    };
  }
  if (score >= 60) {
    return {
      bg: '#FED7AA',
      border: '#F97316',
      text: '#9A3412',
      label: 'High'
    };
  }
  if (score >= 40) {
    return {
      bg: '#FEF3C7',
      border: '#EAB308',
      text: '#854D0E',
      label: 'Medium'
    };
  }
  return {
    bg: '#D1FAE5',
    border: '#10B981',
    text: '#065F46',
    label: 'Low'
  };
}

// Brutalist risk border color - returns border color for left accent
export function getRiskBorderColor(score) {
  if (score >= 75) return '#E61919'; // hazard-red
  if (score >= 60) return '#FF6B35'; // risk-high
  if (score >= 40) return '#FFB627'; // risk-medium
  return '#4AF626'; // status-green
}

// Impact badge helper - returns badge styling based on impact level (LEGACY)
export function getImpactBadge(impact) {
  const badges = {
    critical: {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: '🔴',
      label: 'CRITICAL'
    },
    high: {
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: '🟠',
      label: 'HIGH'
    },
    medium: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: '🟡',
      label: 'MEDIUM'
    },
    low: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '🟢',
      label: 'LOW'
    }
  };
  return badges[impact?.toLowerCase()] || badges.low;
}

// Brutalist impact label - returns uppercase label without emoji
export function getImpactLabel(impact) {
  const labels = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW'
  };
  return labels[impact?.toLowerCase()] || 'LOW';
}

// Risk level badge helper - returns badge styling for risk levels (LEGACY)
export function getRiskLevelBadge(level) {
  const badges = {
    critical: {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: '🔴',
      label: 'CRITICAL'
    },
    high: {
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: '🟠',
      label: 'HIGH'
    },
    medium: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: '🟡',
      label: 'MEDIUM'
    },
    low: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '🟢',
      label: 'LOW'
    }
  };
  return badges[level?.toLowerCase()] || badges.low;
}

// Format dependency name
export function formatDependencyName(dep) {
  return `${dep.groupId}:${dep.artifactId}`;
}

// Format version string
export function formatVersion(version) {
  if (!version || version === 'NOT_SPECIFIED' || version === 'MANAGED_BY_BOM') {
    return { text: '⚠️ NONE', isWarning: true };
  }
  return { text: version, isWarning: false };
}

// Get gauge color based on risk score
export function getGaugeColor(score) {
  if (score >= 75) return '#E61919'; // hazard-red
  if (score >= 50) return '#FFB627'; // risk-medium
  return '#4AF626'; // status-green
}

// Get gauge label based on risk score
export function getGaugeLabel(score) {
  if (score >= 75) return 'HIGH RISK';
  if (score >= 50) return 'MODERATE RISK';
  return 'LOW RISK';
}

// Format effort hours
export function formatEffort(hours) {
  if (hours === 1) return '1 hour';
  if (hours < 8) return `${hours} hours`;
  const days = Math.round(hours / 8 * 10) / 10;
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

// Sort modules by risk score
export function sortByRiskScore(modules) {
  return [...modules].sort((a, b) => b.risk_score - a.risk_score);
}

// Filter dependencies by risk level
export function filterByRiskLevel(dependencies, level) {
  if (level === 'all') return dependencies;
  return dependencies.filter(dep => dep.risk_level === level);
}

// Count CVEs
export function countCVEs(dep) {
  if (!dep.known_cves || !Array.isArray(dep.known_cves)) return 0;
  return dep.known_cves.length;
}

// Made with Bob
