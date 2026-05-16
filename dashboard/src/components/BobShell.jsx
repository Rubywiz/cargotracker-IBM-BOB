import React, { useState, useEffect, useRef } from 'react';

// Simple Terminal SVG icon (no external dependencies)
const TerminalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="4 17 10 11 4 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="19" x2="20" y2="19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function BobShell() {
  const [logContent, setLogContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    // Fetch the audit log file
    fetch('/bob-outputs/bobshell-audit.log')
      .then(response => {
        if (!response.ok) {
          throw new Error('Log file not found');
        }
        return response.text();
      })
      .then(text => {
        // Parse log lines - split by newlines and filter empty lines
        const lines = text.split('\n').filter(line => line.trim());
        setLogContent(lines);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logContent]);

  const parseLogLine = (line) => {
    // Check if line starts with $ (command prompt)
    if (line.trim().startsWith('$')) {
      return { type: 'command', text: line };
    }
    // Otherwise it's output
    return { type: 'output', text: line };
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-data-success">
            <TerminalIcon />
          </div>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary light:text-light-text">
            Bob Shell Audit Log
          </h2>
        </div>
        <div className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
          <span className="font-mono">{logContent.length}</span> lines
        </div>
      </div>

      {/* Terminal Panel */}
      <div className="panel p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="text-sm text-text-secondary dark:text-text-secondary light:text-light-text-secondary">
              Loading audit log...
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="text-sm text-data-warning">
              Log file not available: {error}
            </div>
            <div className="text-xs text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary mt-2">
              The bobshell-audit.log file will be created when Bob Shell commands are executed.
            </div>
          </div>
        ) : (
          <div
            ref={terminalRef}
            className="bg-black dark:bg-black light:bg-gray-900 p-4 font-mono text-sm overflow-y-auto max-h-96"
            style={{ 
              backgroundColor: '#000000',
              color: '#888888'
            }}
          >
            {logContent.length === 0 ? (
              <div className="text-text-tertiary dark:text-text-tertiary light:text-gray-500">
                No audit log entries yet.
              </div>
            ) : (
              logContent.map((line, index) => {
                const parsed = parseLogLine(line);
                
                if (parsed.type === 'command') {
                  return (
                    <div key={index} className="mb-1">
                      <span style={{ color: '#4AF626' }}>$ </span>
                      <span style={{ color: '#4AF626' }}>
                        {parsed.text.substring(1).trim()}
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div key={index} className="mb-1" style={{ color: '#888888' }}>
                      {parsed.text}
                    </div>
                  );
                }
              })
            )}
          </div>
        )}
      </div>

      {/* Terminal Info */}
      <div className="mt-2 text-xs text-text-tertiary dark:text-text-tertiary light:text-light-text-secondary">
        <span className="font-mono">bob-outputs/bobshell-audit.log</span> — 
        Live terminal output from IBM Bob Shell commands
      </div>
    </div>
  );
}

export default BobShell;

// Made with Bob - Mission Control Design System