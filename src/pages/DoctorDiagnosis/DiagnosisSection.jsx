import { useMemo, useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import { dayjs } from "@/utils/dateUtils";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const DiagnosisSection = () => {
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: "diagnosis_date",
        header: "Diagnosis Date",
        muiEditTextFieldProps: {
          type: "date",
          slotProps: {
            input: {
              max: dayjs().format("YYYY-MM-DD"),
            },
          },
        },
        Cell: ({ cell }) => dayjs(cell.getValue()).format("YYYY-MM-DD"),
      },
      {
        accessorKey: "chief_complaint",
        header: "Chief Complaint",
        muiEditTextFieldProps: { multiline: true, rows: 1 },
      },
      {
        accessorKey: "assessment_notes",
        header: "Assessment Notes",
        muiEditTextFieldProps: { multiline: true, rows: 1 },
      },
      {
        accessorKey: "treatment_plan",
        header: "Treatment Plan",
        muiEditTextFieldProps: { multiline: true, rows: 1 },
      },
      {
        accessorKey: "recomm_tests",
        header: "Recommended Tests",
        muiEditTextFieldProps: { multiline: true, rows: 1 },
      },
    ],
    []
  );

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      diagnosis_date: dayjs().format("YYYY-MM-DD"),
      chief_complaint: "",
      assessment_notes: "",
      treatment_plan: "",
      recomm_tests: "",
    };
    setData((prev) => [newRow, ...prev]);
  };

  const handlePrint = () => window.print();

  // Save row changes
  const handleSaveRow = ({ row, values }) => {
    setData((prev) =>
      prev.map((r) => (r.id === row.original.id ? { ...r, ...values } : r))
    );

    setEditingRowId(null);
  };

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
          mb: 2,
        }}
      >
        <Box sx={{ fontWeight: 700, fontSize: "1rem" }}>Diagnosis</Box>

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
        editDisplayMode="row" // <<—— KEY LINE (Enables row editing)

        onEditingRowSave={handleSaveRow}

        renderRowActions={({ row, table }) => {
          const isEditing = editingRowId === row.original.id;

          return (
            <Box sx={{ display: "flex", gap: 1 }}>
            {isEditing ? (
              <>
              {/* SAVE BUTTON */}
              <Tooltip title="Save" arrow>
                <IconButton
                  size="small"
                  onClick={() => {
                    table.setEditingRow(null);   // <-- makes cells non-editable
                    setEditingRowId(null);       // <-- shows edit/delete again
                  }}
                >
                  <SaveIcon sx={{ color: "#115E59", fontSize: "1.25rem" }} />
                </IconButton>
              </Tooltip>

              {/* CANCEL BUTTON */}
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
            {/* EDIT BUTTON */}
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

            {/* DELETE BUTTON */}
            <Tooltip title="Delete" arrow>
              <IconButton
                color="error"
                size="small"
                onClick={() => handleDeleteRow({ row })}
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
      </Box>
    );
  };

export default DiagnosisSection;
