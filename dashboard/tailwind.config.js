/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class strategy
  theme: {
    extend: {
      colors: {
        // Mission Control Dark Mode (default)
        mission: {
          bg: '#0B1120',           // Deep space navy background
          surface: '#111827',       // Elevated panels
          'surface-hover': '#1A2535', // Interactive surface hover
          'surface-active': '#1E3A5F', // Selected/active panel
          border: '#1E3A5F',        // Panel dividers
          'border-subtle': '#162035', // Inner dividers
        },
        // Data/Telemetry colors (work in both modes)
        data: {
          primary: '#FFB800',       // Primary telemetry (amber)
          secondary: '#00D4FF',     // Healthy/active (cyan)
          critical: '#FF4757',      // Critical alerts
          warning: '#FF9F43',       // Warnings
          success: '#26DE81',       // Nominal status
        },
        // Text colors for dark mode
        text: {
          primary: '#E8F0FE',       // High contrast readable
          secondary: '#8BA3C7',     // Labels, descriptors
          tertiary: '#4A6080',      // Timestamps, metadata
        },
        // Light mode colors
        light: {
          bg: '#F8F9FC',            // Light background
          surface: '#FFFFFF',       // White cards
          border: '#E2E8F0',        // Light borders
          text: '#0F172A',          // Dark text
          'text-secondary': '#64748B', // Secondary text
        },
        // Risk level mapping (using Mission Control colors)
        risk: {
          critical: '#FF4757',      // 75+ (data-critical)
          high: '#FF9F43',          // 60-74 (data-warning)
          medium: '#FFB800',        // 40-59 (data-primary)
          low: '#26DE81',           // <40 (data-success)
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        DEFAULT: '4px',
        // Maximum 4px per Mission Control spec
      },
      transitionDuration: {
        'fast': '100ms',
        'base': '150ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'in': 'ease-in',
        'out': 'ease-out',
      },
    },
  },
  plugins: [],
}

// Made with Bob - Mission Control Design System
