# Dashboard Sidebar Layout Fix

**Date:** 2026-03-12
**Branch:** aksidharth
**File:** `src/pages/Dashboard/index.jsx`

## Problem

The right sidebar (calendar + doctor list) uses `width` with `vw`-based values (e.g. `40vw`, `38vw`, `28vw`). Since `vw` = full viewport width including the left nav (~175px), the total layout overflows and clips the calendar and doctor list off the right edge.

Additionally, the sidebar starts open by default (`useState(true)`), which is not the desired initial state.

## Solution

### Change 1: vw → flex percentages

Replace `width` vw-values on the right sidebar `Box` with `flex` percentage values. Percentages in flex are relative to the flex container's available space (after the nav), not the full viewport.

**Right sidebar `Box`:**
- Change `width: { xs: "100%", sm: "90vw", md: isSidebarOpen ? "40vw" : "0px", ... }` to `flex` values
- Open: `flex: "0 0 35%"` (md), `"0 0 32%"` (lg), `"0 0 28%"` (xl)
- Closed: `flex: "0 0 0%"` — collapses fully, left content fills screen
- Add `minWidth: 0` on the right sidebar Box — required so the flex child can shrink below its content size to `0%`
- Change `transition: "width 0.3s ease"` → `transition: "flex 0.3s ease"` so the open/close animation still works
- `overflow: "hidden"` stays — already present, required for collapse animation
- `p: isSidebarOpen ? { xs: 2, sm: 3 } : 0` conditional padding — unchanged, left as-is

**Left content `Box`:**
- Remove the conditional `width: isSidebarOpen ? { md: "75%", lg: "70%" } : "100%"` — this fought against `flex: 1`. With it removed, `flex: 1` naturally fills all remaining space
- Add `minWidth: 0` — prevents wide content (e.g. `AppointmentsTable`) from overflowing the flex boundary
- `transition: "all 0.3s ease"` — intentionally left unchanged, harmless with `flex: 1`

**Toggle button `right` position:**
- Current: `right: isSidebarOpen ? { md: "30%", lg: "32%", xl: "30%" } : 0`
- Updated: `right: isSidebarOpen ? { md: "35%", lg: "32%", xl: "28%" } : 0`
- These values mirror the new sidebar flex percentages exactly (md: 35%, lg: 32%, xl: 28%) so the button always sits flush at the left edge of the sidebar regardless of breakpoint

### Change 2: Sidebar starts minimized

- `useState(true)` → `useState(false)`

## Known Limitations / Out of Scope

- **`sm: "90vw"`** — The sidebar still uses `90vw` at the `sm` breakpoint (small tablets in column layout). This is a pre-existing issue and is explicitly out of scope for this fix.
- **Toggle button chevron direction** — Currently `<ChevronRightIcon />` when open and `<ChevronLeftIcon />` when closed. This is counterintuitive for a right sidebar but is a pre-existing UX issue, out of scope.

## Scope

- 1 file: `src/pages/Dashboard/index.jsx`
- No backend changes
- No other frontend files affected

## Success Criteria

- Calendar columns no longer clipped on md/lg/xl screens
- Sidebar closed on initial page load
- Toggle open/close still animates smoothly (`flex` transition)
- Build passes with 0 errors
