# Left Nav Expand Auto-Closes Right Sidebar

**Date:** 2026-03-12
**Branch:** aksidharth
**Files:** `src/stores/dashboardStore.js`, `src/pages/Dashboard/index.jsx`, `src/pages/Layout/SideBar.jsx`

## Problem

The left nav collapse state (`collapsed` in `SideBar.jsx`) and right sidebar state (`isSidebarOpen` in `Dashboard/index.jsx`) are completely independent local states. When the user expands the left nav (icon-only → full width), the right calendar/doctor sidebar stays open, crowding the layout.

## Desired Behaviour

- Right sidebar open + left nav collapsed → user clicks expand on left nav → right sidebar auto-closes
- Collapsing the left nav → no effect on right sidebar (no auto-open)
- Right sidebar toggle button still works independently

## Solution

Move `isSidebarOpen` from local `useState` in `Dashboard/index.jsx` into the existing `useDashboardStore` Zustand store. Then read that value in `SideBar.jsx`'s `toggleCollapse` to close the right sidebar whenever the left nav expands.

### Change 1 — `src/stores/dashboardStore.js`

Add to the store:
```js
isSidebarOpen: false,
setIsSidebarOpen: (val) => set({ isSidebarOpen: val }),
```

### Change 2 — `src/pages/Dashboard/index.jsx`

- Remove: `const [isSidebarOpen, setIsSidebarOpen] = useState(false);`
- Add: `const { isSidebarOpen, setIsSidebarOpen } = useDashboardStore();`
- Remove the `useState` import if it becomes unused (check first — other state vars may still use it)

### Change 3 — `src/pages/Layout/SideBar.jsx`

- Import `useDashboardStore`
- In `toggleCollapse`:
  ```js
  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapse?.(newState);
    // If expanding (newState === false = full width), close the right sidebar
    if (!newState) {
      useDashboardStore.getState().setIsSidebarOpen(false);
    }
  };
  ```

## Scope

- 3 files: `dashboardStore.js`, `Dashboard/index.jsx`, `SideBar.jsx`
- No backend changes
- No visual changes to any component

## Success Criteria

- Expanding left nav while right sidebar is open → right sidebar closes automatically
- Collapsing left nav → right sidebar state unchanged
- Right sidebar toggle button continues to work independently
- Build passes with 0 errors
