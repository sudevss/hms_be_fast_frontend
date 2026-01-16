import { useMemo, useState, useEffect, useRef } from "react";
import { Box, IconButton, Tooltip, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import AlertSnackbar from "@components/AlertSnackbar";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useProcedureStore } from "@/stores/procedureStore";

const ProcedureSection = ({ patientId, patientName, tokenNumber, appointmentDate, appointmentId, doctorName }) => {
  const procedureStore = useProcedureStore();
  const { procedures, setProcedures } = procedureStore;
  
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [procedureError, setProcedureError] = useState({ show: false, message: "", status: "error" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  
  const printRef = useRef();
  
  // Sync store with local data when procedures change externally
  useEffect(() => {
    if (procedures.length > 0 && data.length === 0) {
      // Only sync if data is empty (initial load)
      const tableData = procedures.map((procedure, index) => ({
        id: `procedure-${index}-${Date.now()}`,
        procedure_name: procedure.procedure_text || "",
        procedure_text: procedure.procedure_text || "",
        description: "",
        price: procedure.price || 0,
      }));
      setData(tableData);
    }
  }, [procedures]);

  const columns = useMemo(
    () => [
      { 
        accessorKey: "procedure_text", 
        header: "Procedure Name",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "procedure_text", e.target.value)
            }
          />
        ),
      },
      { 
        accessorKey: "price", 
        header: "Price",
        Edit: ({ cell, row, table }) => (
          <TextField
            type="number"
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "price", e.target.value)
            }
          />
        ),
      },
    ],
    []
  );

  const handleAddRow = () => {
    const newRow = { 
      id: Date.now(), 
      procedure_text: "", 
      description: "",
      price: 0,
    };
    setData((prev) => [newRow, ...prev]);
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=650");
    win.document.write(`
      <html>
        <head>
          <title>Procedures Print</title>
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
    // Allow passing row.original directly or the row wrapper
    const id = row?.original?.id ?? row?.id ?? null;
    if (!id) return;

    const filtered = data.filter((r) => r.id !== id);
    setData(filtered);
    // Update store
    setProcedures(
      filtered.map((r) => ({
        procedure_text: r.procedure_text || "",
        price: r.price || 0,
      }))
    );
  };
  
  // Sync data to store when editing is saved
  const syncToStore = () => {
    setProcedures(
      data.map((r) => ({
        procedure_text: r.procedure_text || "",
        price: r.price || 0,
      }))
    );
  };

  return (
    <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2, mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ fontWeight: 700, fontSize: "1.0rem" }}>Procedure</Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <StyledButton variant="outlined" onClick={handlePrint}>Print</StyledButton>
          <StyledButton variant="contained" onClick={handleAddRow}>Add</StyledButton>
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
        onEditingRowSave={({ row, values }) => {
          // Validate procedure text length
          const text = String(values.procedure_text || "").trim();
          if (text.length > 0 && text.length < 5) {
            setProcedureError({ show: true, message: "Procedure text must have at least 5 characters", status: "error" });
            return;
          }

          setData((prev) => prev.map((r) => (r.id === row.original.id ? { ...r, ...values } : r)));
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
                    <IconButton size="small" onClick={() => { syncToStore(); table.setEditingRow(null); setEditingRowId(null); }}>
                      <SaveIcon sx={{ color: "#115E59", fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel" arrow>
                    <IconButton size="small" onClick={() => { syncToStore(); table.setEditingRow(null); setEditingRowId(null); }}>
                      <CancelIcon sx={{ color: "#dc2626", fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Edit" arrow>
                    <IconButton size="small" onClick={() => { setEditingRowId(row.original.id); table.setEditingRow(row); }}>
                      <EditOutlinedIcon sx={{ color: "#115E59", fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete" arrow>
                    <IconButton color="error" size="small" onClick={() => { setRowToDelete(row.original); setDeleteConfirmOpen(true); }}>
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
              <th>Procedure Name</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  No procedures added
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id}>
                  <td>{row.procedure_text}</td>
                  <td>{row.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertSnackbar
        showAlert={procedureError.show}
        message={procedureError.message}
        severity={procedureError.status}
        onClose={() => setProcedureError({ show: false, message: "", status: "error" })}
      />

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>
          Are you sure you want to delete this procedure?
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

export default ProcedureSection;
