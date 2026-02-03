import { useMemo, useState, useRef } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import { dayjs } from "@/utils/dateUtils";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  postloadtemplate,
  getTemplatesList,
  getSymptomMasterList,
} from "@/serviceApis";
import { useQuery } from "@tanstack/react-query";

const DiagnosisSection = ({
  patientId,
  patientName,
  tokenNumber,
  appointmentDate,
}) => {
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [loadError, setLoadError] = useState("");

  const printRef = useRef();

  /* -------------------- API QUERIES -------------------- */

  const { data: templateOptions = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplatesList,
  });

  const { data: symptomOptions = [] } = useQuery({
    queryKey: ["symptoms"],
    queryFn: getSymptomMasterList,
  });

  /* -------------------- HANDLERS -------------------- */

  const handleAddRow = () => {
    setData((prev) => [
      {
        id: Date.now(),
        diagnosis_date: dayjs().format("YYYY-MM-DD"),
        symptom_id: null,
        symptom_name: "",
        duration_days: "",
        remarks: "",
      },
      ...prev,
    ]);
  };

  const handleDeleteRow = () => {
    if (!rowToDelete) return;
    setData((prev) => prev.filter((r) => r.id !== rowToDelete.original.id));
    setDeleteConfirmOpen(false);
    setRowToDelete(null);
  };

  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template);
    setLoadError("");
    if (!template) return;

    setLoadingTemplate(true);
    try {
      const res = await postloadtemplate({
        template_id: template.template_id,
        template_name: template.template_name,
      });

      const symptoms = res?.data?.symptoms || [];
      const existing = new Set(data.map((d) => d.symptom_name));

      const mapped = symptoms
        .filter((s) => !existing.has(s.symptom_name))
        .map((s, idx) => ({
          id: `${template.template_id}-${idx}-${Date.now()}`,
          diagnosis_date: dayjs().format("YYYY-MM-DD"),
          symptom_id: s.symptom_id,
          symptom_name: s.symptom_name,
          duration_days: s.default_duration_days || "",
          remarks: s.default_remarks || "",
        }));

      if (!mapped.length) {
        setLoadError("No new symptoms found");
      } else {
        setData((prev) => [...prev, ...mapped]);
      }
    } catch {
      setLoadError("Failed to load template");
    } finally {
      setLoadingTemplate(false);
    }
  };

  /* -------------------- TABLE COLUMNS -------------------- */

  const columns = useMemo(
    () => [
      {
        accessorKey: "diagnosis_date",
        header: "Diagnosis Date",
        Edit: ({ cell, row, table }) => (
          <TextField
            type="date"
            fullWidth
            value={cell.getValue() || ""}
            inputProps={{ max: dayjs().format("YYYY-MM-DD") }}
            onChange={(e) =>
              table.options.meta.updateData(
                row.index,
                "diagnosis_date",
                e.target.value
              )
            }
          />
        ),
      },
      {
        accessorKey: "symptom_name",
        header: "Symptom",
        Edit: ({ cell, row, table }) => {
          const selected =
            symptomOptions.find((s) => s.symptom_name === cell.getValue()) ||
            null;

          return (
            <Autocomplete
              options={symptomOptions}
              value={selected}
              getOptionLabel={(o) => o.symptom_name}
              isOptionEqualToValue={(a, b) => a.symptom_id === b.symptom_id}
              onChange={(_, val) => {
                if (!val) return;
                table.options.meta.updateData(
                  row.index,
                  "symptom_name",
                  val.symptom_name
                );
                table.options.meta.updateData(
                  row.index,
                  "symptom_id",
                  val.symptom_id
                );
                table.options.meta.updateData(
                  row.index,
                  "duration_days",
                  val.default_duration_days || ""
                );
                table.options.meta.updateData(
                  row.index,
                  "remarks",
                  val.default_remarks || ""
                );
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Search symptom" />
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
            value={cell.getValue() || ""}
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
            value={cell.getValue() || ""}
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

  /* -------------------- PRINT -------------------- */

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Diagnosis</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; }
            th { background: #115E59; color: white; }
          </style>
        </head>
        <body>
          <h2>Diagnosis</h2>
          <p>
            <strong>ID:</strong> ${patientId}<br/>
            <strong>Name:</strong> ${patientName}<br/>
            <strong>Token:</strong> ${tokenNumber}<br/>
            <strong>Date:</strong> ${appointmentDate}
          </p>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  /* -------------------- RENDER -------------------- */

  return (
    <Box sx={{ border: "1px solid #e5e7eb", p: 2, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ fontWeight: 700 }}>Diagnosis</Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Autocomplete
            options={templateOptions}
            value={selectedTemplate}
            onChange={(_, val) => handleTemplateSelect(val)}
            getOptionLabel={(o) => o.template_name}
            sx={{ width: 280 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Template"
                size="small"
                error={!!loadError}
                helperText={loadError}
              />
            )}
          />

          <StyledButton onClick={handleAddRow}>Add</StyledButton>
          <StyledButton variant="outlined" onClick={handlePrint}>
            Print
          </StyledButton>
        </Box>
      </Box>

      {/* Table */}
      <MaterialReactTable
        columns={columns}
        data={data}
        enableEditing
        editDisplayMode="row"
        meta={{
          updateData: (rowIndex, columnId, value) =>
            setData((prev) =>
              prev.map((r, i) =>
                i === rowIndex ? { ...r, [columnId]: value } : r
              )
            ),
        }}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            {editingRowId === row.original.id ? (
              <>
                <IconButton
                  onClick={() => {
                    table.setEditingRow(null);
                    setEditingRowId(null);
                  }}
                >
                  <SaveIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    table.setEditingRow(null);
                    setEditingRowId(null);
                  }}
                >
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  onClick={() => {
                    setEditingRowId(row.original.id);
                    table.setEditingRow(row);
                  }}
                >
                  <EditOutlinedIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => {
                    setRowToDelete(row);
                    setDeleteConfirmOpen(true);
                  }}
                >
                  <DeleteForeverIcon />
                </IconButton>
              </>
            )}
          </Box>
        )}
      />

      {/* Print Table */}
      <div ref={printRef} style={{ display: "none" }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Symptom</th>
              <th>Duration</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id}>
                <td>{d.diagnosis_date}</td>
                <td>{d.symptom_name}</td>
                <td>{d.duration_days}</td>
                <td>{d.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this entry?
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </StyledButton>
          <StyledButton color="error" onClick={handleDeleteRow}>
            Delete
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DiagnosisSection;
