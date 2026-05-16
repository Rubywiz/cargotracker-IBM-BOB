import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Overview from './components/Overview';
import BoundedContextMap from './components/BoundedContextMap';
import DependencyRisk from './components/DependencyRisk';
import QuickWins from './components/QuickWins';
import BobShell from './components/BobShell';

// CRT effects toggle (set to false - not using CRT effects in Mission Control design)
const ENABLE_CRT_EFFECTS = false;

function App() {
  // Dark mode state - default to dark mode, persist in localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark
  });

  // Apply dark mode class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('light');
      root.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.classList.add('light');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-mission-bg dark:bg-mission-bg light:bg-light-bg transition-colors duration-base">
      <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <Overview />
          <BoundedContextMap />
          <DependencyRisk />
          <QuickWins />
          <BobShell />
        </div>
      </main>
      
      <footer className="bg-mission-surface dark:bg-mission-surface light:bg-light-surface border-t border-mission-border dark:border-mission-border light:border-light-border py-6 mt-12 transition-colors duration-base">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-text-primary dark:text-text-primary light:text-light-text">
            LegacyLift Risk Analysis | Powered by IBM Bob
          </p>
          <p className="text-xs text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary mt-1">
            Eclipse Cargo Tracker Modernization Assessment
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

// Made with Bob - Mission Control Design System
