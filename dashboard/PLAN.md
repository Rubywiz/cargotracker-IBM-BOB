# LegacyLift Dashboard - Implementation Plan

## Project Overview

A React 18 dashboard that visualizes risk analysis data for the Eclipse Cargo Tracker modernization assessment, powered by IBM Bob.

**Tech Stack:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (data visualization)
- Axios (API calls)

**API Endpoint:** `http://localhost:3000`

---

## Architecture

```
dashboard/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Overview.jsx
│   │   ├── BoundedContextMap.jsx
│   │   ├── DependencyRisk.jsx
│   │   └── QuickWins.jsx
│   ├── hooks/
│   │   └── useApi.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── PLAN.md (this file)
└── README.md
```

---

## Component Breakdown

### 1. Header Component (`Header.jsx`)

**Purpose:** Display application branding and title

**Design:**
```
┌─────────────────────────────────────────────────────────┐
│  🚀 LegacyLift | Powered by IBM Bob                     │
│  Eclipse Cargo Tracker - Modernization Risk Analysis    │
└─────────────────────────────────────────────────────────┘
```

**Props:** None

**Features:**
- Gradient background (blue to purple)
- IBM Bob branding
- Responsive design

---

### 2. Overview Component (`Overview.jsx`)

**Purpose:** Display high-level risk metrics

**API Endpoint:** `GET /api/stats`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Overview                                                │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────────────┐  │
│  │   Risk      │  │   Risk Categories (Radar)       │  │
│  │   Gauge     │  │                                 │  │
│  │    68/100   │  │   Security: 72                  │  │
│  │   (Amber)   │  │   Compatibility: 55             │  │
│  │             │  │   Maintainability: 70           │  │
│  └─────────────┘  │   Documentation: 75             │  │
│                   └─────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Java Version Migration                         │   │
│  │  [Java 11] ──────────────────> [Java 21]       │   │
│  │  (Current)                      (Target)        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Sub-components:**

#### Risk Gauge
- **Library:** Recharts RadialBarChart
- **Color Logic:**
  - Green: 0-49 (#10B981)
  - Amber: 50-74 (#F59E0B)
  - Red: 75-100 (#EF4444)
- **Display:** Large number in center with color-coded ring

#### Radar Chart
- **Library:** Recharts RadarChart
- **Data Points:** 4 categories (security, compatibility, maintainability, documentation)
- **Scale:** 0-100
- **Color:** Blue gradient (#3B82F6)

#### Java Version Badge
- **Design:** Two badges with arrow between them
- **Current:** Red badge "Java 11 (EOL)"
- **Target:** Green badge "Java 21 LTS"
- **Arrow:** Animated gradient arrow

**State:**
```javascript
{
  overall_risk_score: 68,
  categories: {
    security: 72,
    compatibility: 55,
    maintainability: 70,
    documentation: 75
  }
}
```

---

### 3. Bounded Context Map Component (`BoundedContextMap.jsx`)

**Purpose:** Display risk analysis for each bounded context/module

**API Endpoint:** `GET /api/recommendations`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Bounded Context Risk Map                                │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Interface │  │Infrastr. │  │Handling  │             │
│  │Risk: 80  │  │Risk: 75  │  │Risk: 70  │             │
│  │Impact:   │  │Impact:   │  │Impact:   │             │
│  │  High    │  │  High    │  │  High    │             │
│  │Effort:   │  │Effort:   │  │Effort:   │             │
│  │  30 days │  │  25 days │  │  20 days │             │
│  │          │  │          │  │          │             │
│  │Reasons:  │  │Reasons:  │  │Reasons:  │             │
│  │• JSF is  │  │• JMS not │  │• Async   │             │
│  │  legacy  │  │  cloud   │  │  events  │             │
│  │• No API  │  │• No      │  │• File    │             │
│  │  version │  │  circuit │  │  batch   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Cargo     │  │Voyage    │  │Location  │             │
│  │Risk: 65  │  │Risk: 45  │  │Risk: 40  │             │
│  │...       │  │...       │  │...       │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

**Card Design:**

Each card shows:
1. **Header:** Bounded context name
2. **Risk Score:** Large number with color-coded background
3. **Impact Badge:** High/Medium/Low with color
4. **Effort:** Days required
5. **Top 2 Reasons:** Bullet list

**Color Coding:**
- Critical (75-100): Red background (#FEE2E2), red border (#EF4444)
- High (60-74): Orange background (#FED7AA), orange border (#F97316)
- Medium (40-59): Yellow background (#FEF3C7), yellow border (#EAB308)
- Low (0-39): Green background (#D1FAE5), green border (#10B981)

**Grid Layout:**
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column

**State:**
```javascript
{
  recommendations: [
    {
      bounded_context: "Interfaces",
      risk_score: 80,
      reasons: ["JSF/Faces is legacy", "No API versioning"],
      upgrade_effort_days: 30,
      impact: "high",
      priority: "critical"
    }
  ]
}
```

---

### 4. Dependency Risk Component (`DependencyRisk.jsx`)

**Purpose:** Display Maven dependencies with risk assessment

**API Endpoint:** `GET /api/dependencies`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Dependency Risk Analysis                                        │
├─────────────────────────────────────────────────────────────────┤
│  Filter: [All] [Critical] [High] [Medium] [Low]                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Name              │ Version │ Risk   │ CVEs │ Upgrade?  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ commons-lang3     │ NONE    │ 🔴 CRIT│  ?   │ ⚠️ YES    │  │
│  │ h2                │ 2.3.232 │ 🔴 CRIT│  2   │ ✅ YES    │  │
│  │ arquillian-bom    │ 1.8.0   │ 🟡 MED │  0   │ ✅ YES    │  │
│  │ jakarta.ee-api    │ 10.0.0  │ 🟢 LOW │  0   │ ❌ NO     │  │
│  │ ...               │ ...     │ ...    │ ...  │ ...       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Showing 20 of 20 dependencies                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**

1. **Filter Buttons:**
   - All (default)
   - Critical (red)
   - High (orange)
   - Medium (yellow)
   - Low (green)

2. **Table Columns:**
   - **Name:** `groupId:artifactId`
   - **Version:** Version string or "NOT_SPECIFIED"
   - **Risk Level:** Badge with color and icon
   - **CVE Count:** Number of known CVEs
   - **Upgrade Available:** Yes/No with icon

3. **Risk Level Badges:**
   - Critical: Red badge with 🔴
   - High: Orange badge with 🟠
   - Medium: Yellow badge with 🟡
   - Low: Green badge with 🟢

4. **Sorting:**
   - Default: Risk level (critical first)
   - Clickable column headers for sorting

5. **Responsive:**
   - Desktop: Full table
   - Mobile: Card layout with stacked info

**State:**
```javascript
{
  dependencies: [...],
  filter: 'all', // 'all' | 'critical' | 'high' | 'medium' | 'low'
  sortBy: 'risk', // 'risk' | 'name' | 'version'
  sortOrder: 'desc' // 'asc' | 'desc'
}
```

---

### 5. Quick Wins Component (`QuickWins.jsx`)

**Purpose:** Display actionable quick win tasks

**API Endpoint:** `GET /api/quick-wins`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Quick Wins - Low Effort, High Impact                            │
├─────────────────────────────────────────────────────────────────┤
│  Total: 8 tasks | Total Effort: 30 hours                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Specify commons-lang3 version                           │ │
│  │    ⏱️ 1 hour | 🔴 CRITICAL                                  │ │
│  │    Add explicit version to prevent vulnerable versions     │ │
│  │    💡 Implementation: Add <version>3.14.0</version>        │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 2. Run OWASP dependency check                              │ │
│  │    ⏱️ 2 hours | 🟠 HIGH                                     │ │
│  │    Add and run OWASP dependency-check-maven plugin         │ │
│  │    💡 Implementation: mvn dependency-check:check           │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ...                                                             │
└─────────────────────────────────────────────────────────────────┘
```

**Card Design:**

Each quick win card shows:
1. **Number & Title:** Sequential number and task title
2. **Effort & Impact:** Hours required and impact badge
3. **Description:** Brief explanation
4. **Implementation:** Specific steps (collapsible)

**Impact Badges:**
- Critical: Red badge (#EF4444)
- High: Orange badge (#F97316)
- Medium: Yellow badge (#EAB308)
- Low: Green badge (#10B981)

**Features:**
- Expandable cards (click to show/hide implementation)
- Progress tracking (checkboxes - local storage)
- Total effort counter at top

**State:**
```javascript
{
  quick_wins: [...],
  completed: [], // Array of completed task indices
  expanded: [] // Array of expanded card indices
}
```

---

## Custom Hooks

### `useApi.js`

**Purpose:** Centralized API data fetching with error handling

```javascript
export function useApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000${endpoint}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}
```

**Usage:**
```javascript
const { data, loading, error } = useApi('/api/stats');
```

---

## Utility Functions (`utils/helpers.js`)

### Risk Color Helper
```javascript
export function getRiskColor(score) {
  if (score >= 75) return { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' };
  if (score >= 60) return { bg: '#FED7AA', border: '#F97316', text: '#9A3412' };
  if (score >= 40) return { bg: '#FEF3C7', border: '#EAB308', text: '#854D0E' };
  return { bg: '#D1FAE5', border: '#10B981', text: '#065F46' };
}
```

### Impact Badge Helper
```javascript
export function getImpactBadge(impact) {
  const badges = {
    critical: { color: 'bg-red-100 text-red-800 border-red-300', icon: '🔴' },
    high: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🟠' },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🟡' },
    low: { color: 'bg-green-100 text-green-800 border-green-300', icon: '🟢' }
  };
  return badges[impact] || badges.low;
}
```

### Format Helpers
```javascript
export function formatDependencyName(dep) {
  return `${dep.groupId}:${dep.artifactId}`;
}

export function formatVersion(version) {
  return version === 'NOT_SPECIFIED' ? '⚠️ NONE' : version;
}
```

---

## Main App Component (`App.jsx`)

**Layout:**
```javascript
<div className="min-h-screen bg-gray-50">
  <Header />
  
  <main className="container mx-auto px-4 py-8">
    <div className="space-y-8">
      <Overview />
      <BoundedContextMap />
      <DependencyRisk />
      <QuickWins />
    </div>
  </main>
  
  <footer className="bg-gray-800 text-white py-4 mt-12">
    <div className="container mx-auto px-4 text-center">
      <p>LegacyLift Risk Analysis | Powered by IBM Bob</p>
      <p className="text-sm text-gray-400">
        Eclipse Cargo Tracker Modernization Assessment
      </p>
    </div>
  </footer>
</div>
```

---

## Styling Strategy

### Tailwind CSS Configuration

**Colors:**
```javascript
colors: {
  risk: {
    critical: '#EF4444',
    high: '#F97316',
    medium: '#EAB308',
    low: '#10B981'
  },
  ibm: {
    blue: '#0F62FE',
    purple: '#8A3FFC'
  }
}
```

**Custom Classes:**
- `.card` - Standard card with shadow and rounded corners
- `.badge` - Pill-shaped badge for status indicators
- `.gradient-header` - Blue to purple gradient for header

---

## Data Flow

```
API Server (localhost:3000)
    ↓
useApi Hook
    ↓
Component State
    ↓
Recharts / Table / Cards
    ↓
User Interface
```

---

## Error Handling

1. **API Errors:**
   - Display error message in component
   - Retry button
   - Fallback to sample data if available

2. **Loading States:**
   - Skeleton loaders for each component
   - Spinner for initial load

3. **No Data:**
   - Empty state messages
   - Instructions to start API server

---

## Responsive Design

### Breakpoints:
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: > 1024px (lg)

### Adaptations:
- **Mobile:** Single column, stacked cards, simplified tables
- **Tablet:** 2-column grid, compact tables
- **Desktop:** Full layout with 3-column grid

---

## Performance Optimizations

1. **Lazy Loading:** Components loaded on demand
2. **Memoization:** React.memo for expensive components
3. **Debouncing:** Search and filter inputs
4. **Virtual Scrolling:** For large dependency lists (if needed)

---

## Accessibility

1. **ARIA Labels:** All interactive elements
2. **Keyboard Navigation:** Tab order, Enter/Space for actions
3. **Color Contrast:** WCAG AA compliant
4. **Screen Reader:** Semantic HTML, descriptive text

---

## Testing Strategy

1. **Unit Tests:** Component logic with Vitest
2. **Integration Tests:** API integration with MSW (Mock Service Worker)
3. **E2E Tests:** User flows with Playwright (optional)

---

## Development Workflow

### Phase 1: Setup (1 hour)
- [ ] Initialize Vite project
- [ ] Install dependencies
- [ ] Configure Tailwind CSS
- [ ] Set up project structure

### Phase 2: Core Components (3 hours)
- [ ] Create Header component
- [ ] Create useApi hook
- [ ] Create utility functions
- [ ] Set up App layout

### Phase 3: Overview Panel (2 hours)
- [ ] Implement risk gauge with Recharts
- [ ] Implement radar chart
- [ ] Create Java version badge
- [ ] Add responsive layout

### Phase 4: Bounded Context Map (2 hours)
- [ ] Create context card component
- [ ] Implement grid layout
- [ ] Add color coding logic
- [ ] Make responsive

### Phase 5: Dependency Risk (2 hours)
- [ ] Create table component
- [ ] Implement filtering
- [ ] Add sorting functionality
- [ ] Make responsive (card view for mobile)

### Phase 6: Quick Wins (1.5 hours)
- [ ] Create quick win card
- [ ] Implement expand/collapse
- [ ] Add progress tracking
- [ ] Calculate totals

### Phase 7: Polish (1.5 hours)
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add animations
- [ ] Test responsiveness
- [ ] Write README

**Total Estimated Time:** 13 hours

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## Future Enhancements

1. **Export to PDF:** Generate PDF report
2. **Dark Mode:** Toggle between light/dark themes
3. **Comparison View:** Compare multiple assessments
4. **Real-time Updates:** WebSocket for live data
5. **Filtering:** Advanced filtering across all panels
6. **Search:** Global search functionality
7. **Bookmarks:** Save favorite views
8. **Notifications:** Alert for critical issues

---

## Success Criteria

✅ All 4 panels display correctly
✅ Data fetched from API successfully
✅ Responsive on mobile, tablet, desktop
✅ Charts render properly with Recharts
✅ Color coding reflects risk levels accurately
✅ Error handling works gracefully
✅ Loading states provide good UX
✅ Accessible (keyboard navigation, screen readers)
✅ Performance: < 2s initial load time

---

## Notes

- API must be running on `http://localhost:3000` before starting dashboard
- Use `npm run dev` for development with hot reload
- Build for production with `npm run build`
- Preview production build with `npm run preview`

---

**Plan Status:** ✅ Complete - Ready for Implementation