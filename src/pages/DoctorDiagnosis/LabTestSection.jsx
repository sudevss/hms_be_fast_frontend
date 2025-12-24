import { useMemo, useState } from "react";
import { Box, Tooltip, IconButton, TextField, Autocomplete } from "@mui/material";
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

  const [selectedTemplateOption, setSelectedTemplateOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const { data: labOptions = [] } = useQuery({
    queryKey: ["queryGetLabMaster"],
    queryFn: () => getLabMasterList(),
  });

  const { data: templateOptions = [] } = useQuery({
    queryKey: ["queryGetTemplatesList"],
    queryFn: () => getTemplatesList(),
  });

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

      setData((prev) => [...prev, ...mapped]);
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
            prerequisite_text: selectedLabTest.prerequisite_text || "",
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
          const currentValue = (cell.getValue() ?? "")
            .trim()
            .toLowerCase();

          const selectedOption =
            labOptions.find(
              (t) =>
                t.test_name?.trim().toLowerCase() === currentValue
            ) || null;

          return (
            <Autocomplete
              fullWidth
              size="small"
              options={labOptions}
              value={selectedOption}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.test_name
              }
              isOptionEqualToValue={(option, value) =>
                option?.test_name?.trim().toLowerCase() ===
                value?.test_name?.trim().toLowerCase()
              }
              onChange={(event, selectedLabTest) => {
                if (!selectedLabTest) {
                  table.options.meta.updateData(row.index, "test_name", "");
                  return;
                }
                handleLabTestSelect(row.index, selectedLabTest);
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
    setData((prev) => [
      {
        id: Date.now(),
        test_name: "",
        prerequisite_text: "",
      },
      ...prev,
    ]);
  };

  const handleDeleteRow = ({ row }) => {
    setData((prev) => prev.filter((r) => r.id !== row.original.id));
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

          <StyledButton variant="outlined" onClick={() => window.print()}>
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
                        table.setEditingRow(null);
                        setEditingRowId(null);
                      }}
                    >
                      <SaveIcon sx={{ color: "#115E59", fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Cancel">
                    <IconButton
                      size="small"
                      onClick={() => {
                        table.setEditingRow(null);
                        setEditingRowId(null);
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
                      onClick={() => handleDeleteRow({ row })}
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
    </Box>
  );
};

export default LabTestSection;
