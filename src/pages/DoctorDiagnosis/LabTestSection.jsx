import { useMemo, useState } from "react";
import {
  Box,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";

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

const LabTestSection = () => {
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  /* -------------------- QUERIES -------------------- */

  const { data: labOptions = [] } = useQuery({
    queryKey: ["lab-master"],
    queryFn: getLabMasterList,
  });

  const { data: templateOptions = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplatesList,
  });

  /* ---------------- TEMPLATE LOAD ---------------- */

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

      const labTests = res?.data?.lab_tests || [];
      const existing = new Set(
        data.map((r) => r.test_name?.trim().toLowerCase())
      );

      const mapped = labTests
        .filter((t) => !existing.has(t.test_name?.trim().toLowerCase()))
        .map((t, idx) => ({
          id: `${template.template_id}-${idx}-${Date.now()}`,
          test_id: t.test_id,
          test_name: t.test_name,
          prerequisite_text: t.prerequisite_text || "",
          description: t.description || "",
        }));

      if (!mapped.length) {
        setLoadError("No new lab tests found");
      } else {
        setData((prev) => [...prev, ...mapped]);
      }
    } catch {
      setLoadError("Failed to load template");
    } finally {
      setLoadingTemplate(false);
    }
  };

  /* ---------------- TABLE COLUMNS ---------------- */

  const columns = useMemo(
    () => [
      {
        accessorKey: "test_name",
        header: "Lab Test",
        Edit: ({ row, table, cell }) => {
          const selected =
            labOptions.find(
              (l) =>
                l.test_name?.toLowerCase() === cell.getValue()?.toLowerCase()
            ) || null;

          return (
            <Autocomplete
              options={labOptions}
              value={selected}
              getOptionLabel={(o) => o.test_name}
              isOptionEqualToValue={(a, b) => a.test_id === b.test_id}
              onChange={(_, val) => {
                if (!val) return;
                table.options.meta.updateData(
                  row.index,
                  "test_name",
                  val.test_name
                );
                table.options.meta.updateData(
                  row.index,
                  "test_id",
                  val.test_id
                );
                table.options.meta.updateData(
                  row.index,
                  "prerequisite_text",
                  val.prerequisite_text || ""
                );
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Search lab test" />
              )}
            />
          );
        },
      },
      {
        accessorKey: "prerequisite_text",
        header: "Prerequisite",
        Edit: ({ row, table, cell }) => (
          <TextField
            fullWidth
            value={cell.getValue() || ""}
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

  /* ---------------- ACTIONS ---------------- */

  const handleAddRow = () => {
    setData((prev) => [
      {
        id: Date.now(),
        test_id: null,
        test_name: "",
        prerequisite_text: "",
      },
      ...prev,
    ]);
  };

  const confirmDelete = () => {
    setData((prev) => prev.filter((r) => r.id !== rowToDelete?.original?.id));
    setDeleteOpen(false);
    setRowToDelete(null);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <Box sx={{ border: "1px solid #e5e7eb", p: 2, mt: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ fontWeight: 700 }}>Lab Tests</Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Autocomplete
            options={templateOptions}
            value={selectedTemplate}
            onChange={(_, val) => handleTemplateSelect(val)}
            getOptionLabel={(o) => o.template_name}
            sx={{ width: 260 }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Template"
                disabled={loadingTemplate}
                error={!!loadError}
                helperText={loadError}
              />
            )}
          />

          <StyledButton variant="contained" onClick={handleAddRow}>
            Add
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
        renderRowActions={({ row, table }) => {
          const isEditing = editingRowId === row.original.id;

          return (
            <Box sx={{ display: "flex", gap: 1 }}>
              {isEditing ? (
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
                      setDeleteOpen(true);
                    }}
                  >
                    <DeleteForeverIcon />
                  </IconButton>
                </>
              )}
            </Box>
          );
        }}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this lab test?
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setDeleteOpen(false)}>
            Cancel
          </StyledButton>
          <StyledButton color="error" onClick={confirmDelete}>
            Delete
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabTestSection;
