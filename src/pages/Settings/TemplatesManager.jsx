import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";

import StyledButton from "@components/StyledButton";
import AlertSnackbar from "@components/AlertSnackbar";
import PageLoader from "@pages/PageLoader";
import { userLoginDetails } from "@/stores/LoginStore";
import {
  deleteTemplate,
  getDrugMasterList,
  getLabMasterList,
  getSymptomMasterList,
  getTemplateById,
  getTemplatesList,
  postCreateTemplate,
  putUpdateTemplate,
} from "@/serviceApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import PrescriptionSection from "./PrescriptionSection";

const emptyTemplate = (facility_id) => ({
  template_name: "",
  template_type: "",
  description: "",
  facility_id: facility_id || 1,
  is_active: true,
  lab_tests: [],
  prescriptions: [],
  symptoms: [],
});

function TemplatesManager() {
  const queryClient = useQueryClient();
  const { facility_id } = userLoginDetails();
  const effectiveFacilityId = Number(facility_id) || 1;

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateDraft, setTemplateDraft] = useState(() => emptyTemplate(effectiveFacilityId));

  const [editingRxRowId, setEditingRxRowId] = useState(null);
  const [editingSymRowId, setEditingSymRowId] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", status: "success" });

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["templatesList"],
    queryFn: () => getTemplatesList(),
  });

  const { data: drugOptions = [], isLoading: isLoadingDrugMaster } = useQuery({
    queryKey: ["drugMaster"],
    queryFn: () => getDrugMasterList(),
  });

  const { data: labOptions = [], isLoading: isLoadingLabMaster } = useQuery({
    queryKey: ["labMaster"],
    queryFn: () => getLabMasterList(),
  });

  const { data: symptomOptions = [], isLoading: isLoadingSymptomMaster } = useQuery({
    queryKey: ["symptomMaster"],
    queryFn: () => getSymptomMasterList(),
  });

  const templateDetailsQuery = useQuery({
    queryKey: ["templateById", selectedTemplateId],
    queryFn: () => getTemplateById({ template_id: selectedTemplateId }),
    enabled: Boolean(selectedTemplateId),
  });

  const templateFromApi = templateDetailsQuery.data ?? null;

  // Normalize + hydrate draft on selection
  useEffect(() => {
    if (!selectedTemplateId) {
      setTemplateDraft(emptyTemplate(effectiveFacilityId));
      return;
    }
    if (!templateFromApi) return;

    // The API response could be nested in 'data'
    const apiT = templateFromApi?.data ?? templateFromApi;
    
    // Safety check for array properties
    const safeLabTests = Array.isArray(apiT?.lab_tests) ? apiT.lab_tests : [];
    const safePrescriptions = Array.isArray(apiT?.prescriptions) ? apiT.prescriptions : [];
    const safeSymptoms = Array.isArray(apiT?.symptoms) ? apiT.symptoms : [];

    const normalized = {
      template_id: apiT?.template_id ?? selectedTemplateId,
      template_name: apiT?.template_name ?? "",
      template_type: apiT?.template_type ?? "",
      description: apiT?.description ?? "",
      facility_id: apiT?.facility_id ?? effectiveFacilityId,
      is_active: apiT?.is_active ?? true,
      lab_tests: safeLabTests.map((t) => ({
        test_id: t?.test_id,
        test_name: t?.test_name,
        prerequisite_text: t?.prerequisite_text ?? "",
      })),
      prescriptions: safePrescriptions.map((rx, idx) => ({
        id: `rx-${apiT?.template_id || selectedTemplateId}-${idx}`,
        medicine_id: rx?.medicine_id ?? null,
        medicine_name: rx?.medicine_name ?? "",
        generic_name: rx?.generic_name ?? "",
        strength: rx?.strength ?? "",
        morning_dosage: rx?.morning_dosage ?? "",
        afternoon_dosage: rx?.afternoon_dosage ?? "",
        night_dosage: rx?.night_dosage ?? "",
        food_timing: rx?.food_timing ?? "",
        duration_days: rx?.duration_days || "",
        special_instructions: rx?.special_instructions ?? "",
        dosage: (rx?.morning_dosage || rx?.afternoon_dosage || rx?.night_dosage) 
          ? `${rx?.morning_dosage ?? "0"}-${rx?.afternoon_dosage ?? "0"}-${rx?.night_dosage ?? "0"}` 
          : "",
      })),
      symptoms: safeSymptoms.map((s, idx) => ({
        id: `sym-${apiT?.template_id || selectedTemplateId}-${idx}`,
        symptom_id: s?.symptom_id ?? null,
        symptom_name: s?.symptom_name ?? "",
        default_duration_days: s?.default_duration_days || "",
        default_remarks: s?.default_remarks ?? "",
      })),
    };

    setTemplateDraft(normalized);
  }, [selectedTemplateId, templateFromApi, effectiveFacilityId]);

  // Backfill display fields for prescriptions/symptoms/labs from master lists
  useEffect(() => {
    if (!templateDraft) return;

    setTemplateDraft((prev) => {
      if (!prev) return prev;

      const prescriptions = (prev.prescriptions || []).map((rx) => {
        if (!rx?.medicine_id) return rx;
        const found = (drugOptions || []).find((d) => d.medicine_id === rx.medicine_id);
        if (!found) return rx;
        return {
          ...rx,
          medicine_name: rx.medicine_name || found.medicine_name || "",
          generic_name: rx.generic_name || found.generic_name || "",
          strength: rx.strength || found.strength || "",
        };
      });

      const symptoms = (prev.symptoms || []).map((s) => {
        if (!s?.symptom_id) return s;
        const found = (symptomOptions || []).find((opt) => opt.symptom_id === s.symptom_id);
        if (!found) return s;
        return { ...s, symptom_name: s.symptom_name || found.symptom_name || "" };
      });

      const lab_tests = (prev.lab_tests || []).map((t) => {
        if (!t?.test_id) return t;
        const found = (labOptions || []).find((opt) => opt.test_id === t.test_id);
        if (!found) return t;
        return { ...t, test_name: t.test_name || found.test_name || "" };
      });

      return { ...prev, prescriptions, symptoms, lab_tests };
    });
  }, [drugOptions, symptomOptions, labOptions]);

  const isCreating = !selectedTemplateId;

  const selectedTemplateMeta = useMemo(() => {
    if (!selectedTemplateId) return null;
    return (templates || []).find((t) => t.template_id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  const labValue = useMemo(() => {
    const selectedIds = new Set((templateDraft.lab_tests || []).map((t) => t.test_id));
    return (labOptions || []).filter((opt) => selectedIds.has(opt.test_id));
  }, [labOptions, templateDraft.lab_tests]);

  const createMutation = useMutation({
    mutationFn: (payload) => postCreateTemplate(payload),
    onSuccess: () => {
      setToast({ show: true, message: "Template created successfully", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["templatesList"] });
      queryClient.invalidateQueries({ queryKey: ["queryGetTemplatesList"] });
      setSelectedTemplateId(null);
      setTemplateDraft(emptyTemplate(effectiveFacilityId));
    },
    onError: () => {
      setToast({ show: true, message: "Failed to create template", status: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => putUpdateTemplate(payload),
    onSuccess: () => {
      setToast({ show: true, message: "Template updated successfully", status: "success" });
      queryClient.invalidateQueries({ queryKey: ["templatesList"] });
      queryClient.invalidateQueries({ queryKey: ["templateById", selectedTemplateId] });
      queryClient.invalidateQueries({ queryKey: ["queryGetTemplatesList"] });
    },
    onError: () => {
      setToast({ show: true, message: "Failed to update template", status: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTemplate({ template_id: selectedTemplateId }),
    onSuccess: () => {
      setToast({ show: true, message: "Template deleted successfully", status: "success" });
      setConfirmDeleteOpen(false);
      setSelectedTemplateId(null);
      setTemplateDraft(emptyTemplate(effectiveFacilityId));
      queryClient.invalidateQueries({ queryKey: ["templatesList"] });
      queryClient.invalidateQueries({ queryKey: ["queryGetTemplatesList"] });
    },
    onError: () => {
      setToast({ show: true, message: "Failed to delete template", status: "error" });
    },
  });

  const toggleActiveStatus = async (template_id) => {
    try {
      const tpl = await getTemplateById({ template_id });
      const apiT = tpl?.data ?? tpl;
      const safeLabTests = Array.isArray(apiT?.lab_tests) ? apiT.lab_tests : [];
      const safePrescriptions = Array.isArray(apiT?.prescriptions) ? apiT.prescriptions : [];
      const safeSymptoms = Array.isArray(apiT?.symptoms) ? apiT.symptoms : [];
      const payload = {
        template_id: apiT?.template_id ?? template_id,
        template_name: apiT?.template_name?.trim() ?? "",
        template_type: apiT?.template_type?.trim() ?? "",
        description: apiT?.description ?? "",
        facility_id: apiT?.facility_id ?? effectiveFacilityId,
        is_active: !(apiT?.is_active === true),
        lab_tests: safeLabTests.filter((t) => t?.test_id).map((t) => ({ test_id: t.test_id })),
        prescriptions: safePrescriptions
          .filter((rx) => rx?.medicine_id)
          .map((rx) => ({
            medicine_id: rx.medicine_id,
            morning_dosage: rx.morning_dosage || "0",
            afternoon_dosage: rx.afternoon_dosage || "0",
            night_dosage: rx.night_dosage || "0",
            food_timing: rx.food_timing ?? "",
            duration_days: Number(rx.duration_days) || 0,
            special_instructions: rx.special_instructions ?? "",
          })),
        symptoms: safeSymptoms
          .filter((s) => s?.symptom_id)
          .map((s) => ({
            symptom_id: s.symptom_id,
            default_duration_days: Number(s.default_duration_days) || 0,
            default_remarks: s.default_remarks ?? "",
          })),
      };
      updateMutation.mutate(payload);
    } catch (e) {
      setToast({ show: true, message: "Failed to toggle active status", status: "error" });
    }
  };

  const validateTemplate = () => {
    if (!templateDraft.template_name?.trim()) return "Template name is required";
    if (!templateDraft.template_type?.trim()) return "Template type is required";
    if (!templateDraft.description?.trim()) return "Description is required";

    const invalidLab = (templateDraft.lab_tests || []).some((t) => !t?.test_id);
    if (invalidLab) return "Please select valid lab tests";

    const invalidRx = (templateDraft.prescriptions || []).some(
      (rx) => rx?.medicine_name?.trim() && !rx?.medicine_id
    );
    if (invalidRx) return "Please select medicines from the dropdown list";

    const invalidSymptoms = (templateDraft.symptoms || []).some(
      (s) => s?.symptom_name?.trim() && !s?.symptom_id
    );
    if (invalidSymptoms) return "Please select symptoms from the dropdown list";

    return null;
  };

  const buildPayload = () => {
    const base = {
      template_name: templateDraft.template_name?.trim(),
      template_type: templateDraft.template_type?.trim(),
      description: templateDraft.description?.trim(),
      facility_id: effectiveFacilityId,
      lab_tests: (templateDraft.lab_tests || [])
        .filter((t) => t?.test_id)
        .map((t) => ({ test_id: t.test_id })),
      prescriptions: (templateDraft.prescriptions || [])
        .filter((rx) => rx?.medicine_id)
        .map((rx) => ({
          medicine_id: rx.medicine_id,
          morning_dosage: rx.morning_dosage || "0",
          afternoon_dosage: rx.afternoon_dosage || "0",
          night_dosage: rx.night_dosage || "0",
          food_timing: rx.food_timing ?? "",
          duration_days: Number(rx.duration_days) || 0,
          special_instructions: rx.special_instructions ?? "",
        })),
      symptoms: (templateDraft.symptoms || [])
        .filter((s) => s?.symptom_id)
        .map((s) => ({
          symptom_id: s.symptom_id,
          default_duration_days: Number(s.default_duration_days) || 0,
          default_remarks: s.default_remarks ?? "",
        })),
    };

    if (!isCreating) {
      return {
        template_id: selectedTemplateId,
        ...base,
        is_active: Boolean(templateDraft.is_active),
      };
    }
    return base;
  };

  const handleSave = () => {
    const err = validateTemplate();
    if (err) {
      setToast({ show: true, message: err, status: "error" });
      return;
    }

    const payload = buildPayload();
    if (isCreating) createMutation.mutate(payload);
    else updateMutation.mutate(payload);
  };

  const symptomColumns = useMemo(
    () => [
      {
        accessorKey: "symptom_name",
        header: "Symptom",
        Edit: ({ cell, row, table }) => {
          const currentId = row.original.symptom_id ?? null;
          const selected =
            (symptomOptions || []).find((s) => s.symptom_id === currentId) || null;

          return (
            <Autocomplete
              fullWidth
              size="small"
              options={symptomOptions}
              value={selected}
              getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt?.symptom_name || "")}
              isOptionEqualToValue={(opt, val) => opt?.symptom_id === val?.symptom_id}
              onChange={(event, val) => {
                if (!val) {
                  table.options.meta.updateData(row.index, "symptom_id", null);
                  table.options.meta.updateData(row.index, "symptom_name", "");
                  return;
                }
                table.options.meta.updateRowData(row.index, {
                  symptom_id: val.symptom_id,
                  symptom_name: val.symptom_name,
                  default_duration_days: val.default_duration_days || "",
                  default_remarks: val.default_remarks || "",
                });
              }}
              renderInput={(params) => <TextField {...params} placeholder="Search symptom..." />}
            />
          );
        },
      },
      {
        accessorKey: "default_duration_days",
        header: "Days",
        size: 80,
        Edit: ({ cell, row, table }) => (
          <TextField
            type="number"
            size="small"
            fullWidth
            value={row.original.default_duration_days ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "default_duration_days", e.target.value)
            }
          />
        ),
      },
      {
        accessorKey: "default_remarks",
        header: "Remarks",
        Edit: ({ cell, row, table }) => (
          <TextField
            size="small"
            fullWidth
            value={row.original.default_remarks ?? ""}
            onChange={(e) =>
              table.options.meta.updateData(row.index, "default_remarks", e.target.value)
            }
          />
        ),
      },
    ],
    [symptomOptions]
  );

  const templatesColumns = useMemo(
    () => [
      { accessorKey: "template_name", header: "Template name" },
      { accessorKey: "template_type", header: "Type", size: 120 },
      {
        accessorKey: "is_active",
        header: "Active",
        size: 90,
        Cell: ({ row }) => (row.original?.is_active === false ? "No" : "Yes"),
      },
    ],
    []
  );

  const showLoader =
    isLoadingTemplates ||
    isLoadingDrugMaster ||
    isLoadingLabMaster ||
    isLoadingSymptomMaster ||
    templateDetailsQuery.isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        bgcolor: "#fff",
        borderRadius: 2,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "80vh",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          px: { xs: 2, sm: 3, md: 4 },
          py: 2.5,
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fafafa",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#115E59", fontSize: "1.1rem" }}>
            Settings
          </Typography>
          <Typography sx={{ color: "#6b7280", fontSize: "0.92rem" }}>
            Manage templates
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            width: { xs: "100%", md: "auto" },
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <StyledButton
            variant="outlined"
            onClick={() => {
              setSelectedTemplateId(null);
              setTemplateDraft(emptyTemplate(effectiveFacilityId));
            }}
          >
            New Template
          </StyledButton>

          {!isCreating && (
            <StyledButton
              variant="outlined"
              color="error"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Delete
            </StyledButton>
          )}

          <StyledButton variant="contained" onClick={handleSave}>
            {isCreating ? "Create" : "Update"}
          </StyledButton>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: 0, overflow: "auto", minWidth: 0 }}>
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 1,
              mb: 1,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800 }}>Templates</Typography>
              <Typography sx={{ fontSize: "0.86rem", color: "#6b7280" }}>
                Click on a template or Edit to load a template into the form.
              </Typography>
            </Box>
            {selectedTemplateMeta?.template_name ? (
              <Typography sx={{ fontSize: "0.86rem", color: "#111827" }}>
                Selected: <strong>{selectedTemplateMeta.template_name}</strong>
              </Typography>
            ) : (
              <Typography sx={{ fontSize: "0.86rem", color: "#6b7280" }}>
                Selected: <strong>New template</strong>
              </Typography>
            )}
          </Box>

          <MaterialReactTable
            columns={templatesColumns}
            data={templates || []}
            enableGlobalFilter
            enableColumnFilters={false}
            enableColumnActions={false}
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={false}
            enablePagination
            enableRowActions
            positionActionsColumn="last"
            muiTableBodyRowProps={({ row }) => ({
              onClick: () => setSelectedTemplateId(row.original?.template_id ?? null),
              sx: { cursor: "pointer" },
            })}
            renderRowActions={({ row }) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title={row.original?.is_active === false ? "Enable" : "Disable"} arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActiveStatus(row.original?.template_id);
                    }}
                  >
                    {row.original?.is_active === false ? (
                      <ToggleOnOutlinedIcon sx={{ color: "#115E59", fontSize: "1.5rem" }} />
                    ) : (
                      <ToggleOffOutlinedIcon sx={{ color: "#115E59", fontSize: "1.5rem" }} />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplateId(row.original?.template_id ?? null);
                    }}
                  >
                    <EditOutlinedIcon sx={{ color: "#115E59", fontSize: "1.5rem" }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete" arrow>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplateId(row.original?.template_id ?? null);
                      setConfirmDeleteOpen(true);
                    }}
                  >
                    <DeleteForeverIcon sx={{ fontSize: "1.5rem" }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            initialState={{
              showGlobalFilter: true,
              pagination: { pageIndex: 0, pageSize: 10 },
              columnPinning: { right: ["mrt-row-actions"] },
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              label="Template name"
              value={templateDraft.template_name}
              onChange={(e) => setTemplateDraft((p) => ({ ...p, template_name: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Template type"
              value={templateDraft.template_type}
              onChange={(e) => setTemplateDraft((p) => ({ ...p, template_type: e.target.value }))}
              fullWidth
              size="small"
              placeholder="e.g. FEVER"
            />
            <TextField
              label="Description"
              value={templateDraft.description}
              onChange={(e) => setTemplateDraft((p) => ({ ...p, description: e.target.value }))}
              fullWidth
              size="small"
              multiline
              minRows={2}
              sx={{ gridColumn: { xs: "1 / -1" } }}
            />
          </Box>

          {!isCreating && (
            <Box />
          )}

          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>Lab tests</Typography>
            <Autocomplete
              multiple
              options={labOptions}
              value={labValue}
              getOptionLabel={(opt) => opt?.test_name || ""}
              isOptionEqualToValue={(opt, val) => opt?.test_id === val?.test_id}
              onChange={(e, vals) => {
                setTemplateDraft((p) => ({
                  ...p,
                  lab_tests: (vals || []).map((v) => ({ test_id: v.test_id })),
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} size="small" placeholder="Select lab tests" />
              )}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <PrescriptionSection
            templateDraft={templateDraft}
            setTemplateDraft={setTemplateDraft}
            drugOptions={drugOptions}
            editingRxRowId={editingRxRowId}
            setEditingRxRowId={setEditingRxRowId}
          />

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 800 }}>Symptoms</Typography>
            <StyledButton
              variant="outlined"
              onClick={() =>
                setTemplateDraft((p) => ({
                  ...p,
                  symptoms: [
                    {
                      id: `sym-new-${Date.now()}`,
                      symptom_id: null,
                      symptom_name: "",
                      default_duration_days: "",
                      default_remarks: "",
                    },
                    ...(p.symptoms || []),
                  ],
                }))
              }
            >
              Add row
            </StyledButton>
          </Box>

          <Box sx={{ mt: 1 }}>
            <MaterialReactTable
              columns={symptomColumns}
              data={templateDraft.symptoms || []}
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
                  setTemplateDraft((prev) => {
                    const next = [...(prev.symptoms || [])];
                    next[rowIndex] = { ...next[rowIndex], [columnId]: value };
                    return { ...prev, symptoms: next };
                  }),
                updateRowData: (rowIndex, updatedRow) =>
                  setTemplateDraft((prev) => {
                    const next = [...(prev.symptoms || [])];
                    next[rowIndex] = { ...next[rowIndex], ...updatedRow };
                    return { ...prev, symptoms: next };
                  }),
              }}
              renderRowActions={({ row, table }) => {
                const isEditing = editingSymRowId === row.original.id;
                return (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {isEditing ? (
                      <>
                        <Tooltip title="Save" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              table.setEditingRow(null);
                              setEditingSymRowId(null);
                            }}
                          >
                            <SaveIcon sx={{ color: "#115E59", fontSize: "1.2rem" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              table.setEditingRow(null);
                              setEditingSymRowId(null);
                            }}
                          >
                            <CancelIcon sx={{ color: "#dc2626", fontSize: "1.2rem" }} />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Edit" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingSymRowId(row.original.id);
                              table.setEditingRow(row);
                            }}
                          >
                            <EditOutlinedIcon sx={{ color: "#115E59", fontSize: "1.2rem" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setTemplateDraft((p) => ({
                                ...p,
                                symptoms: (p.symptoms || []).filter((r) => r.id !== row.original.id),
                              }));
                            }}
                          >
                            <DeleteForeverIcon sx={{ fontSize: "1.2rem" }} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                );
              }}
            />
          </Box>
      </Box>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Delete template</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this template? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <StyledButton variant="outlined" onClick={() => setConfirmDeleteOpen(false)}>
            Cancel
          </StyledButton>
          <StyledButton
            variant="contained"
            color="error"
            onClick={() => deleteMutation.mutate()}
            disabled={!selectedTemplateId}
          >
            Delete
          </StyledButton>
        </DialogActions>
      </Dialog>

      <AlertSnackbar
        showAlert={toast.show}
        message={toast.message}
        severity={toast.status}
        onClose={() => setToast((p) => ({ ...p, show: false }))}
      />

      <PageLoader show={showLoader} />
    </Box>
  );
}

export default TemplatesManager;

