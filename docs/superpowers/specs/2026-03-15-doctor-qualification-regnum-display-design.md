# Design Spec: Doctor Registration Number & Qualification Display

**Date:** 2026-03-15
**Status:** Approved
**Scope:** Frontend only — no store, API, or backend changes

---

## 1. Problem Statement

The `qualification` and `registration_number` fields are already captured in the Add/Edit Doctor form and stored via the API, but they are invisible in:
- The Doctors list table (`pages/Doctors/index.jsx`)
- The View Doctor dialog (`ReusableComponents/DoctorDetailsDialog.jsx`)

Additionally, qualifications are stored in selection order (e.g. `"MS,MBBS"`) but must always display in ascending academic hierarchy order (e.g. `"MBBS, MS"`).

---

## 2. Goals

1. Show `registration_number` and `qualification` as columns in the Doctors table.
2. Show the same two fields in the View Doctor dialog.
3. Qualifications always render sorted by academic hierarchy regardless of selection order.
4. Empty fields show `"Enter details"` in a visually muted style (not a hard "-").
5. Share the hierarchy constant — one source of truth across AddDoctor, table, and dialog.

---

## 3. Approach: Sort on Display (Option A)

Stored values are **never mutated**. Sorting and formatting happen purely at render time. This handles existing records in the database that may already have unsorted qualifications.

---

## 4. Data Shape

`qualification` is a comma-separated string stored by the backend:
- Example stored: `"MS,MBBS"` or `"MBBS,MS,PhD"`
- Example displayed: `"MBBS, MS"` or `"MBBS, MS, PhD"`

`registration_number` is a plain string (e.g. `"50047"`). May be empty string or null.

---

## 5. Shared Constant & Helper — `src/data/staticData.js`

### 5.1 Add `QUALIFICATION_HIERARCHY`

```js
export const QUALIFICATION_HIERARCHY = [
  "MBBS", "BDS", "BAMS", "BHMS", "BUMS",
  "MD", "MS", "DNB", "DM", "MCh",
  "MDS", "MPhil", "PhD",
  "FCPS", "MRCP", "FRCS",
  "Fellowship",
];
```

Order is ascending by academic level: undergraduate degrees first, then postgraduate, then super-speciality/fellowships. Items not in this list (custom free-text) sort last, preserving their relative order.

### 5.2 Add `sortQualifications(str)` helper

```js
/**
 * Sorts a comma-separated qualification string by academic hierarchy.
 * Returns null if input is empty/null (caller shows "Enter details").
 * Unknown qualifications are appended after known ones.
 *
 * @param {string|null} str - e.g. "MS,MBBS"
 * @returns {string|null}   - e.g. "MBBS, MS"
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

---

## 6. AddDoctor.jsx Changes

- Remove the local `QUALIFICATION_OPTIONS` constant (lines 29–35).
- Import `QUALIFICATION_HIERARCHY` from `@data/staticData`.
- Replace all references to `QUALIFICATION_OPTIONS` with `QUALIFICATION_HIERARCHY`.
- No logic change — just de-duplication.

> **Note on dual-use:** `QUALIFICATION_HIERARCHY` intentionally serves two roles:
> 1. As the MUI Autocomplete `options` list in AddDoctor.
> 2. As the sort-rank reference array inside `sortQualifications()`.
> Both uses must stay in sync. Do not add rank-only internal markers or non-displayable entries to this array — they would appear as Autocomplete suggestions.

---

## 7. Doctors Table — `pages/Doctors/index.jsx`

### 7.1 New imports
```js
import { sortQualifications } from "@data/staticData";
```

### 7.2 Two new columns inserted after `consultation_fee`, before `actions`

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

---

## 8. View Doctor Dialog — `ReusableComponents/DoctorDetailsDialog.jsx`

### 8.1 New imports
```js
import { sortQualifications } from "@data/staticData";
```

### 8.2 Update the `Field` component — add `isEmpty` prop

The existing `valueSx` hardcodes `color: "#111827"` (near-black). To render "Enter details" in a muted style without duplicating JSX, add an optional `isEmpty` boolean prop:

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

This is a backward-compatible addition — all existing `<Field>` usages omit `isEmpty` and continue rendering with full-dark styling unchanged.

### 8.3 Two new `<Field>` items in the Doctor Details grid

Appended after the existing 10 fields (Experience, ABDM_NHPR_id):

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

> **MRT version note:** Cell render callbacks (`Cell: ({ cell }) => …`, `cell.getValue()`) target **material-react-table v3** (`^3.2.1`). If the package is upgraded to a future major version, verify the Cell API has not changed.

---

## 9. Files Changed

| File | Type of change |
|---|---|
| `src/data/staticData.js` | Add `QUALIFICATION_HIERARCHY` + `sortQualifications` |
| `src/pages/Doctors/AddDoctor.jsx` | Remove local constant, import from staticData |
| `src/pages/Doctors/index.jsx` | Add 2 columns with placeholder + sort |
| `src/ReusableComponents/DoctorDetailsDialog.jsx` | Add import of `sortQualifications`; add `isEmpty` prop to `Field`; add 2 new fields |

**No store, API, backend, or routing changes.**

---

## 10. Edge Cases

| Case | Behaviour |
|---|---|
| `qualification = ""` | `sortQualifications("")` returns `null` → "Enter details" shown (muted) |
| `qualification = null` | Same as above |
| `qualification = ","` | After split+trim+filter, parts = [] → returns `null` → "Enter details" shown (muted) |
| `qualification = "  "` | Trimmed to empty → returns `null` → "Enter details" shown (muted) |
| `qualification = "MBBS"` | Single item, no sort needed → `"MBBS"` |
| `qualification = "CustomDeg,MBBS"` | Known first, unknown last → `"MBBS, CustomDeg"` |
| `registration_number = ""` | Falsy → "Enter details" shown (muted) |
| `registration_number = "0"` | Truthy string → shown as-is |

> **Inconsistency acknowledged:** Existing `<Field>` usages fall back to `"-"` for `null`/`undefined` values (via `value ?? "-"`). The two new fields fall back to `"Enter details"` (muted). This asymmetry is intentional — the new fields are user-editable and the placeholder signals "this can be filled in", whereas legacy fields show `"-"` as a neutral empty state.

---

## 11. Testing Checklist

- [ ] Doctor with no qualification → shows "Enter details" (muted) in table and dialog
- [ ] Doctor with `qualification = ","` → shows "Enter details" (muted) — not an empty string artifact
- [ ] Doctor with `qualification = "MS,MBBS"` → shows `"MBBS, MS"` in both places
- [ ] Doctor with `qualification = "PhD,MBBS,MS"` → shows `"MBBS, MS, PhD"`
- [ ] Doctor with custom qualification (not in hierarchy) → shown after known degrees
- [ ] Doctor with no registration_number → shows "Enter details" (muted) in table and dialog
- [ ] Doctor with registration_number set → shows value in both places
- [ ] AddDoctor Autocomplete still works correctly after import refactor
- [ ] Table column order: ID, Name, Mobile Number, Specialization, Consultation Fee, Reg. No., Qualification, Actions
- [ ] Existing `<Field>` usages in DoctorDetailsDialog still render unchanged (no regressions from `isEmpty` prop addition)
