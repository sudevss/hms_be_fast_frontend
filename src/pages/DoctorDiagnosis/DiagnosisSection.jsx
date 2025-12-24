import { useMemo, useState } from "react";
import { Box, IconButton, Tooltip, TextField, Autocomplete } from "@mui/material";

import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import { postloadtemplate, getTemplatesList, getSymptomMasterList } from "@/serviceApis";
import { useQuery } from "@tanstack/react-query";
import { dayjs } from "@/utils/dateUtils";

const DiagnosisSection = () => {
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);

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
          symptom_name: symptom.symptom_name || "",
          duration_days:
            symptom.default_duration_days ?? symptom.duration_days ?? "",
          remarks: symptom.default_remarks ?? symptom.remarks ?? "",
        }));
      if (!mapped.length) setLoadError("No symptoms or already loaded");
      setData((prev) => [...prev, ...mapped]);
      
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
    setData((prev) => [
      {
        id: Date.now(),
        diagnosis_date: dayjs().format("YYYY-MM-DD"),
        symptom_name: "",
        duration_days: "",
        remarks: "",
      },
      ...prev,
    ]);
  };

  const handleDeleteRow = ({ row }) => {
    setData((prev) => prev.filter((r) => r.id !== row.original.id));
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
        meta={{
          updateData: (rowIndex, columnId, value) =>
            setData((prev) =>
              prev.map((row, index) =>
                index === rowIndex ? { ...row, [columnId]: value } : row
              )
            ),
        }}
        onEditingRowSave={({ row }) => {
          diagnosisStore.setSymptoms(
            data.map((r) => ({
              symptom_id: r.symptom_id,
              duration_days: r.duration_days,
              remarks: r.remarks,
            }))
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
                      <SaveIcon sx={{ color: "#115E59" }} />
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
                      <CancelIcon sx={{ color: "#dc2626" }} />
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
                      <EditOutlinedIcon sx={{ color: "#115E59" }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete" arrow>
                    <IconButton
                      size="small"
                      color="error"
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

export default DiagnosisSection;
