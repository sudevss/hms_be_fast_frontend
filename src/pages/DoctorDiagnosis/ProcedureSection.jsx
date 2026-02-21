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
import { useQuery } from "@tanstack/react-query";
import { getFacilityLogo, getFacilityDetail } from "@/serviceApis";
import { userLoginDetails } from "@/stores/LoginStore";

const ProcedureSection = ({ patientId, patientName, tokenNumber, appointmentDate, appointmentId, doctorName }) => {
  const procedureStore = useProcedureStore();
  const { procedures, setProcedures } = procedureStore;
  
  const [data, setData] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [procedureError, setProcedureError] = useState({ show: false, message: "", status: "error" });
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
      reader.onloadend = () => setLogoBase64(reader.result);
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
    const logoSrc = logoBase64 || (logoBlob ? URL.createObjectURL(logoBlob) : null);
    const win = window.open("", "_blank", "width=900,height=650");
    win.document.write(`
      <html>
        <head>
          <title>Procedures Print</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              background-color: #f3f4f6;
              padding: 32px;
              color: #111827;
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
                  ? `<div style="font-size: 13px; color: #111827; margin-top: 6px; text-align: center;">
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
