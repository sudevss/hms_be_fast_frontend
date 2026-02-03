import { useMemo, useState, useRef } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const ProcedureSection = ({ patientId, patientName, tokenNumber, appointmentDate }) => {
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const printRef = useRef();

  const columns = useMemo(
    () => [
      { accessorKey: "procedure_name", header: "Procedure Name" },
      {
        accessorKey: "description",
        header: "Description",
        muiEditTextFieldProps: { multiline: true, rows: 1 },
      },
    ],
    []
  );

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      procedure_name: "",
      description: "",
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
            <strong>P_id:</strong> ${patientId || "-"} <br />
            <strong>Name:</strong> ${patientName || "-"} <br />
            <strong>Token Number:</strong> ${tokenNumber || "-"} <br />
            <strong>Appointment Date:</strong> ${appointmentDate || "-"}
          </div>
          ${printContent}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const confirmDelete = () => {
    setData((prev) => prev.filter((r) => r.id !== rowToDelete.original.id));
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

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
        <Box sx={{ fontWeight: 700, fontSize: "1.0rem" }}>Procedure</Box>

        <Box sx={{ display: "flex", gap: 1 }}>
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
        onEditingRowSave={({ row, values }) => {
          setData((prev) =>
            prev.map((r) => (r.id === row.original.id ? { ...r, ...values } : r))
          );
          setEditingRowId(null);
        }}
        enableSorting={true}
        enableColumnFilters={false}
        enableGlobalFilter={false}
        enableColumnActions={false}
        enableTopToolbar={false}
        enableBottomToolbar={false}
        enableFullScreenToggle={false}
        enableDensityToggle={false}
        enableHiding={false}
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
                        setDeleteDialogOpen(true);
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
              <th>Procedure Name</th>
              <th>Description</th>
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
                  <td>{row.procedure_name}</td>
                  <td>{row.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>

        <DialogContent>
          Are you sure you want to delete this procedure record?
        </DialogContent>

        <DialogActions>
          <StyledButton
            variant="outlined"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </StyledButton>
          <StyledButton
            variant="contained"
            color="error"
            onClick={confirmDelete}
          >
            Delete
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcedureSection;
