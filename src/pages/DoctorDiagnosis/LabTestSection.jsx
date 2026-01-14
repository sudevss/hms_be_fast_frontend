import { useMemo, useState, useEffect, useRef } from "react";
import { Box, Tooltip, IconButton, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import AlertSnackbar from "@components/AlertSnackbar";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  postloadtemplate,
  getTemplatesList,
  getLabMasterList,
} from "@/serviceApis";
import { useQuery } from "@tanstack/react-query";
import { useLabTestStore } from "@/stores/labTestStore";

const LabTestSection = ({ patientId, patientName, tokenNumber, appointmentDate, appointmentId }) => {
  const labTestStore = useLabTestStore();
  const { labTests, setLabTests } = labTestStore;
  
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [labError, setLabError] = useState({ show: false, message: "", status: "error" });
  const [originalRowData, setOriginalRowData] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  
  const printRef = useRef();
  
  const { data: labOptions = [] } = useQuery({
    queryKey: ["queryGetLabMaster"],
    queryFn: () => getLabMasterList(),
  });

  // Sync store with local data when labTests change externally
  useEffect(() => {
    if (labTests.length > 0 && data.length === 0 && labOptions.length > 0) {
      const tableData = labTests.map((labTest, index) => {
        const labOption = labOptions.find(lt => lt.test_id === labTest.test_id);
        return {
          id: `labtest-${index}-${Date.now()}`,
          test_id: labTest.test_id,
          test_name: labOption?.test_name || "",
          prerequisite_text: labTest.prerequisite_text || "",
          description: labOption?.description || "",
        };
      });
      setData(tableData);
    }
  }, [labTests, labOptions]);

  const [selectedTemplateOption, setSelectedTemplateOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const { data: templateOptions = [] } = useQuery({
    queryKey: ["queryGetTemplatesList"],
    queryFn: () => getTemplatesList(),
  });

  // ---------------- PRINT HANDLER ----------------
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=650");
    win.document.write(`
      <html>
        <head>
          <title>Lab Tests Print</title>
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

  // ---------------- TEMPLATE LOADING ----------------
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
      const labTests = apiTemplate?.lab_tests || [];

      const existing = new Set(
        data.map((r) => (r.test_name || "").trim().toLowerCase())
      );

      const mapped = labTests
        .filter(
          (test) =>
            !existing.has((test.test_name || "").trim().toLowerCase())
        )
        .map((test, index) => ({
          id: `lab-${selected.template_id}-${index}-${Date.now()}`,
          test_id: test.test_id,
          test_name: test.test_name || "",
          prerequisite_text: test.prerequisite_text || "",
          description: test.description || "",
        }));

      if (!mapped.length) setLoadError("No lab tests or already loaded");

      const newData = [...data, ...mapped];
      setData(newData);
      
      // Immediately sync new template data to store
      syncToStore(newData);
    } catch (e) {
      setLoadError("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- AUTOFILL HANDLER ----------------
  const handleLabTestSelect = (rowIndex, selectedLabTest) => {
    if (!selectedLabTest) return;

    setData((prev) =>
      prev.map((row, idx) => {
        if (idx === rowIndex) {
          return {
            ...row,
            test_id: selectedLabTest.test_id,
            test_name: selectedLabTest.test_name,
            description: selectedLabTest.description || "",
            prerequisite_text: row.prerequisite_text || selectedLabTest.prerequisite_text || "",
          };
        }
        return row;
      })
    );
  };

  // ---------------- TABLE COLUMNS ----------------
  const columns = useMemo(
    () => [
      {
        accessorKey: "test_name",
        header: "Lab Test",
        Edit: ({ cell, row, table }) => {
          const selected = labOptions.find(
            (t) => t.test_name === cell.getValue()
          ) || null;

          return (
            <Autocomplete
              fullWidth
              size="small"
              options={labOptions}
              value={selected}
              inputValue={cell.getValue() || ""}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.test_name
              }
              isOptionEqualToValue={(option, value) =>
                option?.test_name === (value?.test_name || value)
              }
              onInputChange={(event, value) => {
                table.options.meta.updateData(row.index, "test_name", value);
              }}
              onChange={(event, selectedLabTest) => {
                if (selectedLabTest) {
                  handleLabTestSelect(row.index, selectedLabTest);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Search lab test..." />
              )}
            />
          );
        },
      },

      {
        accessorKey: "prerequisite_text",
        header: "Prerequisite",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(
                row.index,
                "prerequisite_text",
                e.target.value
              )
            }
          />
        ),
      },
    ],
    [labOptions]
  );

  // --------------- ADD ROW ----------------
  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      test_id: null,
      test_name: "",
      prerequisite_text: "",
      description: "",
    };
    setData((prev) => [newRow, ...prev]);
  };

  const handleDeleteRow = ({ row } = {}) => {
    // Accept either a wrapped row ({ row }) or a raw row object
    const id = row?.original?.id ?? row?.id ?? null;
    if (!id) return;

    const filtered = data.filter((r) => r.id !== id);
    setData(filtered);
    // Update store immediately
    syncToStore(filtered);
  };
  
  // Sync data to store
  const syncToStore = (dataToSync = data) => {
    setLabTests(
      dataToSync
        .filter((r) => r.test_id)
        .map((r) => ({
          test_id: r.test_id,
          prerequisite_text: r.prerequisite_text || "",
        }))
    );
  };

  // Validate row before saving
  const validateRow = (rowData) => {
    if (!rowData.test_name || !rowData.test_name.trim()) {
      setLabError({ 
        show: true, 
        message: "Please select a lab test", 
        status: "error" 
      });
      return false;
    }

    if (!rowData.test_id) {
      const typedName = rowData.test_name.trim().toLowerCase();
      const match = labOptions.find(
        (t) => (t.test_name || "").trim().toLowerCase() === typedName
      );

      if (!match) {
        setLabError({ 
          show: true, 
          message: "Please select a valid lab test from the dropdown list", 
          status: "error" 
        });
        return false;
      }

      // Auto-fix: Update the row with matched data
      setData((prev) =>
        prev.map((r) =>
          r.id === rowData.id
            ? {
                ...r,
                test_id: match.test_id,
                test_name: match.test_name,
                description: match.description || "",
              }
            : r
        )
      );
    }

    return true;
  };

  return (
    <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2, mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ fontWeight: 700, fontSize: "1rem" }}>Lab Tests</Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Autocomplete
            options={templateOptions}
            value={selectedTemplateOption}
            onChange={(e, val) => handleTemplateSelect(val)}
            isOptionEqualToValue={(opt, val) =>
              opt?.template_id === val?.template_id
            }
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
          const rowData = data.find((r) => r.id === row.original.id);
          
          if (rowData && validateRow(rowData)) {
            // Small delay to ensure state updates complete
            setTimeout(() => {
              syncToStore();
              setEditingRowId(null);
              setLabError({ show: false, message: "", status: "error" });
            }, 0);
          }
        }}
        renderRowActions={({ row, table }) => {
          const isEditing = editingRowId === row.original.id;

          return (
            <Box sx={{ display: "flex", gap: 1 }}>
              {isEditing ? (
                <>
                  <Tooltip title="Save">
                    <IconButton
                      size="small"
                      onClick={() => {
                        const rowData = data.find((r) => r.id === row.original.id);
                        
                        if (rowData && validateRow(rowData)) {
                          setTimeout(() => {
                            syncToStore();
                            table.setEditingRow(null);
                            setEditingRowId(null);
                            setOriginalRowData(null);
                            setLabError({ show: false, message: "", status: "error" });
                          }, 0);
                        }
                      }}
                    >
                      <SaveIcon sx={{ color: "#115E59", fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Cancel">
                    <IconButton
                      size="small"
                      onClick={() => {
                        // Restore original data
                        if (originalRowData) {
                          setData((prev) =>
                            prev.map((r) => (r.id === row.original.id ? originalRowData : r))
                          );
                        }
                        table.setEditingRow(null);
                        setEditingRowId(null);
                        setOriginalRowData(null);
                        setLabError({ show: false, message: "", status: "error" });
                      }}
                    >
                      <CancelIcon sx={{ color: "#dc2626" }} />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => {
                        // Store original data before editing
                        setOriginalRowData({ ...row.original });
                        setEditingRowId(row.original.id);
                        table.setEditingRow(row);
                      }}
                    >
                      <EditOutlinedIcon sx={{ color: "#115E59" }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => { setRowToDelete(row.original); setDeleteConfirmOpen(true); }}
                    >
                      <DeleteForeverIcon />
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
              <th>Lab Test Name</th>
              <th>Prerequisite</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  No lab tests added
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id}>
                  <td>{row.test_name}</td>
                  <td>{row.prerequisite_text}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertSnackbar
        showAlert={labError.show}
        message={labError.message}
        severity={labError.status}
        onClose={() => setLabError({ show: false, message: "", status: "error" })}
      />

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>
          Are you sure you want to delete this lab test entry?
        </DialogContent>

        <DialogActions>
          <StyledButton variant="outlined" onClick={() => setDeleteConfirmOpen(false)}>
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

export default LabTestSection;
