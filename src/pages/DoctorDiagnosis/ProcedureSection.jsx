import { useMemo, useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const ProcedureSection = () => {
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);

  const columns = useMemo(
    () => [
      { accessorKey: "procedure_name", header: "Procedure Name" },
      { accessorKey: "description", header: "Description", muiEditTextFieldProps: { multiline: true, rows: 1 } },
    ],
    []
  );

  const handleAddRow = () => {
    const newRow = { id: Date.now(), procedure_name: "", description: "" };
    setData((prev) => [newRow, ...prev]);
  };

  const handlePrint = () => window.print();

  const handleDeleteRow = ({ row }) => {
    setData((prev) => prev.filter((r) => r.id !== row.original.id));
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
        onEditingRowSave={({ row, values }) => {
          setData((prev) => prev.map((r) => (r.id === row.original.id ? { ...r, ...values } : r)));
          setEditingRowId(null);
        }}
        renderRowActions={({ row, table }) => {
          const isEditing = editingRowId === row.original.id;
          return (
            <Box sx={{ display: "flex", gap: 1 }}>
              {isEditing ? (
                <>
                  <Tooltip title="Save" arrow>
                    <IconButton size="small" onClick={() => { table.setEditingRow(null); setEditingRowId(null); }}>
                      <SaveIcon sx={{ color: "#115E59", fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel" arrow>
                    <IconButton size="small" onClick={() => { table.setEditingRow(null); setEditingRowId(null); }}>
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
                    <IconButton color="error" size="small" onClick={() => handleDeleteRow({ row })}>
                      <DeleteForeverIcon sx={{ fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          );
        }}
      />
    </Box>
  );
};

export default ProcedureSection;

