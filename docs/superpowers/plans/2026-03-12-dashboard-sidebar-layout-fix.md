# Dashboard Sidebar Layout Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace vw-based sidebar widths with flex percentages to fix calendar/doctor list clipping, and default the sidebar to closed on initial load.

**Architecture:** Single-file change to `src/pages/Dashboard/index.jsx`. The outer flex container already exists — we replace `width` vw-values on the right sidebar with `flex` percentage values, remove the conflicting `width` override on the left content, and flip the initial state boolean.

**Tech Stack:** React 18, MUI v7, Vite 7

---

## Chunk 1: Sidebar layout fix + default closed state

### Task 1: Fix right sidebar — replace vw widths with flex percentages

**Files:**
- Modify: `src/pages/Dashboard/index.jsx` (Right Sidebar `Box`, lines ~225–270)

- [ ] **Step 1: Open the file and locate the Right Sidebar Box**

  Find this block (around line 225):
  ```jsx
  {/* Right Sidebar */}
  <Box
    sx={{
      width: {
        xs: "100%",
        sm: "90vw",
        md: isSidebarOpen ? "40vw" : "0px",
        lg: isSidebarOpen ? "38vw" : "0px",
        xl: isSidebarOpen ? "28vw" : "0px",
      },
      transition: "width 0.3s ease",
      backgroundColor: "#fff",
      overflow: "hidden",
      p: isSidebarOpen ? { xs: 2, sm: 3 } : 0,
    }}
  >
  ```

- [ ] **Step 2: Replace with flex-based values**

  Replace the entire `sx` prop of that Box with:
  ```jsx
  sx={{
    flex: {
      xs: "0 0 100%",
      sm: "0 0 100%",
      md: isSidebarOpen ? "0 0 35%" : "0 0 0%",
      lg: isSidebarOpen ? "0 0 32%" : "0 0 0%",
      xl: isSidebarOpen ? "0 0 28%" : "0 0 0%",
    },
    minWidth: 0,
    transition: "flex 0.3s ease",
    backgroundColor: "#fff",
    overflow: "hidden",
    p: isSidebarOpen ? { xs: 2, sm: 3 } : 0,
  }}
  ```

- [ ] **Step 3: Verify build passes**

  Run:
  ```bash
  cd /Users/aksidharth/HFlow/hms_be_fast_frontend && node_modules/.bin/vite build --mode development 2>&1 | tail -5
  ```
  Expected: `✓ built in X.XXs` with no errors.

---

### Task 2: Fix left content Box — remove conflicting width override

**Files:**
- Modify: `src/pages/Dashboard/index.jsx` (Left Section `Box`, lines ~122–131)

- [ ] **Step 1: Locate the Left Section Box**

  Find this block (around line 123):
  ```jsx
  {/* Left Section */}
  <Box
    sx={{
      flex: 1,
      p: { xs: 2, sm: 3 },
      overflowY: "auto",
      transition: "all 0.3s ease",
       width: isSidebarOpen ? { md: "75%", lg: "70%" } : "100%",
    }}
  >
  ```

- [ ] **Step 2: Remove the conflicting width and add minWidth**

  Replace the `sx` prop with:
  ```jsx
  sx={{
    flex: 1,
    minWidth: 0,
    p: { xs: 2, sm: 3 },
    overflowY: "auto",
    transition: "all 0.3s ease",
  }}
  ```

- [ ] **Step 3: Verify build passes**

  Run:
  ```bash
  node_modules/.bin/vite build --mode development 2>&1 | tail -5
  ```
  Expected: `✓ built in X.XXs` with no errors.

---

### Task 3: Fix toggle button position to match new sidebar percentages

**Files:**
- Modify: `src/pages/Dashboard/index.jsx` (Sidebar Toggle Button, lines ~206–222)

- [ ] **Step 1: Locate the toggle button**

  Find this block (around line 206):
  ```jsx
  {/* Sidebar Toggle Button */}
  <Tooltip title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}>
    <IconButton
      onClick={() => setIsSidebarOpen((prev) => !prev)}
      sx={{
        position: "absolute",
        top: 80,
        right: isSidebarOpen ? { md: "30%", lg: "32%", xl: "30%" } : 0,
        ...
      }}
    >
  ```

- [ ] **Step 2: Update right values to mirror new sidebar flex percentages**

  Change the `right` value:
  ```jsx
  right: isSidebarOpen ? { md: "35%", lg: "32%", xl: "28%" } : 0,
  ```

- [ ] **Step 3: Verify build passes**

  Run:
  ```bash
  node_modules/.bin/vite build --mode development 2>&1 | tail -5
  ```
  Expected: `✓ built in X.XXs` with no errors.

---

### Task 4: Default sidebar to closed on initial load

**Files:**
- Modify: `src/pages/Dashboard/index.jsx` (line ~46)

- [ ] **Step 1: Locate the useState**

  Find:
  ```jsx
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  ```

- [ ] **Step 2: Change initial value to false**

  ```jsx
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  ```

- [ ] **Step 3: Verify build passes**

  Run:
  ```bash
  node_modules/.bin/vite build --mode development 2>&1 | tail -5
  ```
  Expected: `✓ built in X.XXs` with no errors.

---

### Task 5: Commit all changes

- [ ] **Step 1: Confirm only the intended file was changed**

  Run:
  ```bash
  git diff --stat
  ```
  Expected: only `src/pages/Dashboard/index.jsx` modified.

- [ ] **Step 2: Verify dev server renders correctly**

  Run:
  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
  ```
  Expected: `200`

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/Dashboard/index.jsx
  git commit -m "fix(dashboard): replace vw sidebar widths with flex percentages, default sidebar closed"
  ```
