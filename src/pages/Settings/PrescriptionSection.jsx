import React, { useMemo } from "react";
import {
  Autocomplete,
  Box,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  MenuItem,
} from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import StyledButton from "@components/StyledButton";

const formatDosage = (value) => {
  const cleaned = String(value ?? "")
    .replace(/[-\s]/g, "")
    .replace(/[^0-9]/g, "")
    .slice(0, 3);
  return cleaned.split("").join("-");
};

function PrescriptionSection({
  templateDraft,
  setTemplateDraft,
  drugOptions,
  editingRxRowId,
  setEditingRxRowId,
}) {
  const timingOptions = ["Before Food", "After Food"];
  const prescriptionColumns = useMemo(
    () => [
      {
        accessorKey: "medicine_name",
        header: "Medicine",
        Edit: ({ cell, row, table }) => {
          const currentId = row.original.medicine_id ?? null;
          const selected =
            (drugOptions || []).find((d) => d.medicine_id === currentId) || null;

          return (
            <Autocomplete
              fullWidth
              size="small"
              options={drugOptions}
              value={selected}
              getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt?.medicine_name || "")}
              isOptionEqualToValue={(opt, val) => opt?.medicine_id === val?.medicine_id}
              onChange={(event, val) => {
                if (!val) {
                  table.options.meta.updateData(row.index, "medicine_id", null);
                  table.options.meta.updateData(row.index, "medicine_name", "");
                  return;
                }
                const morning = val.morning_dosage ?? "";
                const afternoon = val.afternoon_dosage ?? "";
                const night = val.night_dosage ?? "";

                table.options.meta.updateRowData(row.index, {
                  medicine_id: val.medicine_id,
                  medicine_name: val.medicine_name,
                  generic_name: val.generic_name || "",
                  strength: val.strength || "",
                  morning_dosage: morning,
                  afternoon_dosage: afternoon,
                  night_dosage: night,
                  dosage: (morning || afternoon || night) ? `${morning || "0"}-${afternoon || "0"}-${night || "0"}` : "",
                  food_timing: val.food_timing || "",
                  duration_days: val.duration_days || "",
                  special_instructions: val.special_instructions || "",
                });
              }}
              renderInput={(params) => <TextField {...params} placeholder="Search medicine..." />}
            />
          );
        },
      },
      {
        accessorKey: "generic_name",
        header: "Generic",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            size="small"
            value={row.original.generic_name ?? ""}
            onChange={(e) => table.options.meta.updateData(row.index, "generic_name", e.target.value)}
          />
        ),
      },
      {
        accessorKey: "strength",
        header: "Strength",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            size="small"
            value={row.original.strength ?? ""}
            onChange={(e) => table.options.meta.updateData(row.index, "strength", e.target.value)}
          />
        ),
      },
      {
        accessorKey: "dosage",
        header: "Dosage (M-A-N)",
        Cell: ({ row }) => {
          const m = row.original.morning_dosage;
          const a = row.original.afternoon_dosage;
          const n = row.original.night_dosage;
          if (!m && !a && !n) return "";
          return `${m || "0"}-${a || "0"}-${n || "0"}`;
        },
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            size="small"
            value={row.original.dosage ?? ""}
            onChange={(e) => {
              const formatted = formatDosage(e.target.value);
              const parts = formatted.split("-");
              table.options.meta.updateRowData(row.index, {
                dosage: formatted,
                morning_dosage: parts[0] || "",
                afternoon_dosage: parts[1] || "",
                night_dosage: parts[2] || "",
              });
            }}
            placeholder="e.g. 1-0-1"
          />
        ),
      },
      {
        accessorKey: "food_timing",
        header: "Food timing",
        Edit: ({ cell, row, table }) => (
          <TextField
            select
            fullWidth
            size="small"
            value={row.original.food_timing ?? ""}
            onChange={(e) => table.options.meta.updateData(row.index, "food_timing", e.target.value)}
          >
            {timingOptions.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        ),
      },
      {
        accessorKey: "duration_days",
        header: "Days",
        size: 70,
        Edit: ({ cell, row, table }) => (
          <TextField
            type="number"
            size="small"
            fullWidth
            value={row.original.duration_days ?? ""}
            onChange={(e) => table.options.meta.updateData(row.index, "duration_days", e.target.value)}
          />
        ),
      },
      {
        accessorKey: "special_instructions",
        header: "Instructions",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            size="small"
            value={row.original.special_instructions ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "special_instructions", e.target.value)
            }
            placeholder="Special instructions"
          />
        ),
      },
    ],
    [drugOptions]
  );

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 800 }}>Prescriptions</Typography>
        <StyledButton
          variant="outlined"
          onClick={() =>
            setTemplateDraft((p) => ({
              ...p,
              prescriptions: [
                {
                  id: `rx-new-${Date.now()}`,
                  medicine_id: null,
                  medicine_name: "",
                  generic_name: "",
                  strength: "",
                  morning_dosage: "",
                  afternoon_dosage: "",
                  night_dosage: "",
                  dosage: "",
                  food_timing: "",
                  duration_days: "",
                  special_instructions: "",
                },
                ...(p.prescriptions || []),
              ],
            }))
          }
        >
          Add row
        </StyledButton>
      </Box>

      <Box sx={{ mt: 1 }}>
        <MaterialReactTable
          columns={prescriptionColumns}
          data={templateDraft.prescriptions || []}
          enableEditing
          editDisplayMode="row"
          enableGlobalFilter={false}
          enableColumnFilters={false}
          enableColumnActions={false}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enablePagination={false}
          enableBottomToolbar={false}
          enableTopToolbar={false}
          meta={{
            updateData: (rowIndex, columnId, value) =>
              setTemplateDraft((prev) => {
                const next = [...(prev.prescriptions || [])];
                next[rowIndex] = { ...next[rowIndex], [columnId]: value };
                return { ...prev, prescriptions: next };
              }),
            updateRowData: (rowIndex, updatedRow) =>
              setTemplateDraft((prev) => {
                const next = [...(prev.prescriptions || [])];
                next[rowIndex] = { ...next[rowIndex], ...updatedRow };
                return { ...prev, prescriptions: next };
              }),
          }}
          renderRowActions={({ row, table }) => {
            const isEditing = editingRxRowId === row.original.id;
            return (
              <Box sx={{ display: "flex", gap: 1 }}>
                {isEditing ? (
                  <>
                    <Tooltip title="Save" arrow>
                      <IconButton
                        size="small"
                        onClick={() => {
                          table.setEditingRow(null);
                          setEditingRxRowId(null);
                        }}
                      >
                        <SaveIcon sx={{ color: "#115E59", fontSize: "1.2rem" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel" arrow>
                      <IconButton
                        size="small"
                        onClick={() => {
                          table.setEditingRow(null);
                          setEditingRxRowId(null);
                        }}
                      >
                        <CancelIcon sx={{ color: "#dc2626", fontSize: "1.2rem" }} />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip title="Edit" arrow>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingRxRowId(row.original.id);
                          table.setEditingRow(row);
                        }}
                      >
                        <EditOutlinedIcon sx={{ color: "#115E59", fontSize: "1.2rem" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setTemplateDraft((p) => ({
                            ...p,
                            prescriptions: (p.prescriptions || []).filter(
                              (r) => r.id !== row.original.id
                            ),
                          }));
                        }}
                      >
                        <DeleteForeverIcon sx={{ fontSize: "1.2rem" }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            );
          }}
        />
      </Box>
    </>
  );
}

export default PrescriptionSection;
