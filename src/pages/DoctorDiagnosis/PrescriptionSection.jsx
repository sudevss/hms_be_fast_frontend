import { useMemo, useState, useEffect, useRef } from "react";
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
import { usePrescriptionStore } from "@/stores/prescriptionStore";

const PrescriptionSection = ({ patientId, patientName, tokenNumber, appointmentDate, appointmentId }) => {
  const prescriptionStore = usePrescriptionStore();
  const { prescriptions, setPrescriptions } = prescriptionStore;
  
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const printRef = useRef();

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
  
  // Sync store with local data when prescriptions change externally
  useEffect(() => {
    if (prescriptions.length > 0 && data.length === 0 && drugOptions.length > 0) {
      // Only sync if data is empty (initial load)
      const tableData = prescriptions.map((prescription, index) => {
        const morning = prescription.morning_dosage ?? "0";
        const afternoon = prescription.afternoon_dosage ?? "0";
        const night = prescription.night_dosage ?? "0";
        // Look up medicine details from master list
        const medicineOption = drugOptions.find(d => d.medicine_id === prescription.medicine_id);
        return {
          id: `prescription-${index}-${Date.now()}`,
          medicine_id: prescription.medicine_id,
          medicine_name: medicineOption?.medicine_name || "",
          generic_name: medicineOption?.generic_name || "",
          strength: medicineOption?.strength || "",
          dosage: `${morning}-${afternoon}-${night}`,
          morning_dosage: morning,
          afternoon_dosage: afternoon,
          night_dosage: night,
          food_timing: prescription.food_timing || "",
          duration_days: prescription.duration_days || "",
          special_instructions: prescription.special_instructions || "",
        }; 
      });
      setData(tableData);
    }
  }, [prescriptions, drugOptions]);

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
      
      // Update store
      const newPrescriptions = mapped.map((m) => ({
        medicine_id: m.medicine_id,
        morning_dosage: m.morning_dosage || "0",
        afternoon_dosage: m.afternoon_dosage || "0",
        night_dosage: m.night_dosage || "0",
        food_timing: m.food_timing || "",
        duration_days: m.duration_days || 0,
        special_instructions: m.special_instructions || "",
      }));
      setPrescriptions([...prescriptionStore.prescriptions, ...newPrescriptions]);
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
              // Parse dosage and update individual fields
              const parts = formattedValue.split("-");
              table.options.meta.updateData(row.index, "dosage", formattedValue);
              table.options.meta.updateData(row.index, "morning_dosage", parts[0] || "0");
              table.options.meta.updateData(row.index, "afternoon_dosage", parts[1] || "0");
              table.options.meta.updateData(row.index, "night_dosage", parts[2] || "0");
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
    const newRow = {
      id: Date.now(),
      medicine_id: null,
      medicine_name: "",
      generic_name: "",
      strength: "",
      dosage: "",
      morning_dosage: "0",
      afternoon_dosage: "0",
      night_dosage: "0",
      food_timing: "",
      duration_days: "",
      special_instructions: "",
    };
    setData((prev) => [newRow, ...prev]);
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=650");
    win.document.write(`
      <html>
        <head>
          <title>Prescription Print</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .center-heading {
              text-align: center;
              color: #115E59;
              font-size: 1.5rem;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .patient-header {
              background-color: transparent;
              color: #000;
              padding: 0;
              margin-bottom: 20px;
              font-size: 1.1rem;
              line-height: 1.6;
            }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            table th {
              background-color: #115E59;
              color: white;
              padding: 8px;
              border: 1px solid #ccc;
              text-align: left;
            }
            table td { padding: 8px; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="center-heading">Apple Medical Center</div>
          <div class="patient-header">
            <strong>Patient ID:</strong> ${patientId || "-"} <br />
            <strong>Token No:</strong> ${tokenNumber || "-"} <br />
            <strong>Appointment No:</strong> ${appointmentId || "-"} <br />
            <strong>Name:</strong> ${patientName || "-"} <br />
            <strong>Appointment Date:</strong> ${appointmentDate || "-"}
          </div>
          ${printContent}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleDeleteRow = ({ row }) => {
    const filtered = data.filter((r) => r.id !== row.original.id);
    setData(filtered);
    // Update store
    setPrescriptions(
      filtered
        .filter((r) => r.medicine_id)
        .map((r) => ({
          medicine_id: r.medicine_id,
          morning_dosage: r.morning_dosage || "0",
          afternoon_dosage: r.afternoon_dosage || "0",
          night_dosage: r.night_dosage || "0",
          food_timing: r.food_timing || "",
          duration_days: r.duration_days || 0,
          special_instructions: r.special_instructions || "",
        }))
    );
  };
  
  // Sync data to store when editing is saved
  const syncToStore = () => {
    setPrescriptions(
      data
        .filter((r) => r.medicine_id)
        .map((r) => ({
          medicine_id: r.medicine_id,
          morning_dosage: r.morning_dosage || "0",
          afternoon_dosage: r.afternoon_dosage || "0",
          night_dosage: r.night_dosage || "0",
          food_timing: r.food_timing || "",
          duration_days: r.duration_days || 0,
          special_instructions: r.special_instructions || "",
        }))
    );
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
          syncToStore();
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
                        syncToStore();
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
                        syncToStore();
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

      {/* Hidden print table */}
      <div ref={printRef} style={{ display: "none" }}>
        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Generic Name</th>
              <th>Strength</th>
              <th>Dosage</th>
              <th>Food Timing</th>
              <th>Duration (Days)</th>
              <th>Special Instructions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  No prescription entries added
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id}>
                  <td>{row.medicine_name}</td>
                  <td>{row.generic_name}</td>
                  <td>{row.strength}</td>
                  <td>{row.dosage}</td>
                  <td>{row.food_timing}</td>
                  <td>{row.duration_days}</td>
                  <td>{row.special_instructions}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
