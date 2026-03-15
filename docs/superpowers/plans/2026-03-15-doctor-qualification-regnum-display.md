# Doctor Qualification & Registration Number Display — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface `registration_number` and `qualification` in the Doctors table and View Doctor dialog, with qualifications always sorted by academic hierarchy regardless of how they were saved.

**Architecture:** Sort on display — stored values are never mutated. A shared `sortQualifications()` helper + `QUALIFICATION_HIERARCHY` constant live in `staticData.js`. Four files are touched; no store, API, or backend changes.

**Tech Stack:** React 18, MUI v5, material-react-table v3, Zustand, TanStack React Query, Vite. Path alias `@data` resolves to `src/data`.

**Spec:** `docs/superpowers/specs/2026-03-15-doctor-qualification-regnum-display-design.md`

---

## Chunk 1: Shared helper + AddDoctor refactor

### Task 1: Add `QUALIFICATION_HIERARCHY` and `sortQualifications` to `staticData.js`

**Files:**
- Modify: `src/data/staticData.js` (append to end of file)

---

- [ ] **Step 1: Read `src/data/staticData.js`** to confirm current exports and find the end of the file.

- [ ] **Step 2: Append the hierarchy constant and helper**

Add the following to the **end** of `src/data/staticData.js`:

```js
// Ordered ascending by academic level (undergraduate → postgraduate → super-speciality).
// IMPORTANT: This array doubles as the MUI Autocomplete options list in AddDoctor.jsx.
// Do NOT add non-displayable rank markers — they would appear as dropdown suggestions.
export const QUALIFICATION_HIERARCHY = [
  "MBBS", "BDS", "BAMS", "BHMS", "BUMS",
  "MD", "MS", "DNB", "DM", "MCh",
  "MDS", "MPhil", "PhD",
  "FCPS", "MRCP", "FRCS",
  "Fellowship",
];

/**
 * Sorts a comma-separated qualification string by academic hierarchy.
 * Returns null if input is empty/null/whitespace-only (caller shows "Enter details").
 * Unknown qualifications (free-text entries not in QUALIFICATION_HIERARCHY) are
 * appended after known degrees, preserving their relative order.
 *
 * @param {string|null} str - e.g. "MS,MBBS"  or  "PhD,CustomDeg,MBBS"
 * @returns {string|null}   - e.g. "MBBS, MS" or  "MBBS, PhD, CustomDeg"
 *
 * @example
 * sortQualifications("MS,MBBS")        // → "MBBS, MS"
 * sortQualifications("PhD,MBBS,MS")    // → "MBBS, MS, PhD"
 * sortQualifications("")               // → null
 * sortQualifications(",")              // → null
 * sortQualifications(null)             // → null
 */
export const sortQualifications = (str) => {
  if (!str) return null;
  const parts = str.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const sorted = [...parts].sort((a, b) => {
    const ai = QUALIFICATION_HIERARCHY.indexOf(a);
    const bi = QUALIFICATION_HIERARCHY.indexOf(b);
    const aRank = ai === -1 ? Infinity : ai;
    const bRank = bi === -1 ? Infinity : bi;
    return aRank - bRank;
  });
  return sorted.join(", ");
};
```

- [ ] **Step 3: Verify the build passes**

```bash
cd /Users/aksidharth/HFlow/hms_be_fast_frontend && npm run build 2>&1 | tail -20
```

Expected: no errors. If there are errors, fix before proceeding.

- [ ] **Step 4: Commit**

```bash
cd /Users/aksidharth/HFlow/hms_be_fast_frontend && git add src/data/staticData.js && git commit -m "$(cat <<'EOF'
feat: add QUALIFICATION_HIERARCHY and sortQualifications to staticData

Co-Authored-By: claude-flow <ruv@ruv.net>
EOF
)"
```

---

### Task 2: Refactor `AddDoctor.jsx` to use the shared constant

**Files:**
- Modify: `src/pages/Doctors/AddDoctor.jsx` (lines 29–35 and import block)

This is a pure de-duplication. No logic changes. The Autocomplete behavior stays identical.

---

- [ ] **Step 1: Read `src/pages/Doctors/AddDoctor.jsx`** to confirm the local `QUALIFICATION_OPTIONS` constant at lines 29–35 and find the existing import from `@data/staticData`.

- [ ] **Step 2: Add `QUALIFICATION_HIERARCHY` to the staticData import**

The file already imports from `@data/staticData` at line 23:
```js
import { GENDER_DATA, INITIAL_SHOW_ALERT } from "@data/staticData";
```

Change it to:
```js
import { GENDER_DATA, INITIAL_SHOW_ALERT, QUALIFICATION_HIERARCHY } from "@data/staticData";
```

- [ ] **Step 3: Remove the local `QUALIFICATION_OPTIONS` constant**

Delete lines 29–35 (the entire `const QUALIFICATION_OPTIONS = [...]` block).

- [ ] **Step 4: Replace the reference in the Autocomplete `options` prop**

Find `options={QUALIFICATION_OPTIONS}` (currently line ~289 after the deletion it will shift) and change to:
```jsx
options={QUALIFICATION_HIERARCHY}
```

- [ ] **Step 5: Verify build passes and Autocomplete still works**

```bash
cd /Users/aksidharth/HFlow/hms_be_fast_frontend && npm run build 2>&1 | tail -20
```

Then open the app (`npm run dev`), go to Doctors → Add Doctor, and verify:
- The Qualification Autocomplete still shows the same dropdown options
- Selecting multiple qualifications and submitting still works
- No console errors

- [ ] **Step 6: Commit**

```bash
cd /Users/aksidharth/HFlow/hms_be_fast_frontend && git add src/pages/Doctors/AddDoctor.jsx && git commit -m "$(cat <<'EOF'
refactor: use shared QUALIFICATION_HIERARCHY in AddDoctor (remove local copy)

Co-Authored-By: claude-flow <ruv@ruv.net>
EOF
)"
```

---

## Chunk 2: Table columns + View dialog fields

### Task 3: Add Reg. No. and Qualification columns to the Doctors table

**Files:**
- Modify: `src/pages/Doctors/index.jsx` (columns array + import)

The table uses `material-react-table` v3 (`MuiReactTableComponent` wrapper). Cell renderers use `Cell: ({ cell }) => …` and `cell.getValue()`. `Typography` is already imported in this file.

---

- [ ] **Step 1: Read `src/pages/Doctors/index.jsx`** to locate the `columns` array and the existing MUI import block.

- [ ] **Step 2: Add `sortQualifications` to the staticData import**

The file currently imports from `@/serviceApis`. Add a new import line after the existing imports (near the top, with the other `@data` or `@/` imports):

```js
import { sortQualifications } from "@data/staticData";
```

- [ ] **Step 3: Insert two columns after `consultation_fee`, before `actions`**

In the `columns` array, insert these two entries **between** the `consultation_fee` object and the `actions` object:

```js
{
  accessorKey: "registration_number",
  header: "Reg. No.",
  size: 130,
  Cell: ({ cell }) => {
    const val = cell.getValue();
    return val ? (
      <Typography variant="body2">{val}</Typography>
    ) : (
      <Typography variant="body2" sx={{ color: "text.disabled" }}>
        Enter details
      </Typography>
    );
  },
},
{
  accessorKey: "qualification",
  header: "Qualification",
  size: 160,
  Cell: ({ cell }) => {
    const val = sortQualifications(cell.getValue());
    return val ? (
      <Typography variant="body2">{val}</Typography>
    ) : (
      <Typography variant="body2" sx={{ color: "text.disabled" }}>
        Enter details
      </Typography>
    );
  },
},
```

- [ ] **Step 4: Verify build passes**

```bash
cd /Users/aksidharth/HFlow/hms_be_fast_frontend && npm run build 2>&1 | tail -20
```

- [ ] **Step 5: Smoke test in browser**

Open the app, go to `/doctors`. Verify:
- Two new columns appear: "Reg. No." and "Qualification"
- Column order is: ID | Name | Mobile Number | Specialization | Consultation Fee | Reg. No. | Qualification | Actions
- Doctors with no `registration_number` show greyed "Enter details"
- Doctors with no `qualification` show greyed "Enter details"
- Doctors with `qualification = "MS,MBBS"` show "MBBS, MS" (sorted)
- Doctors with `qualification = "MBBS"` show "MBBS" (unchanged)

- [ ] **Step 6: Commit**

```bash
cd /Users/aksidharth/HFlow/hms_be_fast_frontend && git add src/pages/Doctors/index.jsx && git commit -m "$(cat <<'EOF'
feat: add Reg. No. and Qualification columns to Doctors table

Co-Authored-By: claude-flow <ruv@ruv.net>
EOF
)"
```

---

### Task 4: Add Reg. No. and Qualification fields to the View Doctor dialog

**Files:**
- Modify: `src/ReusableComponents/DoctorDetailsDialog.jsx` (Field component + grid + import)

The `Field` component is local to this file. It currently renders `value ?? "-"` with hardcoded dark `valueSx`. We add an optional `isEmpty` boolean prop that switches the value text to `color: "text.disabled"` when true. All existing 10 `<Field>` usages omit `isEmpty` — they are unaffected.

---

- [ ] **Step 1: Read `src/ReusableComponents/DoctorDetailsDialog.jsx`** to confirm the `Field` component definition, `valueSx`, and the grid of 10 existing fields.

- [ ] **Step 2: Add `sortQualifications` import**

At the top of the file, add:
```js
import { sortQualifications } from "@data/staticData";
```

- [ ] **Step 3: Update the `Field` component to accept `isEmpty` prop**

Find the current `Field` definition:
```jsx
const Field = ({ label, value }) => (
  <Box>
    <Typography variant="caption" sx={labelSx}>{label}</Typography>
    <Box sx={{ height: 6 }} />
    <Typography variant="body1" sx={valueSx}>{value ?? "-"}</Typography>
  </Box>
);
```

Replace it with:
```jsx
const Field = ({ label, value, isEmpty }) => (
  <Box>
    <Typography variant="caption" sx={labelSx}>{label}</Typography>
    <Box sx={{ height: 6 }} />
    <Typography
      variant="body1"
      sx={isEmpty ? { ...valueSx, color: "text.disabled" } : valueSx}
    >
      {value ?? "-"}
    </Typography>
  </Box>
);
```

`isEmpty` defaults to `undefined` (falsy) for all existing call sites — no change to their rendering.

- [ ] **Step 4: Append the two new `<Field>` items to the Doctor Details grid**

Find the last two existing `<Field>` items in the grid (currently Experience and ABDM_NHPR_id):
```jsx
<Grid item xs={6} md={3}><Field label="Experience" value={doctor.experience} /></Grid>
<Grid item xs={6} md={3}><Field label="ABDM_NHPR_id" value={doctor.ABDM_NHPR_id} /></Grid>
```

Append **after** them (inside the same `<Grid container>`):
```jsx
<Grid item xs={6} md={3}>
  <Field
    label="Reg. No."
    value={doctor.registration_number || "Enter details"}
    isEmpty={!doctor.registration_number}
  />
</Grid>
<Grid item xs={6} md={3}>
  <Field
    label="Qualification"
    value={sortQualifications(doctor.qualification) || "Enter details"}
    isEmpty={!sortQualifications(doctor.qualification)}
  />
</Grid>
```

- [ ] **Step 5: Verify build passes**

```bash
cd /Users/aksidharth/HFlow/hms_be_fast_frontend && npm run build 2>&1 | tail -20
```

- [ ] **Step 6: Smoke test in browser**

Open the app, go to `/doctors`, click the eye icon on any doctor. Verify:
- "Reg. No." and "Qualification" fields appear in the Doctor Details grid
- For a doctor with no `registration_number` → greyed "Enter details"
- For a doctor with no `qualification` → greyed "Enter details"
- For a doctor with `qualification = "MS,MBBS"` → shows "MBBS, MS"
- All other existing fields (Doctor ID, Name, Age, Gender, Mobile, Email, Specialization, Consultation Fee, Experience, ABDM_NHPR_id) render exactly as before
- The Schedule accordion still works

- [ ] **Step 7: Final commit**

```bash
cd /Users/aksidharth/HFlow/hms_be_fast_frontend && git add src/ReusableComponents/DoctorDetailsDialog.jsx && git commit -m "$(cat <<'EOF'
feat: add Reg. No. and Qualification to View Doctor dialog

Co-Authored-By: claude-flow <ruv@ruv.net>
EOF
)"
```

---

## Full Testing Checklist

Run through all of these manually after Task 4 is complete:

- [ ] Doctor with no `qualification` → shows "Enter details" (muted/grey) in **table** and **dialog**
- [ ] Doctor with `qualification = ","` → shows "Enter details" (muted) — not an artifact
- [ ] Doctor with `qualification = "MS,MBBS"` → shows `"MBBS, MS"` in both places
- [ ] Doctor with `qualification = "PhD,MBBS,MS"` → shows `"MBBS, MS, PhD"` in both places
- [ ] Doctor with custom qualification not in hierarchy → shown after known degrees
- [ ] Doctor with no `registration_number` → shows "Enter details" (muted) in table and dialog
- [ ] Doctor with `registration_number` set → shows value in both places
- [ ] AddDoctor Autocomplete dropdown still shows same qualification options
- [ ] Table column order: ID | Name | Mobile Number | Specialization | Consultation Fee | Reg. No. | Qualification | Actions
- [ ] All existing `<Field>` items in View Doctor dialog still render with full dark colour (no regressions)
- [ ] `npm run build` passes with zero errors
