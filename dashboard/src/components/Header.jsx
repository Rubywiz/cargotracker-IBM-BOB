import React from 'react';

// Simple SVG icon components (no external dependencies)
const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" strokeWidth="2" />
    <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" />
    <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" />
    <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" />
    <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Header({ isDarkMode, onToggleTheme }) {
  return (
    <header className="bg-mission-surface dark:bg-mission-surface light:bg-white border-b border-mission-border dark:border-mission-border light:border-light-border transition-colors duration-base">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Brand and subtitle */}
          <div>
            <h1 className="text-xl font-semibold text-text-primary dark:text-text-primary light:text-light-text">
              LegacyLift
            </h1>
            <p className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary mt-0.5">
              Eclipse Cargo Tracker · Risk Analysis
            </p>
          </div>
          
          {/* Right: Status, version, and theme toggle */}
          <div className="flex items-center gap-4">
            {/* Live status indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-data-success rounded-full animate-pulse"></div>
              <span className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
                Live
              </span>
            </div>
            
            {/* Version badge */}
            <div className="px-3 py-1 bg-data-primary/10 border border-data-primary/30 rounded text-xs font-medium text-data-primary">
              IBM Bob v1.0.2
            </div>

            {/* Theme toggle button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded border border-mission-border dark:border-mission-border light:border-light-border hover:bg-mission-surface-hover dark:hover:bg-mission-surface-hover light:hover:bg-gray-100 transition-all duration-fast"
              aria-label="Toggle theme"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon />
              ) : (
                <MoonIcon />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

// Made with Bob - Mission Control Design System
