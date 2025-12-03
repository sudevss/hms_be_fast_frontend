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
} from "@mui/material";

import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const PrescriptionSection = () => {
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);

  // For delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const frequencyOptions = [
    "0-0-1",
    "0-1-0",
    "1-0-0",
    "1-1-0",
    "1-0-1",
    "0-1-1",
    "1-1-1",
  ];

  const timingOptions = ["Before Food", "After Food"];

  const columns = useMemo(
    () => [
      {
        accessorKey: "medicine_name",
        header: "Medicine Name",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(
                row.index,
                "medicine_name",
                e.target.value
              )
            }
          />
        ),
      },

      {
        accessorKey: "frequency",
        header: "Frequency",
        Cell: ({ row }) => row.original.frequency,
        Edit: ({ cell, row, table }) => (
          <TextField
            select
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(
                row.index,
                "frequency",
                e.target.value
              )
            }
          >
            {frequencyOptions.map((f) => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </TextField>
        ),
      },

      {
        accessorKey: "dosage",
        header: "Dosage",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "dosage", e.target.value)
            }
          />
        ),
      },

      {
        accessorKey: "timing",
        header: "Timing",
        Cell: ({ row }) => row.original.timing,
        Edit: ({ cell, row, table }) => (
          <TextField
            select
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "timing", e.target.value)
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

      {
        accessorKey: "duration",
        header: "Duration (Days)",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(
                row.index,
                "duration",
                e.target.value
              )
            }
          />
        ),
      },

      // --- NEW REMARKS COLUMN ---
      {
        accessorKey: "remarks",
        header: "Remarks",
        Cell: ({ row }) => row.original.remarks || "",
        Edit: ({ cell, row, table }) => (
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={cell.getValue() ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "remarks", e.target.value)
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
      medicine_name: "",
      frequency: "",
      dosage: "",
      timing: "",
      duration: "",
      remarks: "",
    };
    setData((prev) => [newRow, ...prev]);
  };

  const handlePrint = () => window.print();

  const handleDeleteRow = ({ row }) => {
    setData((prev) => prev.filter((r) => r.id !== row.original.id));
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
        <Box sx={{ fontWeight: 700, fontSize: "1.0rem" }}>Prescription</Box>
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
        meta={{
          updateData: (rowIndex, columnId, value) =>
            setData((prev) =>
              prev.map((row, index) =>
                index === rowIndex ? { ...row, [columnId]: value } : row
              )
            ),
        }}
        onEditingRowSave={({ row }) => {
          setData((prev) =>
            prev.map((r) =>
              r.id === row.original.id ? { ...row.original } : r
            )
          );
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

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
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
              if (rowToDelete) {
                handleDeleteRow({ row: rowToDelete });
              }
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
