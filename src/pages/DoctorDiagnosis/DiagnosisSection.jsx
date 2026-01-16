import { useMemo, useState, useEffect, useRef } from "react";
import { Box, IconButton, Tooltip, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import { postloadtemplate, getTemplatesList, getSymptomMasterList } from "@/serviceApis";
import { useQuery } from "@tanstack/react-query";
import { dayjs } from "@/utils/dateUtils";
import { useDiagnosisStore } from "@/stores/diagnosisStore";

const DiagnosisSection = ({ patientId, patientName, tokenNumber, appointmentDate, appointmentId, doctorName }) => {
  const diagnosisStore = useDiagnosisStore();
  const { symptoms, setSymptoms } = diagnosisStore;
  
  // Convert store data to table format
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const printRef = useRef();

  const [selectedTemplateOption, setSelectedTemplateOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const { data: templateOptions = [] } = useQuery({
    queryKey: ["queryGetTemplatesList"],
    queryFn: () => getTemplatesList(),
    enabled: true,
  });

  const { data: symptomOptions = [] } = useQuery({
    queryKey: ["queryGetSymptomMaster"],
    queryFn: () => getSymptomMasterList(),
    enabled: true,
  });
  
  // Sync store with local data when symptoms change externally
  useEffect(() => {
    if (symptoms.length > 0 && data.length === 0 && symptomOptions.length > 0) {
      // Only sync if data is empty (initial load)
      const tableData = symptoms.map((symptom, index) => {
        const symptomOption = symptomOptions.find(s => s.symptom_id === symptom.symptom_id);
        return {
          id: `symptom-${index}-${Date.now()}`,
          diagnosis_date: dayjs().format("YYYY-MM-DD"),
          symptom_id: symptom.symptom_id,
          symptom_name: symptomOption?.symptom_name || "",
          duration_days: symptom.duration_days || "",
          remarks: symptom.remarks || "",
        };
      });
      setData(tableData);
    }
  }, [symptoms, symptomOptions]);

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
      const symptoms = apiTemplate?.symptoms || [];
      const existingNames = new Set(data.map((row) => row.symptom_name));
      const mapped = symptoms
        .filter((sym) => !existingNames.has(sym.symptom_name))
        .map((symptom, index) => ({
          id: `symptom-${selected.template_id}-${index}-${Date.now()}`,
          diagnosis_date: dayjs().format("YYYY-MM-DD"),
          symptom_id: symptom.symptom_id,
          symptom_name: symptom.symptom_name || "",
          duration_days:
            symptom.default_duration_days ?? symptom.duration_days ?? "",
          remarks: symptom.default_remarks ?? symptom.remarks ?? "",
        }));
      if (!mapped.length) setLoadError("No symptoms or already loaded");
      setData((prev) => [...prev, ...mapped]);
      
      // Update store
      const newSymptoms = mapped
        .filter((m) => m.symptom_id)
        .map((m) => ({
          symptom_id: m.symptom_id,
          duration_days: m.duration_days || 0,
          remarks: m.remarks || "",
        }));
      setSymptoms([...diagnosisStore.symptoms, ...newSymptoms]);
      
    } catch (e) {
      setLoadError("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomSelect = (rowIndex, selectedSymptom) => {
    setData((prev) =>
      prev.map((row, idx) => {
        if (idx === rowIndex) {
          if (selectedSymptom) {
            return {
              ...row,
              symptom_id: selectedSymptom.symptom_id,
              symptom_name: selectedSymptom.symptom_name,
              duration_days:
                selectedSymptom.default_duration_days ?? selectedSymptom.duration_days ?? row.duration_days,
              remarks:
                selectedSymptom.default_remarks ?? selectedSymptom.remarks ?? row.remarks,
            };
          } else {
            return row;
          }
        }
        return row;
      })
    );
    
  };


  // ---------------------------------------------------------------
  // TABLE COLUMNS
  // ---------------------------------------------------------------
  const columns = useMemo(
    () => [
      {
        accessorKey: "diagnosis_date",
        header: "Diagnosis Date",
        Edit: ({ cell, row, table }) => (
          <TextField
            type="date"
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "diagnosis_date", e.target.value)
            }
            inputProps={{
              max: dayjs().format("YYYY-MM-DD"),
            }}
          />
        ),
      },
      {
        accessorKey: "symptom_name",
        header: "Symptom",
        Edit: ({ cell, row, table }) => {
          const selected = symptomOptions.find(
            (s) => s.symptom_name === cell.getValue()
          ) || null;

          return (
            <Autocomplete
              fullWidth
              size="small"
              options={symptomOptions}
              filterOptions={(options, state) =>
                options.filter((opt) =>
                  opt.symptom_name?.toLowerCase().includes(state.inputValue.toLowerCase())
                )
              }
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.symptom_name
              }
              isOptionEqualToValue={(option, value) => option.symptom_name === (value?.symptom_name || value) }
              value={selected}
              inputValue={cell.getValue() || ""}
              onInputChange={(event, value) => {
                table.options.meta.updateData(row.index, "symptom_name", value);
              }}
              onChange={(event, selectedSymptom) => {
                handleSymptomSelect(row.index, selectedSymptom);
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Search symptom..." />
              )}
            />
          );
        },
      },
      {
        accessorKey: "duration_days",
        header: "Duration (Days)",
        Edit: ({ cell, row, table }) => (
          <TextField
            type="number"
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(
                row.index,
                "duration_days",
                e.target.value
              )
            }
          />
        ),
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            multiline
            minRows={1}
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(
                row.index,
                "remarks",
                e.target.value
              )
            }
          />
        ),
      },
    ],
    [symptomOptions]
  );

  // ---------------------------------------------------------------
  // ACTION BUTTONS
  // ---------------------------------------------------------------
  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      diagnosis_date: dayjs().format("YYYY-MM-DD"),
      symptom_id: null,
      symptom_name: "",
      duration_days: "",
      remarks: "",
    };
    setData((prev) => [newRow, ...prev]);
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=650");
    win.document.write(`
      <html>
        <head>
          <title>Diagnosis Print</title>
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
            <strong>Appointment Date:</strong> ${appointmentDate || "-"} <br />
            <strong>Prescribed Doctor:</strong> ${doctorName || "-"}
          </div>
          ${printContent}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleDeleteRow = ({ row } = {}) => {
    const id = row?.original?.id ?? row?.id ?? null;
    if (!id) return;

    const filtered = data.filter((r) => r.id !== id);
    setData(filtered);
    // Update store
    setSymptoms(
      filtered
        .filter((r) => r.symptom_id)
        .map((r) => ({
          symptom_id: r.symptom_id,
          duration_days: r.duration_days,
          remarks: r.remarks,
        }))
    );
  };
  
  // Sync data to store when editing is saved
  const syncToStore = () => {
    setSymptoms(
      data
        .filter((r) => r.symptom_id)
        .map((r) => ({
          symptom_id: r.symptom_id,
          duration_days: r.duration_days || 0,
          remarks: r.remarks || "",
        }))
    );
  };

  return (
    <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2, mt: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ fontWeight: 700, fontSize: "1rem" }}>Diagnosis</Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Autocomplete
            options={templateOptions}
            value={selectedTemplateOption}
            onChange={(e, val) => handleTemplateSelect(val)}
            isOptionEqualToValue={(opt, val) => opt?.template_id === val?.template_id}
            getOptionLabel={(opt) => opt?.template_name || ""}
            filterOptions={(options, state) =>
              options.filter((o) =>
                (o?.template_name || "").toLowerCase().includes(state.inputValue.toLowerCase())
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

      {/* TABLE */}
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
                      <EditOutlinedIcon sx={{ color: "#115E59", fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete" arrow>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => { setRowToDelete(row.original); setDeleteConfirmOpen(true); }}
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
              <th>Diagnosis Date</th>
              <th>Symptom</th>
              <th>Duration (Days)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No diagnosis entries added
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id}>
                  <td>{row.diagnosis_date}</td>
                  <td>{row.symptom_name}</td>
                  <td>{row.duration_days}</td>
                  <td>{row.remarks}</td>
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
          Are you sure you want to delete this diagnosis entry?
        </DialogContent>

        <DialogActions>
          <StyledButton variant="outlined" onClick={() => setDeleteConfirmOpen(false)}>Cancel</StyledButton>
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

export default DiagnosisSection;
