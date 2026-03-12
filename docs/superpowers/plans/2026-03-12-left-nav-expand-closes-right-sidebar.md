# Left Nav Expand Auto-Closes Right Sidebar Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the user expands the left nav sidebar, automatically close the right calendar/doctor sidebar.

**Architecture:** Move `isSidebarOpen` from local `useState` in `Dashboard/index.jsx` into the existing `useDashboardStore` Zustand store. `SideBar.jsx` then calls `useDashboardStore.getState().setIsSidebarOpen(false)` when the nav expands — no prop drilling, no new abstractions.

**Tech Stack:** React 18, Zustand, MUI v7, Vite 7

---

## Chunk 1: Wire up shared sidebar state

### Task 1: Add isSidebarOpen to dashboardStore

**Files:**
- Modify: `src/stores/dashboardStore.js`

- [ ] **Step 1: Open the file**

  Current content:
  ```js
  export const useDashboardStore = create((set) => ({
    date: dayjs().format("YYYY-MM-DD"),
    setDate: (date) => set({ date: dayjs(date).format("YYYY-MM-DD") }),
    doctor_id: "",
    setDoctorSearch: (search) => set({ doctorSearch: search }),
    doctorSearch: "",
    setdoctor_id: (id) => set({ doctor_id: id }),
    userRole: "admin",
    setUserRole: (role) => set({ userRole: role }),
  }));
  ```

- [ ] **Step 2: Add isSidebarOpen state**

  Add these two lines before the closing `}))`:
  ```js
  isSidebarOpen: false,
  setIsSidebarOpen: (val) => set({ isSidebarOpen: val }),
  ```

- [ ] **Step 3: Verify build passes**

  ```bash
  cd /Users/aksidharth/HFlow/hms_be_fast_frontend && node_modules/.bin/vite build --mode development 2>&1 | tail -4
  ```
  Expected: `✓ built in X.XXs`

---

### Task 2: Migrate Dashboard/index.jsx to use store state

**Files:**
- Modify: `src/pages/Dashboard/index.jsx`

- [ ] **Step 1: Find the isSidebarOpen useState (around line 46)**

  Current:
  ```jsx
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  ```

- [ ] **Step 2: Replace with store destructure**

  The file already imports `useDashboardStore`. Add `isSidebarOpen` and `setIsSidebarOpen` to the existing destructure (around line 48):
  ```jsx
  const { date, setDate, doctor_id, doctorSearch, isSidebarOpen, setIsSidebarOpen } = useDashboardStore();
  ```
  Then delete the `useState(false)` line for `isSidebarOpen`.

- [ ] **Step 3: Fix the functional updater call**

  The toggle button (around line 208) currently uses:
  ```jsx
  onClick={() => setIsSidebarOpen((prev) => !prev)}
  ```
  The Zustand store setter only accepts a direct value, not a function. Change it to:
  ```jsx
  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
  ```

- [ ] **Step 4: Verify useState import is still needed**

  Check that `isBookingOpen` and `isCheckinOpen` still use `useState` — they do, so the `useState` import must stay.

- [ ] **Step 5: Verify build passes**

  ```bash
  node_modules/.bin/vite build --mode development 2>&1 | tail -4
  ```
  Expected: `✓ built in X.XXs`

---

### Task 3: Call setIsSidebarOpen(false) when left nav expands

**Files:**
- Modify: `src/pages/Layout/SideBar.jsx`

- [ ] **Step 1: Add the store import**

  At the top of the file, add:
  ```js
  import { useDashboardStore } from "@/stores/dashboardStore";
  ```

- [ ] **Step 2: Find toggleCollapse (around line 38)**

  Current:
  ```js
  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapse?.(newState);
  };
  ```

- [ ] **Step 3: Add the auto-close logic**

  Replace with:
  ```js
  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapse?.(newState);
    if (!newState) {
      useDashboardStore.getState().setIsSidebarOpen(false);
    }
  };
  ```
  Note: `newState === false` means the nav is expanding (icon-only → full width). `useDashboardStore.getState()` is the correct Zustand pattern for calling store actions outside React's render cycle.

- [ ] **Step 4: Verify build passes**

  ```bash
  node_modules/.bin/vite build --mode development 2>&1 | tail -4
  ```
  Expected: `✓ built in X.XXs`

---

### Task 4: Verify and commit

- [ ] **Step 1: Confirm only the 3 intended files changed**

  ```bash
  git diff --stat
  ```
  Expected: only `src/stores/dashboardStore.js`, `src/pages/Dashboard/index.jsx`, `src/pages/Layout/SideBar.jsx`

- [ ] **Step 2: Verify dev server is up**

  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
  ```
  Expected: `200`

- [ ] **Step 3: Commit**

  ```bash
  git add src/stores/dashboardStore.js src/pages/Dashboard/index.jsx src/pages/Layout/SideBar.jsx docs/superpowers/plans/2026-03-12-left-nav-expand-closes-right-sidebar.md
  git commit -m "feat(dashboard): auto-close right sidebar when left nav expands"
  ```
