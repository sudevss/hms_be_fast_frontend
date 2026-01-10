import { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";

import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  postloadtemplate,
  getTemplatesList,
  getDrugMasterList,
} from "@/serviceApis";
import { useQuery } from "@tanstack/react-query";

const PrescriptionSection = () => {
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const timingOptions = ["Before Food", "After Food"];

  const [selectedTemplateOption, setSelectedTemplateOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const { data: templateOptions = [] } = useQuery({
    queryKey: ["queryGetTemplatesList"],
    queryFn: () => getTemplatesList(),
  });

  const { data: drugOptions = [] } = useQuery({
    queryKey: ["queryGetDrugMaster"],
    queryFn: () => getDrugMasterList(),
  });

  // ---------------------- TEMPLATE LOAD ---------------------------

  const handleTemplateSelect = async (selected) => {
    setLoadError("");
    setSelectedTemplateOption(selected);
    if (!selected) return;

    setLoading(true);

    try {
      const response = await postloadtemplate({
        template_id: selected.template_id,
        template_name: selected.template_name,
      });

      const apiTemplate = response?.data ?? response;
      const prescriptions = apiTemplate?.prescriptions || [];

      const existing = new Set(data.map((r) => r.medicine_name?.trim().toLowerCase()));

      const mapped = prescriptions
        .filter((rx) => !existing.has((rx.medicine_name || "").trim().toLowerCase()))
        .map((rx, index) => {
          const morning = rx.morning_dosage ?? "0";
          const afternoon = rx.afternoon_dosage ?? "0";
          const night = rx.night_dosage ?? "0";

          return {
            id: `tmpl-${selected.template_id}-${index}-${Date.now()}`,
            medicine_id: rx.medicine_id,
            medicine_name: rx.medicine_name || "",
            generic_name: rx.generic_name || "",
            strength: rx.strength || "",
            dosage: `${morning}-${afternoon}-${night}`,
            food_timing: rx.food_timing || "",
            duration_days: rx.default_duration_days ?? rx.duration_days ?? "",
            special_instructions:
              rx.default_remarks ?? rx.special_instructions ?? "",
          };
        });

      if (!mapped.length) {
        setLoadError("No prescriptions or already loaded");
      }

      setData((prev) => [...prev, ...mapped]);
    } catch (error) {
      setLoadError("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- DOSAGE AUTO-FORMAT ---------------------------

  const formatDosage = (value) => {
    // Remove any existing hyphens and spaces
    let cleaned = value.replace(/[-\s]/g, "");

    // Keep only digits
    cleaned = cleaned.replace(/[^0-9]/g, "");

    // Add hyphens between each digit
    let formatted = cleaned.split("").join("-");

    return formatted;
  };

  // ---------------------- MEDICINE AUTOFILL ---------------------------

  const handleMedicineSelect = (rowIndex, selectedMedicine) => {
    if (!selectedMedicine) return; // avoid breaking MUI internals

    setData((prev) =>
      prev.map((row, idx) => {
        if (idx === rowIndex) {
          const morning = selectedMedicine.morning_dosage ?? "0";
          const afternoon = selectedMedicine.afternoon_dosage ?? "0";
          const night = selectedMedicine.night_dosage ?? "0";

          return {
            ...row,
            medicine_id: selectedMedicine.medicine_id,
            medicine_name: selectedMedicine.medicine_name,
            generic_name: selectedMedicine.generic_name || "",
            strength: selectedMedicine.strength || "",
            dosage: `${morning}-${afternoon}-${night}`,
            food_timing: selectedMedicine.food_timing || "",
            duration_days: selectedMedicine.duration_days || "",
            special_instructions: selectedMedicine.special_instructions || "",
            morning_dosage: morning,
            afternoon_dosage: afternoon,
            night_dosage: night,
          };
        }
        return row;
      })
    );
  };

  // ---------------------- TABLE COLUMNS ---------------------------

  const columns = useMemo(
    () => [
      {
        accessorKey: "medicine_name",
        header: "Medicine Name",
        Edit: ({ cell, row, table }) => {
          // normalize lookup
          const currentValue = (cell.getValue() ?? "").trim().toLowerCase();

          const selectedValue =
            drugOptions.find(
              (m) =>
                m.medicine_name?.trim().toLowerCase() === currentValue
            ) || null;

          return (
            <Autocomplete
              fullWidth
              size="small"
              options={drugOptions}
              value={selectedValue}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.medicine_name
              }
              isOptionEqualToValue={(option, value) =>
                option?.medicine_name?.trim().toLowerCase() ===
                value?.medicine_name?.trim().toLowerCase()
              }
              onChange={(event, selectedMedicine) => {
                if (!selectedMedicine) {
                  table.options.meta.updateData(row.index, "medicine_name", "");
                  return;
                }
                handleMedicineSelect(row.index, selectedMedicine);
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Search medicine..." />
              )}
            />
          );
        },
      },

      // ---------- Generic Name ----------
      {
        accessorKey: "generic_name",
        header: "Generic Name",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "generic_name", e.target.value)
            }
          />
        ),
      },

      // ---------- Strength ----------
      {
        accessorKey: "strength",
        header: "Strength",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "strength", e.target.value)
            }
          />
        ),
      },

      // ---------- Dosage ----------
      {
        accessorKey: "dosage",
        header: "Dosage",
        Cell: ({ row }) => row.original.dosage,
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            size="small"
            value={cell.getValue() ?? ""}
            onChange={(e) => {
              const formattedValue = formatDosage(e.target.value);
              table.options.meta.updateData(row.index, "dosage", formattedValue);
            }}
            placeholder="e.g. 1-0-1"
          />
        ),
      },

      // ---------- Food Timing ----------
      {
        accessorKey: "food_timing",
        header: "Food Timing",
        Edit: ({ cell, row, table }) => (
          <TextField
            select
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "food_timing", e.target.value)
            }
          >
            {timingOptions.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        ),
      },

      // ---------- Duration ----------
      {
        accessorKey: "duration_days",
        header: "Duration (Days)",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "duration_days", e.target.value)
            }
          />
        ),
      },

      // ---------- Special Instructions ----------
      {
        accessorKey: "special_instructions",
        header: "Special Instructions",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(
                row.index,
                "special_instructions",
                e.target.value
              )
            }
          />
        ),
      },
    ],
    [drugOptions]
  );

  // ---------------------- ADD / DELETE ROW ---------------------------

  const handleAddRow = () => {
    setData((prev) => [
      {
        id: Date.now(),
        medicine_name: "",
        generic_name: "",
        strength: "",
        dosage: "",
        food_timing: "",
        duration_days: "",
        special_instructions: "",
      },
      ...prev,
    ]);
  };

  const handlePrint = () => window.print();

  const handleDeleteRow = ({ row }) => {
    setData((prev) => prev.filter((r) => r.id !== row.original.id));
  };

  // ---------------------- RENDER ---------------------------

  return (
    <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2, mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box sx={{ fontWeight: 700, fontSize: "1.0rem" }}>Prescription</Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Autocomplete
            options={templateOptions}
            value={selectedTemplateOption}
            onChange={(e, val) => handleTemplateSelect(val)}
            isOptionEqualToValue={(opt, val) => opt?.template_id === val?.template_id}
            getOptionLabel={(opt) => opt?.template_name || ""}
            filterOptions={(options, state) =>
              options.filter((o) =>
                (o?.template_name || "")
                  .toLowerCase()
                  .includes(state.inputValue.toLowerCase())
              )
            }
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Template"
                sx={{ minWidth: 280 }}
                disabled={loading}
                error={Boolean(loadError)}
                helperText={loadError || ""}
              />
            )}
          />

          <StyledButton variant="outlined" onClick={handlePrint}>
            Print
          </StyledButton>

          <StyledButton variant="contained" onClick={handleAddRow}>
            Add
          </StyledButton>
        </Box>
      </Box>

      <MaterialReactTable
        columns={columns}
        data={data}
        enableEditing
        editDisplayMode="row"
        meta={{
          updateData: (rowIndex, columnId, value) =>
            setData((prev) =>
              prev.map((row, index) =>
                index === rowIndex ? { ...row, [columnId]: value } : row
              )
            ),
        }}
        onEditingRowSave={({ row }) => {
          const updated = data.map((r) =>
            r.id === row.original.id ? { ...row.original } : r
          );
          setData(updated);
          setEditingRowId(null);
        }}
        renderRowActions={({ row, table }) => {
          const isEditing = editingRowId === row.original.id;

          return (
            <Box sx={{ display: "flex", gap: 1 }}>
              {isEditing ? (
                <>
                  <Tooltip title="Save" arrow>
                    <IconButton
                      size="small"
                      onClick={() => {
                        table.setEditingRow(null);
                        setEditingRowId(null);
                      }}
                    >
                      <SaveIcon sx={{ color: "#115E59", fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Cancel" arrow>
                    <IconButton
                      size="small"
                      onClick={() => {
                        table.setEditingRow(null);
                        setEditingRowId(null);
                      }}
                    >
                      <CancelIcon sx={{ color: "#dc2626", fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Edit" arrow>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingRowId(row.original.id);
                        table.setEditingRow(row);
                      }}
                    >
                      <EditOutlinedIcon
                        sx={{ color: "#115E59", fontSize: "1.25rem" }}
                      />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete" arrow>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        setRowToDelete(row);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <DeleteForeverIcon sx={{ fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          );
        }}
      />

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>
          Are you sure you want to delete this prescription entry?
        </DialogContent>

        <DialogActions>
          <StyledButton
            variant="outlined"
            onClick={() => setDeleteConfirmOpen(false)}
          >
            Cancel
          </StyledButton>

          <StyledButton
            variant="contained"
            color="error"
            onClick={() => {
              if (rowToDelete) handleDeleteRow({ row: rowToDelete });
              setDeleteConfirmOpen(false);
              setRowToDelete(null);
            }}
          >
            Delete
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrescriptionSection;
