# Procedure Section Overhaul — Design Spec
**Date:** 2026-03-14
**Status:** Approved

---

## Overview

Replace the freetext-only procedure input in Doctor Diagnosis with an MUI Autocomplete that pulls from a master procedure list. Fix the broken submission logic (wrong API shape), fix existing-diagnosis reload hydration, and verify print/billing paths.

---

## Scope

### In Scope
- `serviceApis/index.js` — add `getProcedureMasterList`
- `ProcedureSection.jsx` — replace with Autocomplete + master list + procedure_id tracking
- `procedureStore.js` — expand shape comment to include `procedure_id`
- `doctorDiagnosisStore.js` — fix `getSubmissionData()` procedure mapping + fix `setDiagnosisData()` procedure hydration

### Out of Scope
- `ViewScreen.jsx` — no changes; print and submit work correctly after store fix
- `ProcedureBilling.jsx` — no changes; uses separate billing API
- Backend (`patient_diagnosis.py`) — no changes; already handles both shapes

---

## Critical Bug: API Shape Mismatch

**Current (broken):**
```js
procedures: store.procedures.map(p => ({
  price: p.price || 0,
  procedure_text: p.procedure_text || "",   // ← backend does not accept this field
}))
```

**Backend expects:**
```python
class DiagnosisProcedureItem(BaseModel):
    procedure_id: Optional[int] = None        # for master list items
    free_text_procedure: Optional[str] = None  # for custom entries
    price: Optional[float] = None             # optional for master, REQUIRED for free text
    prerequisite_text: Optional[str] = None
```

Sending `procedure_text` causes backend validation to reject the item (neither `procedure_id` nor `free_text_procedure` present).

---

## Data Flow

### Procedure Store Shape (expanded)
```js
{ procedure_text: string, price: number, procedure_id: number | null }
```

### Doctor Diagnosis — Submission Path
```
ProcedureSection (local state: { id, procedure_text, procedure_id, price })
  → syncToStore() → procedureStore.procedures
    → doctorDiagnosisStore.getSubmissionData()
      → map: procedure_id present? → { procedure_id, price? }
             no procedure_id?     → { free_text_procedure, price }
        → putAddPatientDiagnosis(payload)
```

### Doctor Diagnosis — Load Existing Path
```
getPatientDiagnosis() → API returns [{ procedure_id, procedure_name, free_text_procedure, price }]
  → setDiagnosisData(data)
    → procedureStore.setProcedures(mapped) where mapped = [{
        procedure_id: proc.procedure_id || null,
        procedure_text: proc.procedure_name || proc.free_text_procedure || "",
        price: proc.price || 0
      }]
      → ProcedureSection useEffect syncs store → local state (reads procedure_id)
```

### Billing Path (unchanged)
```
ProcedureBilling → getLoadDiagnosis() → /billing/load-diagnosis
  → maps item.procedure_text directly (independent of procedure store)
```

---

## File-by-File Changes

### 1. `src/serviceApis/index.js`
Add after `getLabMasterList`:
```js
export const getProcedureMasterList = async () =>
  api.get(`/templates/procedure-master`).then((response) => response.data);
```

### 2. `src/pages/DoctorDiagnosis/ProcedureSection.jsx`
Full replacement with user-provided Autocomplete component. Critical additions to user code:

**a) `handleAddRow` — include `procedure_id: null`:**
```js
const newRow = { id: Date.now(), procedure_text: "", procedure_id: null, description: "", price: 0 };
```

**b) `handleProcedureSelect` — capture `procedure_id` from master item:**
```js
// Master list item selected:
return { ...row, procedure_text: selectedProcedure.procedure_name, procedure_id: selectedProcedure.procedure_id || null, price: selectedProcedure.price || 0 };
// FreeSolo (custom string):
return { ...row, procedure_text: selectedProcedure, procedure_id: null, price: row.price };
```

**c) `syncToStore` — include `procedure_id`:**
```js
setProcedures(data.map(r => ({ procedure_text: r.procedure_text || "", price: r.price || 0, procedure_id: r.procedure_id || null })));
```

**d) `handleDeleteRow` — include `procedure_id`:**
```js
setProcedures(filtered.map(r => ({ procedure_text: r.procedure_text || "", price: r.price || 0, procedure_id: r.procedure_id || null })));
```

**e) `useEffect` (store → local state sync) — read `procedure_id`:**
```js
const tableData = procedures.map((procedure, index) => ({
  id: `procedure-${index}-${Date.now()}`,
  procedure_text: procedure.procedure_text || "",
  procedure_id: procedure.procedure_id || null,
  description: "",
  price: procedure.price || 0,
}));
```

### 3. `src/stores/procedureStore.js`
Update comment:
```js
const initialState = {
  procedures: [], // Array of { procedure_text, price, procedure_id }
};
```

### 4. `src/stores/doctorDiagnosisStore.js`

**Fix A — `getSubmissionData()` procedure mapping (lines 111–116):**
```js
procedures: procedureStore.procedures
  .filter((p) => p.procedure_id || (p.procedure_text && String(p.procedure_text).trim().length >= 5))
  .map((p) => {
    if (p.procedure_id) {
      const item = { procedure_id: p.procedure_id };
      if (p.price) item.price = parseFloat(p.price);
      return item;
    }
    return {
      free_text_procedure: p.procedure_text,
      price: parseFloat(p.price) || 0,
    };
  }),
```

**Fix B — `setDiagnosisData()` procedure hydration (lines 65–67):**
```js
if (data.procedures && Array.isArray(data.procedures)) {
  procedureStore.setProcedures(
    data.procedures.map((proc) => ({
      procedure_id: proc.procedure_id || null,
      procedure_text: proc.procedure_name || proc.free_text_procedure || "",
      price: proc.price || 0,
    }))
  );
}
```

---

## Print Verification

### ProcedureSection section print
New component renders `row.procedure_text` in hidden `printRef` table — correct.

### ViewScreen full-page print
Reads `procedureStore.procedures` and renders `pr.procedure_text || pr.procedure_name`.
After fix, store always has `procedure_text` set (display name). Compatible. ✅

---

## Validation Rules (preserved from backend)

| Scenario | Submission shape |
|----------|-----------------|
| Master list item selected | `{ procedure_id, price? }` |
| Custom free-text entered (≥5 chars) | `{ free_text_procedure, price }` |
| Incomplete rows (no id, <5 chars) | Filtered out before submission |

**Important — Price 0 for free-text:** The backend validator does `if self.free_text_procedure and not self.price` — in Python, `0` is falsy, so `price: 0` will fail the backend. Frontend must ensure custom entries have a non-zero price before reaching `getSubmissionData()`. The `parseFloat(p.price) || 0` fallback is intentional as a last resort; a zero-price free-text row will be silently dropped by the filter or rejected by the backend. Acceptable behaviour for this iteration — no additional frontend guard required.

**Filter logic:** The `>= 5 chars` check applies only to the free-text branch. Master-list items are filtered solely on `procedure_id` presence. This is reflected in the `getSubmissionData()` fix code above.

## useEffect Guard (store → local state)

The guard `if (procedures.length > 0 && data.length === 0)` is intentional — it hydrates the table on initial load only. After the user has added/deleted rows (`data.length > 0`), external store changes no longer overwrite local state. This matches the user-provided replacement code and is the correct pattern for this component. No change needed.

## `getProcedureMasterList` API Shape

Endpoint: `GET /templates/procedure-master`
Expected response: `Array<{ procedure_id: number, procedure_name: string, price: number, is_active: boolean }>`
Used in `ProcedureSection.jsx` as `procedureOptions`. If the API call fails, TanStack Query defaults `procedureOptions` to `[]` — Autocomplete shows empty dropdown and free-text still works.

## Known Out-of-Scope Bug

`ProcedureBilling.jsx` also sends `procedure_text` to the billing API (`/billing/create-bills`). Whether that billing API accepts `procedure_text` is a separate concern outside this spec's scope. No changes to `ProcedureBilling.jsx` in this iteration.

---

## Git Checkpoint Strategy

1. Commit current working state before any changes (checkpoint)
2. Make all 4 file changes
3. Verify build passes
4. Commit feature

---

## Success Criteria

- [ ] Master list loads in Autocomplete dropdown
- [ ] Selecting master item auto-fills name and price
- [ ] Custom free-text entry saves correctly
- [ ] Submit sends correct API shape (`procedure_id` or `free_text_procedure`)
- [ ] Loading an existing diagnosis re-hydrates procedure rows correctly
- [ ] Section print renders procedure name and price
- [ ] Full-page print (ViewScreen) renders procedures correctly
- [ ] Billing Load Diagnosis flow unaffected
