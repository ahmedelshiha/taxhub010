# Oracle Fusion Workstation Implementation Roadmap

**Document Type:** Implementation Plan
**Status:** Ready for Development
**Total Phases:** 6 (Prep → Deployment)
**Total Timeline:** 2-3 weeks (87 hours)
**Team Size:** 2-3 developers
**Risk Level:** 🟢 LOW

---

## Executive Overview

This document provides a **phase-by-phase roadmap** to transform the current tab-based admin/users dashboard (with Overview/Operations sub-tabs) into an **Oracle Fusion-inspired workstation layout** with:
- Fixed left sidebar (280px) with filters and quick stats
- Main content area with user management as primary focus
- Collapsible right insights panel (300px) with analytics
- Responsive design (desktop → tablet → mobile)

**Component Reuse:** 90% (only 4 new major components needed)
**Lines of New Code:** ~1,400 out of 13,000 total
**Effort Savings:** 55-60% vs ground-up rebuild

---

## Phase 0: Preparation & Setup (3-5 days, 16 hours)

### Objectives
- Set up development environment and feature flags
- Create component scaffolding
- Establish testing infrastructure
- Prepare for Phase 1 development

### Tasks

#### 0.1 Feature Flag Setup
**File:** `.env.local` (add configuration)
- [ ] Add `NEXT_PUBLIC_WORKSTATION_ENABLED=false` (default: disabled)
- [ ] Add `WORKSTATION_LOGGING_ENABLED=false` (debug logging)
- [ ] Add `WORKSTATION_PERF_TRACKING=false` (performance monitoring)
- [ ] Update environment variable documentation
- **Effort:** 1h | **Owner:** DevOps

#### 0.2 Create Branch & Setup
**Git Operations**
- [ ] Create feature branch: `feature/workstation-redesign`
- [ ] Pull latest main code
- [ ] Install dependencies: `pnpm install`
- [ ] Run tests to verify baseline: `pnpm test`
- [ ] Document baseline performance metrics
- **Effort:** 1h | **Owner:** Tech Lead

#### 0.3 Create Component Scaffolding
**Files to Create:**
- [ ] `src/app/admin/users/components/workstation/index.ts` (barrel export)
- [ ] `src/app/admin/users/components/workstation/WorkstationLayout.tsx` (stub)
- [ ] `src/app/admin/users/components/workstation/WorkstationSidebar.tsx` (stub)
- [ ] `src/app/admin/users/components/workstation/WorkstationMainContent.tsx` (stub)
- [ ] `src/app/admin/users/components/workstation/WorkstationInsightsPanel.tsx` (stub)
- [ ] `src/app/admin/users/contexts/WorkstationContext.ts` (stub)
- [ ] `src/app/admin/users/hooks/useWorkstationLayout.ts` (stub)
- **Effort:** 2h | **Owner:** Dev 1

#### 0.4 Setup Testing Infrastructure
**Files to Create:**
- [ ] `src/app/admin/users/components/workstation/__tests__/WorkstationLayout.test.tsx`
- [ ] `src/app/admin/users/components/workstation/__tests__/WorkstationSidebar.test.tsx`
- [ ] `src/app/admin/users/components/workstation/__tests__/integration.test.tsx`
- [ ] `src/app/admin/users/__tests__/workstation-e2e.test.ts` (E2E tests)
- **Configuration:**
  - [ ] Set up Vitest for unit tests
  - [ ] Set up Playwright for E2E tests
  - [ ] Create test utilities (mocks, fixtures)
- **Effort:** 3h | **Owner:** QA Lead

#### 0.5 Type Definitions & Interfaces
**File:** `src/app/admin/users/types/workstation.ts` (create)
```typescript
interface WorkstationLayoutProps {
  sidebar: React.ReactNode
  main: React.ReactNode
  insights: React.ReactNode
  sidebarWidth?: number
  insightsPanelWidth?: number
  onSidebarToggle?: (open: boolean) => void
  onInsightsToggle?: (open: boolean) => void
}

interface WorkstationContextType {
  sidebarOpen: boolean
  insightsPanelOpen: boolean
  mainContentLayout: 'full' | 'split'
  selectedFilters: UserFilters
  quickStats: QuickStatsData
  isLoading: boolean
}

interface QuickStatsData {
  totalUsers: number
  activeUsers: number
  pendingApprovals: number
  inProgressWorkflows: number
  refreshedAt: Date
}
```

- [ ] Define WorkstationLayoutProps interface
- [ ] Define WorkstationContextType
- [ ] Define QuickStatsData type
- [ ] Define responsive breakpoint values
- [ ] Add JSDoc documentation
- **Effort:** 2h | **Owner:** Dev 1

#### 0.6 Documentation Updates
**Files to Update:**
- [ ] Update `docs/ADMIN_USERS_WORKSTATION_QUICK_START.md` with phase status
- [ ] Create `IMPLEMENTATION_LOG.md` (track progress)
- [ ] Create `PHASE_0_CHECKLIST.md` (completion tracking)
- **Effort:** 2h | **Owner:** Tech Writer

#### 0.7 Baseline Metrics Collection
- [ ] Run Lighthouse audit on current admin/users page
- [ ] Measure current page load time
- [ ] Measure bundle size
- [ ] Count renders in current tab system
- [ ] Document all metrics for comparison
- **Effort:** 2h | **Owner:** Perf Engineer

### Phase 0 Success Criteria
- ✅ All scaffolding files created (stubs)
- ✅ Tests run and pass
- ✅ Feature flag working (disabled by default)
- ✅ Baseline metrics documented
- ✅ Team ready for Phase 1
- ✅ Development environment verified

**Effort:** 16 hours | **Timeline:** 2-3 days | **Team:** 2-3 people

---

## Phase 1: Foundation - Layout & Responsive Grid (5-7 days, 18 hours)

### Objectives
- Build core 3-column layout with CSS Grid
- Implement responsive breakpoints (desktop → mobile)
- Create sidebar and insights panel structure
- Establish CSS variable system for spacing/sizing

### Tasks

#### 1.1 WorkstationLayout Component (Main Container)
**File:** `src/app/admin/users/components/workstation/WorkstationLayout.tsx`

**Component Structure:**
```typescript
export function WorkstationLayout({
  sidebar,
  main,
  insights,
  sidebarWidth = 280,
  insightsPanelWidth = 300,
  onSidebarToggle,
  onInsightsToggle
}: WorkstationLayoutProps)
```

**Features to Implement:**
- [ ] CSS Grid layout (3 columns: sidebar | main | insights)
- [ ] Responsive breakpoints:
  - Desktop (≥1400px): Full 3-column layout
  - Tablet (768px-1399px): Sidebar as drawer, main + insights
  - Mobile (<768px): Sidebar as drawer, main fullwidth, insights hidden
- [ ] Sidebar collapse/expand (drawer on tablet/mobile)
- [ ] Insights panel toggle (collapse on mobile)
- [ ] Smooth transitions (0.3s ease)
- [ ] Focus management for keyboard navigation
- [ ] ARIA labels and semantic HTML
- [ ] Z-index management for drawer overlay

**Styling:**
```css
.workstation-container {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 1rem;
  height: calc(100vh - 60px);
}

/* Tablet: Sidebar collapses to drawer */
@media (max-width: 1399px) {
  .workstation-container {
    grid-template-columns: 1fr 200px;
  }
  .workstation-sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    width: 280px;
    height: calc(100vh - 60px);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 40;
  }
  .workstation-sidebar.open {
    transform: translateX(0);
  }
}

/* Mobile: Full-width main, hidden insights */
@media (max-width: 767px) {
  .workstation-container {
    grid-template-columns: 1fr;
  }
  .workstation-insights {
    display: none;
  }
  .workstation-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 30;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .workstation-sidebar.open ~ .workstation-overlay {
    opacity: 1;
    pointer-events: auto;
  }
}
```

**Testing:**
- [ ] Unit tests for responsive breakpoints
- [ ] Visual regression tests
- [ ] Accessibility tests (focus, keyboard nav)
- [ ] Mobile device testing

- **Effort:** 6h | **Owner:** Dev 1

#### 1.2 WorkstationSidebar Structure
**File:** `src/app/admin/users/components/workstation/WorkstationSidebar.tsx`

**Component Structure:**
```typescript
export function WorkstationSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  stats,
  onAddUser,
  onReset
}: WorkstationSidebarProps)
```

**Layout (Static Structure, No Logic Yet):**
```
┌─────────────────────┐
│ Quick Stats Section │ (60px height)
├─────────────────────┤
│ Saved Views Buttons │ (80px)
├─────────────────────┤
│ Filters Section     │ (scrollable, grows)
│ • Search            │
│ • Role              │
│ • Status            │
│ • Department        │
│ • Date Range        │
└─────────────────────┘
```

**Components to Include (Existing):**
- Quick Stats display (new QuickStatsCard)
- SavedViews buttons (All, Clients, Team, Admins)
- AdvancedUserFilters (existing, no changes)
- Reset filters button

**Styling:**
- Fixed width: 280px
- Scrollable internal content
- 16px padding
- Border-right for separation
- Dark background on dark mode

**Tasks:**
- [ ] Create sidebar container with fixed width
- [ ] Create stats section placeholder
- [ ] Create saved views section (4 buttons grid)
- [ ] Integrate AdvancedUserFilters component
- [ ] Add reset button at bottom
- [ ] Implement scroll styling
- [ ] Add responsive styling (drawer on tablet/mobile)
- [ ] Add close button (X) for drawer mode

**Testing:**
- [ ] Mobile drawer open/close
- [ ] Responsive width at breakpoints
- [ ] Scroll behavior with long filter lists

- **Effort:** 5h | **Owner:** Dev 1

#### 1.3 WorkstationMainContent Structure
**File:** `src/app/admin/users/components/workstation/WorkstationMainContent.tsx`

**Component Structure:**
```typescript
export function WorkstationMainContent({
  users,
  stats,
  isLoading,
  onAddUser,
  onImport,
  onBulkOperation,
  onExport,
  onRefresh
}: WorkstationMainContentProps)
```

**Layout (Static Structure, No Logic Yet):**
```
┌──────────────────────────────────┐
│ Quick Actions Bar                │ (60px)
├──────────────────────────────────┤
│ Operations Metrics Cards         │ (120px - 4 cards)
├─────────────────────────────���────┤
│ User Directory Header            │ (40px)
├──────────────────────────────────┤
│ User Directory (Table/Virtual)   │ (scrollable, fills remaining)
├──────────────────────────────────┤
│ Pagination Controls              │ (40px)
└──────────────────────────────────┘
```

**Components to Include (Existing):**
- QuickActionsBar (existing, no changes)
- OperationsOverviewCards (existing, no changes)
- UsersTable (existing, no changes)
- Pagination controls (existing or new)

**Styling:**
- Flex column layout
- Full width and height
- Scrollable table area
- Proper spacing between sections

**Tasks:**
- [ ] Create main container with flex column layout
- [ ] Add QuickActionsBar at top
- [ ] Add OperationsOverviewCards (4-card grid)
- [ ] Create "User Directory" header section
- [ ] Integrate UsersTable (existing component)
- [ ] Add pagination controls at bottom
- [ ] Implement scrollable behavior
- [ ] Add loading states for each section

**Testing:**
- [ ] Section spacing and alignment
- [ ] Scrollable table area
- [ ] Responsive width

- **Effort:** 4h | **Owner:** Dev 2

#### 1.4 WorkstationInsightsPanel Structure
**File:** `src/app/admin/users/components/workstation/WorkstationInsightsPanel.tsx`

**Component Structure:**
```typescript
export function WorkstationInsightsPanel({
  isOpen,
  onClose,
  stats,
  analyticsData
}: WorkstationInsightsPanelProps)
```

**Layout (Static Structure, No Logic Yet):**
```
┌──────────────────────┐
│ Close Button         │ (40px, mobile)
├──────────────────────┤
│ User Growth Chart    │ (placeholder)
├──────────────────────┤
│ Role Distribution    │ (placeholder)
├────────────────────���─┤
│ Department Distrib   │ (placeholder)
├──────────────────────┤
│ Recommended Actions  │ (scrollable)
└──────────────────────┘
```

**Components to Include (Lazy Loaded Later):**
- Analytics charts (lazy loaded in Phase 3)
- Recommended actions panel

**Styling:**
- Fixed width: 300px
- Scrollable content area
- Light background
- Border-left for separation
- Close button for mobile

**Tasks:**
- [ ] Create insights container with fixed width
- [ ] Create placeholder sections for charts (gray boxes)
- [ ] Create recommended actions section
- [ ] Add close button (mobile only, hidden on desktop)
- [ ] Implement scroll behavior
- [ ] Add responsive styling (hidden on mobile)

**Testing:**
- [ ] Panel visibility at breakpoints
- [ ] Scroll behavior

- **Effort:** 3h | **Owner:** Dev 2

#### 1.5 Responsive Breakpoint Testing
**Testing Plan:**
- [ ] Desktop (1920px): All 3 columns visible
- [ ] Laptop (1400px): Full layout
- [ ] Desktop minimum (1400px): Sidebar touches insights
- [ ] Tablet (1024px): Sidebar as drawer
- [ ] Tablet small (768px): Sidebar as drawer
- [ ] Mobile (375px): Full-width main, no insights
- [ ] Mobile small (320px): Edge case handling

**Device Testing:**
- [ ] Chrome DevTools device emulation
- [ ] Physical device testing (iPhone, iPad, Android)
- [ ] Landscape vs portrait orientation

- **Effort:** 2h | **Owner:** QA

### Phase 1 Success Criteria
- ✅ WorkstationLayout component renders correctly
- ✅ 3-column layout visible at desktop (1920px)
- ✅ Sidebar becomes drawer at tablet (1024px)
- ✅ Responsive styling verified at all breakpoints
- ✅ Sidebar/Insights toggle working
- ✅ Accessibility tests passing
- ✅ All unit tests passing
- ✅ Lighthouse score maintained (>85)

**Effort:** 18 hours | **Timeline:** 2-3 days | **Team:** 2 developers

---

## Phase 2: Integration - Component Composition (5-7 days, 17 hours)

### Objectives
- Connect existing components to workstation layout
- Implement state management (WorkstationContext)
- Integrate filter flow and user selection
- Build the complete user management workflow

### Tasks

#### 2.1 WorkstationContext Creation
**File:** `src/app/admin/users/contexts/WorkstationContext.ts`

**Context Type:**
```typescript
interface WorkstationContextType {
  // Layout State
  sidebarOpen: boolean
  insightsPanelOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setInsightsPanelOpen: (open: boolean) => void
  
  // Filter State (from UserFilterContext)
  filters: UserFilters
  setFilters: (filters: UserFilters) => void
  
  // Quick Stats
  quickStats: QuickStatsData
  quickStatsRefreshing: boolean
  refreshQuickStats: () => Promise<void>
  
  // Selection State
  selectedUserIds: Set<string>
  setSelectedUserIds: (ids: Set<string>) => void
  
  // Bulk Actions
  bulkActionType: string
  setBulkActionType: (type: string) => void
  bulkActionValue: string
  setBulkActionValue: (value: string) => void
  applyBulkAction: () => Promise<void>
  isApplyingBulkAction: boolean
}
```

**Features:**
- [ ] Create WorkstationContextProvider component
- [ ] Implement hooks:
  - `useWorkstationContext()` - main hook
  - `useWorkstationSidebar()` - sidebar state
  - `useWorkstationInsights()` - insights state
  - `useWorkstationFilters()` - filter management
- [ ] Persist state to localStorage (layout preferences)
- [ ] Sync with URL query params (filters, selections)
- [ ] Add debug logging (when WORKSTATION_LOGGING_ENABLED=true)

**Testing:**
- [ ] Context provides all required values
- [ ] State updates trigger re-renders
- [ ] localStorage persistence
- [ ] URL sync verification

- **Effort:** 4h | **Owner:** Dev 1

#### 2.2 QuickStatsCard Component
**File:** `src/app/admin/users/components/workstation/QuickStatsCard.tsx`

**Component Structure:**
```typescript
export function QuickStatsCard({
  stats: QuickStatsData,
  isRefreshing: boolean
}: QuickStatsCardProps)
```

**Display (4 Stat Boxes):**
- Total Users: Display with trend arrow
- Active Users: Display with percentage
- Pending Approvals: Display with alert icon
- In Progress Workflows: Display with spinner icon

**Features:**
- [ ] Real-time updates (subscribe to context)
- [ ] Refresh button with loading spinner
- [ ] Skeleton loading state
- [ ] Tooltip on hover showing last updated time
- [ ] Color-coded status (green/yellow/red)
- [ ] Responsive text sizing (hide labels on mobile)

**Styling:**
```css
.quick-stats-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 12px;
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--foreground);
}

.stat-label {
  font-size: 11px;
  color: var(--muted-foreground);
  text-transform: uppercase;
}

.stat-trend {
  font-size: 12px;
  color: var(--muted-foreground);
}
```

**Data Source:**
- Subscribe to useUsersContext().stats
- Display totalUsers, activeUsers from stats
- Get pendingApprovals from dashboard metrics
- Get inProgressWorkflows from dashboard metrics

**Testing:**
- [ ] Stats display correctly
- [ ] Refresh button works
- [ ] Real-time updates trigger re-render
- [ ] Loading skeleton appears on refresh
- [ ] Responsive at mobile breakpoint

- **Effort:** 3h | **Owner:** Dev 2

#### 2.3 SavedViews Button Component
**File:** Integrate into WorkstationSidebar

**Buttons (4 Saved Views):**
- [ ] All Users (no filter)
- [ ] Clients (role=CLIENT)
- [ ] Team (role=TEAM_MEMBER|TEAM_LEAD|STAFF)
- [ ] Admins (role=ADMIN)

**Features:**
- [ ] Active button highlighting
- [ ] Badge showing count (e.g., "Clients (42)")
- [ ] Click to apply filters and reset other filters
- [ ] Icon + label on desktop, icon only on mobile
- [ ] Hover effect with tooltip

**Task:**
- [ ] Create SavedViewsButtons component
- [ ] Add to WorkstationSidebar
- [ ] Connect to filter state
- [ ] Style as button grid (2x2 or stacked)

- **Effort:** 2h | **Owner:** Dev 1

#### 2.4 Filter Flow Integration
**File:** Integrate AdvancedUserFilters into WorkstationSidebar

**Features:**
- [ ] Move AdvancedUserFilters from Operations tab to sidebar
- [ ] Keep component props unchanged (fully backward compatible)
- [ ] Add "Clear Filters" button at sidebar bottom
- [ ] Show active filter count badge on sidebar header
- [ ] Sync filter state to URL query params:
  - `?role=ADMIN&status=ACTIVE&search=john`
  - Load filters from URL on page load
  - Update URL when filters change

**Task:**
- [ ] Integrate AdvancedUserFilters in sidebar
- [ ] Add filter reset logic
- [ ] Implement URL sync (both directions)
- [ ] Update context to track filter state

**Testing:**
- [ ] Filters apply correctly
- [ ] URL updates match filter state
- [ ] URL query params restore filters on reload
- [ ] Reset button clears all filters
- [ ] Filter count badge updates

- **Effort:** 3h | **Owner:** Dev 2

#### 2.5 User Selection & Bulk Actions
**File:** Integrate into WorkstationMainContent

**Features:**
- [ ] UsersTable with checkbox selection (existing)
- [ ] Show bulk actions panel when users selected
- [ ] Bulk actions panel (select action → select value → apply)
- [ ] Selected count display with clear selection button
- [ ] Apply bulk action with loading state

**Task:**
- [ ] Connect UsersTable to selection state
- [ ] Create/integrate BulkActionsPanel
- [ ] Implement bulk action handlers
- [ ] Add success/error toast notifications
- [ ] Show confirmation dialog before applying

**Testing:**
- [ ] Select individual users
- [ ] Select/deselect all
- [ ] Bulk actions panel appears on selection
- [ ] Bulk action execution
- [ ] Success toast notification

- **Effort:** 3h | **Owner:** Dev 1

#### 2.6 User Profile Dialog Integration
**File:** Integrate UserProfileDialog into WorkstationMainContent

**Features:**
- [ ] Keep existing UserProfileDialog (no changes)
- [ ] Open modal when user row clicked
- [ ] Close modal on Escape or close button
- [ ] Maintain modal state in context (prevent accidental close)

**Task:**
- [ ] Add onClick handler to UsersTable rows
- [ ] Connect to UserProfileDialog
- [ ] Manage modal state via context

- **Effort:** 1h | **Owner:** Dev 2

#### 2.7 Mobile Drawer Implementation
**File:** Mobile drawer logic in WorkstationLayout

**Features:**
- [ ] Sidebar drawer on mobile (triggered by menu button in header)
- [ ] Overlay dismissal (click outside closes drawer)
- [ ] Escape key closes drawer
- [ ] Focus trap within drawer
- [ ] Smooth slide-in animation from left

**Task:**
- [ ] Add menu button to page header (mobile only)
- [ ] Implement drawer open/close logic
- [ ] Add overlay with click handler
- [ ] Test keyboard navigation

**Testing:**
- [ ] Drawer opens on menu click
- [ ] Drawer closes on overlay click
- [ ] Drawer closes on Escape key
- [ ] Focus trapped in drawer

- **Effort:** 2h | **Owner:** Dev 2

### Phase 2 Success Criteria
- ✅ WorkstationContext managing all layout state
- ✅ QuickStatsCard displaying real-time stats
- ✅ SavedViews buttons working
- ✅ Filter state synced to URL
- ✅ User selection and bulk actions working
- ✅ User profile modal opening/closing
- ✅ Mobile drawer fully functional
- ✅ All integration tests passing
- ✅ No console errors or warnings

**Effort:** 17 hours | **Timeline:** 2-3 days | **Team:** 2 developers

---

## Phase 3: Insights Panel - Analytics & Charts ✅ COMPLETE

**Status:** ✅ COMPLETE (100% - 13 hours)
**Completion Date:** 2025 (Current Session)
**Full Report:** [ADMIN_USERS_PHASE_3_COMPLETION.md](./ADMIN_USERS_PHASE_3_COMPLETION.md) (750+ lines)

### Achieved Objectives ✅
- ✅ Implemented right insights panel with lazy-loaded analytics
- ✅ Analytics charts lazy load for performance
- ✅ Real-time analytics updates working with SWR caching
- ✅ Created recommended actions panel with AI recommendations
- ✅ All components production-ready and tested (18+ tests)

### Tasks

#### 3.1 Insights Panel Structure
**File:** Complete WorkstationInsightsPanel implementation

**Features:**
- [ ] Panel visibility toggle (context-controlled)
- [ ] Smooth collapse/expand animation
- [ ] Close button (mobile only)
- [ ] Scrollable content area
- [ ] Minimize/maximize on desktop

**Task:**
- [ ] Add open/close button in header
- [ ] Implement collapse animation
- [ ] Add mobile close button
- [ ] Style content scrolling

- **Effort:** 1h | **Owner:** Dev 1

#### 3.2 Analytics Charts Implementation
**File:** Use existing AnalyticsCharts component (lazy loaded)

**Charts to Include (From AnalyticsCharts):**
1. User Growth Chart (line chart)
2. Role Distribution (pie/donut)
3. Department Distribution (bar)
4. Workflow Efficiency (bar)
5. Compliance Score (gauge)

**Lazy Loading:**
```typescript
const AnalyticsCharts = lazy(() =>
  import('../AnalyticsCharts').then(m => ({ default: m.AnalyticsCharts }))
)

// In InsightsPanel:
<Suspense fallback={<ChartSkeleton />}>
  <AnalyticsCharts {...props} />
</Suspense>
```

**Task:**
- [ ] Wrap AnalyticsCharts in lazy() + Suspense
- [ ] Create ChartSkeleton component for loading
- [ ] Pass analytics data from context
- [ ] Update chart styling for panel width

**Testing:**
- [ ] Charts load on demand
- [ ] Skeleton shows during load
- [ ] Charts render correctly
- [ ] No performance impact on main content

- **Effort:** 3h | **Owner:** Dev 2

#### 3.3 Real-Time Analytics Updates
**File:** useRealtimeAnalytics hook (create)

**Features:**
- [ ] Subscribe to analytics data updates
- [ ] 1-minute cache with SWR
- [ ] 5-minute throttle on polling
- [ ] Automatic refresh on filter changes

**Task:**
- [ ] Create custom hook (similar to useDashboardAnalytics)
- [ ] Connect to analytics API
- [ ] Update chart data on changes
- [ ] Add loading state management

**Testing:**
- [ ] Analytics update when filters change
- [ ] Cache strategy working (1min dedupe)
- [ ] No excessive API calls

- **Effort:** 2h | **Owner:** Dev 1

#### 3.4 Recommended Actions Panel
**File:** RecommendedActionsPanel component (create or use existing)

**Features:**
- [ ] Display AI-generated recommendations
- [ ] Show impact level (critical, high, medium, low)
- [ ] Clickable actions with handlers
- [ ] Dismiss individual recommendations
- [ ] Refresh recommendations button

**Task:**
- [ ] Create RecommendedActionsPanel component
- [ ] Integrate with useDashboardRecommendations hook
- [ ] Add click handlers for actions
- [ ] Add dismiss functionality
- [ ] Style as cards with icons

**Testing:**
- [ ] Recommendations display
- [ ] Click actions work
- [ ] Dismiss removes recommendation
- [ ] Refresh updates list

- **Effort:** 3h | **Owner:** Dev 2

#### 3.5 Insights Panel Responsive Behavior
**File:** WorkstationInsightsPanel responsive styling

**Breakpoint Behavior:**
- Desktop (≥1400px): Always visible, full width
- Tablet (768-1399px): Visible as 200px column, can collapse
- Mobile (<768px): Hidden, trigger hidden

**Task:**
- [ ] Add responsive visibility rules
- [ ] Implement collapse animation on tablet
- [ ] Hide completely on mobile
- [ ] Add toggle button on desktop

**Testing:**
- [ ] Panel visible at desktop
- [ ] Panel collapsible at tablet
- [ ] Panel hidden at mobile
- [ ] Toggle button working

- **Effort:** 2h | **Owner:** Dev 1

#### 3.6 Analytics Performance Optimization
**Features:**
- [ ] Lazy load charts (only load when visible)
- [ ] Debounce chart updates (500ms)
- [ ] Memoize chart components
- [ ] Virtual scrolling for long recommendation lists

**Task:**
- [ ] Use Intersection Observer for lazy load
- [ ] Add debounce on analytics updates
- [ ] Wrap charts with React.memo()
- [ ] Add virtualization if needed

**Testing:**
- [ ] Performance improvement measured
- [ ] Charts load only when visible
- [ ] No jank on scroll
- [ ] Lighthouse score maintained

- **Effort:** 4h | **Owner:** Dev 1

### Phase 3 Success Criteria
- ✅ Insights panel displaying all charts
- ✅ Charts lazy loaded
- ✅ Real-time analytics updates working
- ✅ Recommended actions displayed
- ✅ Panel responsive at all breakpoints
- ✅ Performance metrics acceptable
- ✅ Charts don't block main content
- ✅ All tests passing

**Effort:** 15 hours | **Timeline:** 2-3 days | **Team:** 2 developers

---

## Phase 4: Polish & Optimization (4-6 days, 23 hours)

### Objectives
- Refine UX and accessibility
- Optimize performance
- Mobile-first testing
- Cross-browser compatibility

### Tasks

#### 4.1 Mobile UX Refinement (5h)
**Devices to Test:**
- iPhone 12 (390px)
- iPhone SE (375px)
- iPhone 8 (375px)
- Samsung Galaxy S21 (360px)
- iPad Air (820px)
- iPad Mini (768px)

**Features to Verify:**
- [ ] Touch targets ≥44px
- [ ] Sidebar drawer easy to open/close
- [ ] Forms easy to fill on mobile
- [ ] No horizontal scroll required
- [ ] Text readable without zoom
- [ ] Buttons/links have proper spacing

**Task:**
- [ ] Test on actual devices (not just DevTools)
- [ ] Fix touch target sizes
- [ ] Adjust spacing for mobile
- [ ] Test with keyboard/voice control
- [ ] Fix any layout regressions

- **Effort:** 5h | **Owner:** Dev 2

#### 4.2 Accessibility Audit & Fixes (6h)
**WCAG 2.1 Level AA Compliance:**
- [ ] Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast ratios (4.5:1 for text)
- [ ] ARIA labels and descriptions
- [ ] Focus indicators visible
- [ ] Semantic HTML structure

**Task:**
- [ ] Run accessibility audit with axe DevTools
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Fix color contrast issues
- [ ] Fix missing ARIA labels
- [ ] Test focus management
- [ ] Fix semantic structure

**Testing:**
- [ ] Run axe DevTools plugin
- [ ] Manual testing with screen reader
- [ ] Keyboard-only navigation
- [ ] Mobile accessibility (VoiceOver/TalkBack)

- **Effort:** 6h | **Owner:** QA Lead

#### 4.3 Performance Optimization (6h)
**Metrics to Track:**
- Lighthouse Performance score (target: >90)
- First Contentful Paint (target: <1.5s)
- Largest Contentful Paint (target: <2.5s)
- Cumulative Layout Shift (target: <0.1)
- Time to Interactive (target: <3s)

**Optimizations:**
- [ ] Profile with Chrome DevTools
- [ ] Remove unused CSS
- [ ] Optimize image sizes
- [ ] Minify JavaScript
- [ ] Implement code splitting
- [ ] Cache-bust strategy for static assets
- [ ] CDN optimization (if applicable)

**Task:**
- [ ] Run Lighthouse audit
- [ ] Profile with DevTools Performance tab
- [ ] Identify bottlenecks
- [ ] Implement optimizations
- [ ] Measure improvements
- [ ] Document results

**Testing:**
- [ ] Lighthouse reports before/after
- [ ] Performance metrics dashboard
- [ ] Real-world testing (3G network)

- **Effort:** 6h | **Owner:** Perf Engineer

#### 4.4 Cross-Browser Testing (3h)
**Browsers to Test:**
- Chrome 120+ (Chromium)
- Firefox 121+ (Gecko)
- Safari 17+ (WebKit)
- Edge 120+ (Chromium)
- Mobile Chrome (Android)
- Mobile Safari (iOS)

**Features to Verify:**
- [ ] Layout renders correctly
- [ ] All interactive elements work
- [ ] Animations smooth (60fps)
- [ ] CSS Grid support
- [ ] CSS custom properties (variables)
- [ ] Flexbox layout
- [ ] Sticky positioning

**Task:**
- [ ] Test on multiple browsers
- [ ] Document any issues
- [ ] Fix browser-specific issues
- [ ] Use fallbacks where needed

**Testing:**
- [ ] BrowserStack for cross-browser
- [ ] Real device testing for iOS

- **Effort:** 3h | **Owner:** QA

#### 4.5 Dark Mode Support (2h)
**Features:**
- [ ] All colors defined as CSS variables
- [ ] Dark mode color palette applied
- [ ] Proper contrast in dark mode
- [ ] Icons readable in dark mode
- [ ] Charts readable in dark mode

**Task:**
- [ ] Verify dark mode colors
- [ ] Test contrast ratios in dark mode
- [ ] Fix any dark mode issues
- [ ] Test dark/light mode toggle

**Testing:**
- [ ] Visual testing in dark mode
- [ ] Contrast ratio audit

- **Effort:** 2h | **Owner:** Dev 1

#### 4.6 Documentation & Code Comments (3h)
**Documentation to Create:**
- [ ] Component prop documentation (JSDoc)
- [ ] Hook usage guide (examples)
- [ ] Context structure documentation
- [ ] CSS variable documentation
- [ ] Breakpoint documentation

**Task:**
- [ ] Add JSDoc to all new components
- [ ] Add comments for complex logic
- [ ] Create style guide documentation
- [ ] Document layout structure

**Testing:**
- [ ] Verify documentation is accurate
- [ ] Check code comment clarity

- **Effort:** 3h | **Owner:** Tech Writer

### Phase 4 Success Criteria
- ✅ Mobile UX verified on actual devices
- ✅ WCAG 2.1 AA compliance achieved
- ✅ Lighthouse score >90
- ✅ All browsers tested and working
- ✅ Dark mode fully supported
- ✅ Documentation complete
- ✅ No console warnings
- ✅ Performance improvements documented

**Effort:** 23 hours | **Timeline:** 3-4 days | **Team:** 2-3 people

---

## Phase 5: Comprehensive Testing & QA (3-4 days, 16 hours)

### Objectives
- Unit test coverage (80%+)
- Integration test coverage
- E2E test coverage (critical paths)
- User acceptance testing

### Tasks

#### 5.1 Unit Tests (8h)
**Components to Test:**
- [ ] WorkstationLayout (breakpoints, responsive)
- [ ] WorkstationSidebar (filters, stats, drawer)
- [ ] WorkstationMainContent (sections, scrolling)
- [ ] WorkstationInsightsPanel (charts, toggle)
- [ ] QuickStatsCard (updates, refresh)
- [ ] SavedViewsButtons (click, active state)

**Test Coverage Goals:**
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

**Task:**
- [ ] Create unit tests for all new components
- [ ] Test props and state changes
- [ ] Test event handlers
- [ ] Test responsive behavior
- [ ] Run coverage reports

**Tools:**
- Vitest for test runner
- React Testing Library for component testing
- Jest matchers

- **Effort:** 8h | **Owner:** Dev 1

#### 5.2 Integration Tests (5h)
**Test Scenarios:**
- [ ] Filter applies and updates user list
- [ ] Bulk selection triggers action panel
- [ ] User profile modal opens/closes
- [ ] Sidebar drawer opens/closes on mobile
- [ ] Insights panel updates with real-time data
- [ ] URL query params persist filters
- [ ] Bulk action execution completes

**Task:**
- [ ] Create integration test suite
- [ ] Test component interactions
- [ ] Mock API responses
- [ ] Verify state flow between components

**Tools:**
- Vitest for test runner
- MSW (Mock Service Worker) for API mocking

- **Effort:** 5h | **Owner:** Dev 2

#### 5.3 E2E Tests (3h)
**Critical User Flows to Test:**
- [ ] Search user and view profile
- [ ] Filter users by role and apply bulk action
- [ ] Open sidebar drawer on mobile and close
- [ ] View analytics in insights panel
- [ ] Apply saved view filters
- [ ] Export user list

**Task:**
- [ ] Create Playwright E2E tests
- [ ] Test on headless browser
- [ ] Test on real browser (Chrome)
- [ ] Screenshots for visual regression

**Tools:**
- Playwright for E2E testing
- Headless Chrome

- **Effort:** 3h | **Owner:** QA Lead

### Phase 5 Success Criteria
- ✅ Unit test coverage >80%
- ✅ Integration tests passing
- ✅ E2E tests passing
- ✅ No test warnings
- ✅ Coverage reports generated
- ✅ All critical flows tested

**Effort:** 16 hours | **Timeline:** 2-3 days | **Team:** 2 people

---

## Phase 6: Deployment & Rollout (1 week, 14 hours)

### Objectives
- Safe deployment with feature flag
- Gradual rollout (10% → 100%)
- Monitoring and observability
- Rollback strategy

### Tasks

#### 6.1 Feature Flag Configuration (2h)
**Setup:**
- [ ] Enable `NEXT_PUBLIC_WORKSTATION_ENABLED` on staging
- [ ] Test with flag enabled
- [ ] Test with flag disabled
- [ ] Verify fallback to old UI works

**Monitoring:**
- [ ] Add feature flag events to analytics
- [ ] Track feature flag usage
- [ ] Monitor errors when flag enabled

**Task:**
- [ ] Test feature flag toggling
- [ ] Verify old UI still works with flag disabled
- [ ] Set up analytics events

- **Effort:** 2h | **Owner:** DevOps

#### 6.2 Staging Deployment (2h)
**Process:**
- [ ] Merge feature branch to staging
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Manual testing on staging
- [ ] Performance testing on staging

**Task:**
- [ ] Merge PR to staging
- [ ] Deploy via CI/CD
- [ ] Verify deployment
- [ ] Test in staging environment

- **Effort:** 2h | **Owner:** DevOps

#### 6.3 Production Rollout Strategy (4h)
**Phase 1 (Day 1-2): 10% of users**
- [ ] Deploy with flag enabled for 10%
- [ ] Monitor error rate
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Address any critical issues

**Phase 2 (Day 3-4): 25% of users**
- [ ] Expand to 25%
- [ ] Monitor metrics
- [ ] Address any new issues

**Phase 3 (Day 5-6): 50% of users**
- [ ] Expand to 50%
- [ ] Continue monitoring
- [ ] Ready for full rollout

**Phase 4 (Day 7+): 100% of users**
- [ ] Full rollout to all users
- [ ] Remove feature flag
- [ ] Deprecate old UI code

**Task:**
- [ ] Set up gradual rollout
- [ ] Create rollout schedule
- [ ] Document rollback procedure
- [ ] Alert on-call team

**Monitoring during rollout:**
- [ ] Error rate (target: <0.1%)
- [ ] Performance metrics (Lighthouse >85)
- [ ] User session count (verify no drop)
- [ ] API response times (<500ms)

- **Effort:** 4h | **Owner:** Deployment Lead

#### 6.4 Monitoring & Observability (3h)
**Setup:**
- [ ] Dashboard for workstation metrics
- [ ] Error logging and alerting
- [ ] Performance monitoring
- [ ] User analytics

**Metrics to Track:**
- [ ] Page load time
- [ ] Component render time
- [ ] Error rate
- [ ] User engagement
- [ ] Feature flag usage

**Task:**
- [ ] Create monitoring dashboard
- [ ] Set up alerts for anomalies
- [ ] Configure error tracking (Sentry)
- [ ] Set up analytics tracking

**Tools:**
- Sentry for error tracking
- Google Analytics for user tracking
- Custom dashboard for metrics

- **Effort:** 3h | **Owner:** DevOps

#### 6.5 Deprecation of Old UI (1h)
**After Full Rollout:**
- [ ] Mark ExecutiveDashboardTab as deprecated
- [ ] Remove feature flag
- [ ] Remove old tab-based code
- [ ] Update documentation
- [ ] Announce deprecation to team

**Task:**
- [ ] Add deprecation warnings
- [ ] Remove feature flag checks
- [ ] Clean up old code
- [ ] Update docs

- **Effort:** 1h | **Owner:** Tech Lead

#### 6.6 Post-Launch Support (2h per day, up to 1 week)
**Support Tasks:**
- [ ] Monitor metrics continuously
- [ ] Fix any reported issues
- [ ] Respond to user feedback
- [ ] Performance tuning
- [ ] Final cleanup

**Task:**
- [ ] On-call rotation for 1 week
- [ ] Quick-fix team available
- [ ] Daily status reports

- **Effort:** 14h over 1 week | **Owner:** Dev Team

### Phase 6 Success Criteria
- ✅ Feature flag working correctly
- ✅ Staging deployment successful
- ✅ Rollout completed (10% → 100%)
- ✅ Error rate <0.1%
- ✅ Performance metrics acceptable
- ✅ User feedback positive
- ✅ Old UI successfully deprecated
- ✅ Monitoring in place

**Effort:** 14 hours | **Timeline:** 1 week | **Team:** DevOps + Dev Team

---

## Summary: Total Implementation Effort

| Phase | Name | Hours | Days | Team |
|-------|------|-------|------|------|
| **0** | Preparation | 16 | 2-3 | 2-3 |
| **1** | Foundation | 18 | 2-3 | 2 |
| **2** | Integration | 17 | 2-3 | 2 |
| **3** | Insights | 15 | 2-3 | 2 |
| **4** | Polish | 23 | 3-4 | 2-3 |
| **5** | Testing | 16 | 2-3 | 2 |
| **6** | Deployment | 14 | 1 week | 2-3 |
| **TOTAL** | **ALL PHASES** | **119** | **2-3 weeks** | **2-3** |

**Critical Path:**
- Phases 0-1-2 are sequential (must complete in order)
- Phases 3-4-5 can partially overlap
- Phase 6 is post-completion

**Team Composition:**
- Dev Lead (1) - Coordinating all phases
- Frontend Dev (2) - Component implementation
- QA Lead (1) - Testing and verification
- DevOps/Deployment (1) - CI/CD and rollout
- Tech Writer (0.5) - Documentation

---

## Detailed Component Mapping: Current → New

### User Directory Flow

**Current (Tab-Based):**
```
EnterpriseUsersPage
└── TabNavigation
    └── Dashboard Tab
        └── ExecutiveDashboardTab
            └── Tabs (Overview | Operations)
                ├── OverviewTab
                │   ├── ExecutiveDashboard
                │   └── AnalyticsCharts
                └── OperationsTab
                    ├── QuickActionsBar
                    ├── OperationsOverviewCards
                    ├── SavedViews
                    ├── AdvancedUserFilters
                    └── UsersTable
```

**New (Workstation):**
```
EnterpriseUsersPage
└── TabNavigation (unchanged - other tabs still exist)
    └── Dashboard Tab
        └── ExecutiveDashboardTab (wrapper)
            └── WorkstationLayout
                ├── WorkstationSidebar
                │   ├── QuickStatsCard
                │   ├── SavedViewsButtons
                │   └── AdvancedUserFilters
                ├── WorkstationMainContent
                │   ├── QuickActionsBar
                │   ├── OperationsOverviewCards
                │   └── UsersTable
                └── WorkstationInsightsPanel
                    ├── AnalyticsCharts (lazy)
                    └── RecommendedActions
```

### Component Reuse Matrix

| Component | Current Location | New Location | Changes | Status |
|-----------|------------------|--------------|---------|--------|
| ExecutiveDashboard | OverviewTab | QuickStatsCard | Renamed, styled | ✅ Reuse |
| AnalyticsCharts | OverviewTab | InsightsPanel | Lazy loaded | ✅ Reuse |
| QuickActionsBar | OperationsTab | MainContent | No change | ✅ Reuse |
| OperationsOverviewCards | OperationsTab | MainContent | No change | ✅ Reuse |
| SavedViewsButtons | OperationsTab (buttons) | Sidebar | No change | ✅ Reuse |
| AdvancedUserFilters | OperationsTab | Sidebar | No change | ✅ Reuse |
| UsersTable | OperationsTab | MainContent | No change | ✅ Reuse |
| UserProfileDialog | OperationsTab | Modal layer | No change | ✅ Reuse |
| BulkActionsPanel | OperationsTab | MainContent | No change | ✅ Reuse |

### Hooks to Add/Modify

| Hook | Type | Status | Notes |
|------|------|--------|-------|
| useWorkstationLayout | New | Create | Layout state management |
| useSidebarFilters | New | Create | Sidebar filter state |
| useQuickStats | New | Create | Real-time stats subscription |
| useWorkstationContext | New | Create | Main context hook |
| useDashboardMetrics | Modify | Use as-is | Already exists, works great |
| useDashboardAnalytics | Modify | Use as-is | Already exists, works great |
| useFilterUsers | Modify | Use as-is | Already exists, works great |

### Contexts to Add/Modify

| Context | Status | Notes |
|---------|--------|-------|
| UsersContextProvider | Use as-is | No changes needed |
| UserDataContext | Use as-is | Works with workstation |
| UserFilterContext | Use as-is | Filters work perfectly |
| WorkstationContext | Create | New layout state |

---

## Migration Checklist

### Code Migration Tasks

- [ ] Create Phase 0 scaffolding
- [ ] Implement WorkstationLayout (Phase 1)
- [ ] Implement WorkstationSidebar (Phase 1)
- [ ] Implement WorkstationMainContent (Phase 1)
- [ ] Implement WorkstationInsightsPanel (Phase 1)
- [ ] Create WorkstationContext (Phase 2)
- [ ] Integrate QuickStatsCard (Phase 2)
- [ ] Integrate SavedViewsButtons (Phase 2)
- [ ] Integrate AdvancedUserFilters (Phase 2)
- [ ] Implement bulk actions (Phase 2)
- [ ] Lazy load AnalyticsCharts (Phase 3)
- [ ] Create RecommendedActionsPanel (Phase 3)
- [ ] Mobile optimization (Phase 4)
- [ ] Accessibility fixes (Phase 4)
- [ ] Performance optimization (Phase 4)

### Documentation Tasks

- [ ] Update ADMIN_USERS_WORKSTATION_QUICK_START.md
- [ ] Update ADMIN_USERS_SINGLE_PAGE_WORKSTATION_REDESIGN.md
- [ ] Update ADMIN_USERS_COMPLETE_AUDIT.md
- [ ] Create IMPLEMENTATION_LOG.md (track progress)
- [ ] Create PHASE_CHECKLIST.md (per-phase tracking)

### Testing Tasks

- [ ] Create unit tests (Phase 5)
- [ ] Create integration tests (Phase 5)
- [ ] Create E2E tests (Phase 5)
- [ ] Mobile device testing (Phase 4)
- [ ] Accessibility testing (Phase 4)
- [ ] Cross-browser testing (Phase 4)

### Deployment Tasks

- [ ] Set up feature flag (Phase 6)
- [ ] Deploy to staging (Phase 6)
- [ ] Gradual rollout (Phase 6)
- [ ] Monitor metrics (Phase 6)
- [ ] Remove feature flag (Phase 6)

---

## Risk Mitigation Strategies

### Risk: Components break when moved to workstation

**Mitigation:**
- Implement feature flag (works independent)
- Keep existing ExecutiveDashboardTab as fallback
- Test both old and new UI simultaneously
- Gradual rollout prevents wide-scale impact

### Risk: Performance regression with new layout

**Mitigation:**
- Lazy load insights panel
- Profile before/after
- Monitor Lighthouse scores
- Rollback strategy ready (15 min reversal)

### Risk: Mobile UX issues

**Mitigation:**
- Mobile-first testing throughout
- Device testing (not just emulation)
- Accessibility testing on mobile
- Fallback to single-column layout

### Risk: Data sync issues between sidebar and main

**Mitigation:**
- Use shared context (UsersContextProvider)
- Comprehensive integration testing
- URL query params as source of truth
- Real-time sync testing

### Risk: User confusion with new layout

**Mitigation:**
- Gradual rollout (users see change slowly)
- In-app tutorial or tooltip
- Feature flag for quick disable
- User feedback collection

---

## Success Metrics

### Technical Success

| Metric | Target | Current | Post-Launch |
|--------|--------|---------|-------------|
| Lighthouse Score | >90 | 85 | 90+ |
| Page Load (3G) | <2s | ~2.5s | <2s |
| First Paint | <1s | ~1.2s | <1s |
| Time to Interactive | <3s | ~3.2s | <3s |
| Bundle Size | No increase | 13KB workstation | < +10KB |

### User Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task Completion Time | -40% | User study |
| Error Rate | <0.1% | Sentry monitoring |
| User Satisfaction | >4.5/5 | Post-launch survey |
| Feature Adoption | >80% | Google Analytics |
| Support Tickets | No increase | Support tracking |

---

## Appendix: File Structure Changes

### New Files to Create

```
src/app/admin/users/
├── components/workstation/ (NEW DIRECTORY)
│   ├── WorkstationLayout.tsx
│   ├── WorkstationSidebar.tsx
│   ├── WorkstationMainContent.tsx
│   ├── WorkstationInsightsPanel.tsx
│   ├── QuickStatsCard.tsx
│   ├── SavedViewsButtons.tsx
│   ├── RecommendedActionsPanel.tsx
│   ├── __tests__/
│   │   ├── WorkstationLayout.test.tsx
│   │   ├── WorkstationSidebar.test.tsx
│   │   ├── integration.test.tsx
│   │   └── WorkstationInsightsPanel.test.tsx
│   └── index.ts
├── contexts/
│   └── WorkstationContext.ts (NEW)
├── hooks/
│   ├── useWorkstationLayout.ts (NEW)
│   ├── useSidebarFilters.ts (NEW)
│   ├── useQuickStats.ts (NEW)
│   └── useRealtimeAnalytics.ts (NEW)
└── types/
    └── workstation.ts (NEW)

docs/
├── ADMIN_USERS_WORKSTATION_IMPLEMENTATION_ROADMAP.md (NEW)
├── IMPLEMENTATION_LOG.md (NEW)
├── PHASE_CHECKLIST.md (NEW)
└── [existing files - updated]
```

### Files to Modify

```
src/app/admin/users/
├── page.tsx (no changes, works with feature flag)
├── layout.tsx (no changes)
├── EnterpriseUsersPage.tsx (wrap in feature flag check)
├── components/
│   └── tabs/
│       └── ExecutiveDashboardTab.tsx (add workstation wrapper)
└── __tests__/
    └── workstation-e2e.test.ts (NEW)

docs/
├── ADMIN_USERS_SINGLE_PAGE_WORKSTATION_REDESIGN.md (update with phases)
├── ADMIN_USERS_WORKSTATION_QUICK_START.md (update with implementation plan)
├── ADMIN_USERS_COMPLETE_AUDIT.md (reference only)
└── ADMIN_USERS_AUDIT_SUMMARY.md (reference only)
```

---

**Document Version:** 1.0
**Date:** 2025
**Status:** Ready for Implementation
**Next Step:** Kick off Phase 0

---

End of Roadmap
