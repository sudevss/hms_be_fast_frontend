import { useMemo, useState, useEffect, useRef } from "react";
import { Box, IconButton, Tooltip, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

import StyledButton from "@components/StyledButton";
import { MaterialReactTable } from "material-react-table";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import { postloadtemplate, getTemplatesList, getSymptomMasterList, getFacilityLogo, getFacilityDetail } from "@/serviceApis";
import { useQuery } from "@tanstack/react-query";
import { dayjs } from "@/utils/dateUtils";
import { useDiagnosisStore } from "@/stores/diagnosisStore";
import { userLoginDetails } from "@/stores/LoginStore";

const DiagnosisSection = ({ patientId, patientName, tokenNumber, appointmentDate, appointmentId, doctorName }) => {
  const diagnosisStore = useDiagnosisStore();
  const { symptoms, setSymptoms } = diagnosisStore;
  
  // Convert store data to table format
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const printRef = useRef();

  const { facility_id, FacilityName } = userLoginDetails();
  const logoFacilityId = facility_id || 1;
  const { data: logoBlob } = useQuery({
    queryKey: ["facilityLogo", logoFacilityId],
    queryFn: () => getFacilityLogo(logoFacilityId),
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const [logoBase64, setLogoBase64] = useState(null);
  useEffect(() => {
    if (logoBlob && logoBlob.size > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result);
      };
      reader.readAsDataURL(logoBlob);
    }
  }, [logoBlob]);

  const { data: facilityDetail } = useQuery({
    queryKey: ["facilityDetail", logoFacilityId],
    queryFn: () => getFacilityDetail(logoFacilityId),
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const [selectedTemplateOption, setSelectedTemplateOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const { data: templateOptions = [] } = useQuery({
    queryKey: ["queryGetTemplatesList"],
    queryFn: () => getTemplatesList(),
    enabled: true,
  });
  const activeTemplateOptions = (templateOptions || []).filter((t) => t?.is_active === true);

  const { data: symptomOptions = [] } = useQuery({
    queryKey: ["queryGetSymptomMaster"],
    queryFn: () => getSymptomMasterList(),
    enabled: true,
  });
  
  // Sync store with local data when symptoms change externally
  useEffect(() => {
    if (symptoms.length > 0 && data.length === 0 && symptomOptions.length > 0) {
      // Only sync if data is empty (initial load)
      const tableData = symptoms.map((symptom, index) => {
        const symptomOption = symptomOptions.find(s => s.symptom_id === symptom.symptom_id);
        return {
          id: `symptom-${index}-${Date.now()}`,
          diagnosis_date: dayjs().format("YYYY-MM-DD"),
          symptom_id: symptom.symptom_id,
          symptom_name: symptom.symptom_name || symptom.free_text_symptom || symptomOption?.symptom_name || "",
          duration_days: symptom.duration_days || "",
          remarks: symptom.remarks || "",
        };
      });
      setData(tableData);
    }
  }, [symptoms, symptomOptions]);

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
          symptom_id: symptom.symptom_id,
          symptom_name: symptom.symptom_name || "",
          duration_days:
            symptom.default_duration_days ?? symptom.duration_days ?? "",
          remarks: symptom.default_remarks ?? symptom.remarks ?? "",
        }));
      if (!mapped.length) setLoadError("No symptoms or already loaded");
      setData((prev) => [...prev, ...mapped]);
      
      // Update store
      const newSymptoms = mapped
        .filter((m) => m.symptom_id || m.symptom_name)
        .map((m) => ({
          symptom_id: m.symptom_id,
          symptom_name: m.symptom_name,
          duration_days: m.duration_days || 0,
          remarks: m.remarks || "",
        }));
      setSymptoms([...diagnosisStore.symptoms, ...newSymptoms]);
      
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
          if (typeof selectedSymptom === "string") {
            // User typed a custom symptom (freeSolo)
            return {
              ...row,
              symptom_id: null,
              symptom_name: selectedSymptom,
            };
          } else if (selectedSymptom) {
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
              freeSolo
              options={symptomOptions}
              filterOptions={(options, state) => {
                const filtered = options.filter((opt) =>
                  opt.symptom_name?.toLowerCase().includes(state.inputValue.toLowerCase())
                );
                return filtered;
              }}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : (option.symptom_name || "")
              }
              isOptionEqualToValue={(option, value) => {
                const valName = typeof value === "string" ? value : value?.symptom_name;
                return option.symptom_name === valName;
              }}
              value={selected || cell.getValue() || ""}
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
    const newRow = {
      id: Date.now(),
      diagnosis_date: dayjs().format("YYYY-MM-DD"),
      symptom_id: null,
      symptom_name: "",
      duration_days: "",
      remarks: "",
    };
    setData((prev) => [newRow, ...prev]);
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const logoSrc = logoBase64 || (logoBlob ? URL.createObjectURL(logoBlob) : null);
    const win = window.open("", "_blank", "width=900,height=650");
    win.document.write(`
      <html>
        <head>
          <title>Diagnosis Print</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              background-color: #f3f4f6;
              padding: 32px;
              color: #000000;
            }
            .page {
              max-width: 900px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
              padding: 28px 32px 32px;
            }
            .header-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              margin-bottom: 12px;
              gap: 4px;
              text-align: center;
            }
            .logo {
              max-height: 160px;
              max-width: 320px;
              object-fit: contain;
            }
            .center-heading {
              text-align: center;
              color: #0f766e;
              font-size: 1.6rem;
              font-weight: 700;
              letter-spacing: 0.04em;
              text-transform: uppercase;
            }
            .patient-header {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px 24px;
              padding: 16px 20px;
              margin: 8px 0 20px;
              border-radius: 10px;
              background: linear-gradient(to right, #ecfdf5, #f9fafb);
              border: 1px solid #d1fae5;
              font-size: 0.95rem;
              line-height: 1.5;
            }
            .patient-header strong {
              display: inline-block;
              min-width: 135px;
              color: #047857;
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              page-break-inside: auto;
              font-size: 0.9rem;
              background-color: #ffffff;
            }
            table thead {
              background-color: #f9fafb;
            }
            table th {
              padding: 8px 10px;
              border: 1px solid #e5e7eb;
              text-align: left;
              font-weight: 600;
              color: #000000;
            }
            table td {
              padding: 8px 10px;
              border: 1px solid #e5e7eb;
              color: #000000;
            }
            table tbody tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .section-title {
              font-weight: 700;
              font-size: 1.05rem;
              margin-top: 20px;
              margin-bottom: 8px;
              color: #0f766e;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              page-break-after: avoid;
            }
            .section-block {
              page-break-inside: avoid;
              break-inside: avoid;
              padding: 6px 0 10px;
            }
            thead {
              display: table-header-group;
            }
            @media print {
              body {
                background-color: #ffffff;
                padding: 0;
              }
              .page {
                box-shadow: none;
                margin: 0;
                border-radius: 0;
                padding: 16px 18px 24px;
              }
              .center-heading {
                font-size: 1.4rem;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header-container">
              ${logoSrc 
                ? `<img src="${logoSrc}" class="logo" alt="Logo" />` 
                : (FacilityName ? `<div class="center-heading">${FacilityName}</div>` : "")}
              ${
                facilityDetail
                  ? `<div style="font-size: 13px; color: #000000; margin-top: 6px; text-align: center;">
                      ${facilityDetail.FacilityAddress || ""} | Ph: ${facilityDetail.phone_number || "-"} | Email: ${facilityDetail.email || "-"}
                    </div>`
                  : ""
              }
            </div>
            <div class="patient-header">
              <div><strong>Patient ID:</strong> ${patientId || "-"}</div>
              <div><strong>Token No:</strong> ${tokenNumber || "-"}</div>
              <div><strong>Appointment No:</strong> ${appointmentId || "-"}</div>
              <div><strong>Name:</strong> ${patientName || "-"}</div>
              <div><strong>Appointment Date:</strong> ${appointmentDate || "-"}</div>
              <div><strong>Prescribed Doctor:</strong> ${doctorName || "-"}</div>
            </div>
            ${printContent}
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.onload = () => {
      setTimeout(() => {
        try { win.print(); } catch (e) {}
      }, 300);
    };
  };

  const handleDeleteRow = ({ row } = {}) => {
    const id = row?.original?.id ?? row?.id ?? null;
    if (!id) return;

    const filtered = data.filter((r) => r.id !== id);
    setData(filtered);
    // Update store
    setSymptoms(
      filtered
        .filter((r) => r.symptom_id || r.symptom_name)
        .map((r) => ({
          symptom_id: r.symptom_id,
          symptom_name: r.symptom_name,
          duration_days: r.duration_days,
          remarks: r.remarks,
        }))
    );
  };
  
  // Sync data to store when editing is saved
  const syncToStore = () => {
    setSymptoms(
      data
        .filter((r) => r.symptom_id || r.symptom_name)
        .map((r) => ({
          symptom_id: r.symptom_id,
          symptom_name: r.symptom_name,
          duration_days: r.duration_days || 0,
          remarks: r.remarks || "",
        }))
    );
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
            options={activeTemplateOptions}
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

          <StyledButton variant="outlined" onClick={handlePrint}>
            Print
          </StyledButton>

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
        onEditingRowSave={({ row }) => {
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
                    <IconButton
                      size="small"
                      onClick={() => {
                        syncToStore();
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
                        syncToStore();
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
                      <EditOutlinedIcon sx={{ color: "#115E59", fontSize: "1.25rem" }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete" arrow>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => { setRowToDelete(row.original); setDeleteConfirmOpen(true); }}
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
              <th>Diagnosis Date</th>
              <th>Symptom</th>
              <th>Duration (Days)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No diagnosis entries added
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id}>
                  <td>{row.diagnosis_date}</td>
                  <td>{row.symptom_name}</td>
                  <td>{row.duration_days}</td>
                  <td>{row.remarks}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>
          Are you sure you want to delete this diagnosis entry?
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

export default DiagnosisSection;
