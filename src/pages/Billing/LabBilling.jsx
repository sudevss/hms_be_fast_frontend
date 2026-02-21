import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid,
  Divider,
  InputAdornment,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/AddCircleOutline";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import StyledButton from "@components/StyledButton";
import AlertSnackbar from "@components/AlertSnackbar";
import PageLoader from "../../pages/PageLoader";
import { colors } from "../../theme/palette";
import DatePickerComponent from "@components/DatePicker";
import { getLabMasterList, postCreateBills, getLabBillPrint, getPharmacyBillPrint, getProcedureBillPrint, getFacilityLogo, getFacilityDetail } from "@/serviceApis";
import { useQuery } from "@tanstack/react-query";
import { userLoginDetails } from "@/stores/LoginStore";

const LabBilling = () => {
  const [rows, setRows] = useState([]);
  const [diagnosisId, setDiagnosisId] = useState("");
  const [tokenDate, setTokenDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [overallDiscount, setOverallDiscount] = useState(0);

  // Snackbar State
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // Print Confirmation Dialog State
  const [openPrintDialog, setOpenPrintDialog] = useState(false);

  // Reprint Dialog State
  const [openReprintDialog, setOpenReprintDialog] = useState(false);
  const [reprintDiagnosisId, setReprintDiagnosisId] = useState("");
  const [reprintTokenDate, setReprintTokenDate] = useState("");
  const [reprintData, setReprintData] = useState(null);
  const reprintRef = useRef();

  // Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { data: labOptions = [], isLoading: isLabOptionsLoading } = useQuery({
    queryKey: ["queryGetLabMaster"],
    queryFn: () => getLabMasterList(),
  });

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now() + Math.random(),
        test: "",
        test_id: null,
        selectedOption: null, // Store full object to avoid Autocomplete value issues
        remarks: "",
        price: 0,
        discount: 0,
      },
    ]);
  };

  const handleDeleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleChange = (id, field, value) => {
    let newValue = value;

    if (field === "price" || field === "discount") {
      // Remove leading zero if followed by a digit (e.g., "05" -> "5")
      newValue = newValue.replace(/^0+(?=\d)/, "");
    }

    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: newValue } : row))
    );
  };

  const calculateFinal = (price, discount) => {
    const p = parseFloat(price) || 0;
    const d = parseFloat(discount) || 0;
    return p - (p * d) / 100;
  };

  const calculateSubtotal = () => {
    return rows.reduce((sum, row) => sum + (parseFloat(row.price) || 0), 0);
  };

  const calculateTotalDiscount = () => {
    return rows.reduce((sum, row) => {
      const p = parseFloat(row.price) || 0;
      const d = parseFloat(row.discount) || 0;
      return sum + (p * d) / 100;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const itemDiscountAmount = calculateTotalDiscount();
    const afterItemDiscount = subtotal - itemDiscountAmount;
    const overallDiscountAmount =
      (afterItemDiscount * (parseFloat(overallDiscount) || 0)) / 100;
    return afterItemDiscount - overallDiscountAmount;
  };

  const resetForm = () => {
    setRows([]);
    setDiagnosisId("");
    setTokenDate(new Date().toISOString().split("T")[0]);
    setOverallDiscount(0);
  };

  const handleSave = async () => {
    if (!diagnosisId || !tokenDate) {
      setSnackbarMessage("Please enter Token Number and Date");
      setSnackbarSeverity("warning");
      setOpenSnackbar(true);
      return;
    }

    // Validate rows
    const invalidRows = rows.filter((row) => !row.test_id);
    if (invalidRows.length > 0) {
      setSnackbarMessage("Please select a valid test for all rows.");
      setSnackbarSeverity("warning");
      setOpenSnackbar(true);
      return;
    }

    try {
      setIsSubmitting(true);

      // Fetch existing bills from other categories to preserve them
      let existingPharmacyItems = [];
      let existingPharmacyDiscount = 0;
      let existingProcedureItems = [];
      let existingProcedureDiscount = 0;

      // Fetch Pharmacy Data
      try {
        const pharmacyData = await getPharmacyBillPrint(diagnosisId);
        if (pharmacyData && pharmacyData.items) {
          existingPharmacyItems = pharmacyData.items.map(item => ({
            medicine_id: item.medicine_id,
            quantity: item.quantity,
            discount_percent: item.discount_percent,
            duration_days: item.duration_days,
            dosage_info: item.dosage_info || item.frequency,
            food_timing: item.food_timing || item.foodTiming,
          }));
          existingPharmacyDiscount = pharmacyData.discount_percent || 0;
        }
      } catch (error) {
        console.warn("Could not fetch existing pharmacy bill:", error);
      }

      // Fetch Procedure Data
      try {
        const procedureData = await getProcedureBillPrint(diagnosisId);
        if (procedureData && procedureData.items) {
          existingProcedureItems = procedureData.items.map(item => ({
            procedure_text: item.procedure_text,
            price: item.price,
            discount_percent: item.discount_percent,
          }));
          existingProcedureDiscount = procedureData.discount_percent || 0;
        }
      } catch (error) {
        console.warn("Could not fetch existing procedure bill:", error);
      }

      const payload = {
        facility_id: logoFacilityId,
        lab_discount_percent: parseFloat(overallDiscount) || 0,
        lab_items: rows.map((row) => ({
          test_id: row.test_id,
          discount_percent: parseFloat(row.discount) || 0,
          remarks: row.remarks || "",
        })),
        pharmacy_discount_percent: existingPharmacyDiscount,
        pharmacy_items: existingPharmacyItems,
        procedure_discount_percent: existingProcedureDiscount,
        procedure_items: existingProcedureItems,
        token_number: diagnosisId,
        token_date: tokenDate,
      };

      console.log("Payload to be sent:", JSON.stringify(payload, null, 2));

      await postCreateBills(payload);
      setSnackbarMessage("Bill saved successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      // Open print confirmation dialog
      setOpenPrintDialog(true);
    } catch (error) {
      console.error("Error saving bill:", error);
      setSnackbarMessage("Failed to save bill. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintConfirm = async () => {
    if (!diagnosisId) {
      setOpenPrintDialog(false);
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await getLabBillPrint({
        token_number: diagnosisId,
        token_date: tokenDate,
      });

      if (data) {
        setReprintData(data);
        setReprintDiagnosisId(diagnosisId);
        setReprintTokenDate(tokenDate);
      }
    } catch (error) {
      console.error("Error fetching bill for print:", error);
      setSnackbarMessage("Failed to fetch bill data for printing.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
      setOpenPrintDialog(false);
      resetForm();
    }
  };

  const handlePrintCancel = () => {
    setOpenPrintDialog(false);
    resetForm();
  };

  // Reprint Logic
  const handleReprintClick = () => {
    setReprintData(null);
    setReprintDiagnosisId("");
    setReprintTokenDate("");
    setOpenReprintDialog(true);
  };

  const handleReprintClose = () => {
    setOpenReprintDialog(false);
  };

  const handleReprintSubmit = async () => {
    if (!reprintDiagnosisId || !reprintTokenDate) {
      setSnackbarMessage("Please enter Token Number and Date");
      setSnackbarSeverity("warning");
      setOpenSnackbar(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await getLabBillPrint({
        token_number: reprintDiagnosisId,
        token_date: reprintTokenDate,
      });
      console.log("Fetched Reprint Data:", data);
      
      // Ensure data structure compatibility
      // Assuming API returns { lab_items: [], lab_discount_percent: 0, ... }
      if (!data) {
        throw new Error("Invalid bill data received");
      }
      
      setReprintData(data);
      setOpenReprintDialog(false);
    } catch (error) {
      console.error("Error fetching bill:", error);
      setSnackbarMessage("Failed to fetch bill. Please check the ID.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (reprintData && reprintRef.current) {
      const printContent = reprintRef.current.innerHTML;
      const logoSrc = logoBase64 || (logoBlob ? URL.createObjectURL(logoBlob) : null);
      const win = window.open("", "_blank", "width=900,height=650");
      win.document.write(`
        <html>
          <head>
            <title>Lab Bill Print</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #000000; max-width: 800px; margin: 0 auto; line-height: 1.5; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
              .logo { max-height: 180px; max-width: 360px; object-fit: contain; margin: 0 auto 10px auto; display: block; }
              .hospital-name { font-size: 22px; font-weight: 700; color: #115E59; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
              
              .bill-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
              .info-group { display: flex; flex-direction: column; gap: 8px; }
              .info-row { display: flex; gap: 12px; font-size: 14px; }
              .label { font-weight: 600; color: #000000; min-width: 100px; }
              .value { color: #000000; font-weight: 500; }
              
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
              th { background-color: #f3f4f6; color: #000000; font-weight: 600; padding: 12px 16px; text-align: left; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
              td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #000000; }
              tr:last-child td { border-bottom: none; }
              
              .total-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
              .total-section div { font-size: 14px; color: #4b5563; display: flex; justify-content: space-between; width: 200px; }
              .total-section div:last-child { font-size: 18px; font-weight: 700; color: #115E59; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e5e7eb; }
              
              .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
              .signature { margin-top: 50px; text-align: right; font-weight: 600; padding-right: 20px; color: #374151; }
              .signature:before { content: ""; display: block; width: 200px; height: 1px; background: #374151; margin-left: auto; margin-bottom: 10px; }
              
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              ${logoSrc ? `<img src="${logoSrc}" class="logo" alt="Logo" />` : ""}
              ${reprintData.facility_name || FacilityName ? `<div class="hospital-name">${reprintData.facility_name || FacilityName}</div>` : ""}
              ${
                facilityDetail
                  ? `<div style="font-size: 13px; color: #000000; margin-top: 4px;">
                      ${facilityDetail.FacilityAddress || ""} | Ph: ${facilityDetail.phone_number || "-"} | Email: ${facilityDetail.email || "-"}
                    </div>`
                  : ""
              }
            </div>
            
            <div class="bill-info">
              <div class="info-group">
                <div class="info-row"><span class="label">Patient Name:</span> <span class="value">${reprintData.patient_name || "-"}</span></div>
                <div class="info-row"><span class="label">Token Number:</span> <span class="value">${reprintData.token_number || reprintDiagnosisId || "-"}</span></div>
              </div>
              <div class="info-group" style="text-align: right;">
                <div class="info-row"><span class="label">Date:</span> <span class="value">${reprintData.date || new Date().toLocaleDateString()}</span></div>
                <div class="info-row"><span class="label">Bill Type:</span> <span class="value">Lab Bill</span></div>
              </div>
            </div>

            ${printContent}

            <div class="signature">
              Authorized Signatory
            </div>
            
            <div class="footer">
              <p>Thank you for choosing our facility. We wish you a speedy recovery!</p>
              <p>This is a computer-generated invoice and does not require a physical seal.</p>
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
    }
  }, [reprintData, reprintDiagnosisId, logoBase64, logoBlob, FacilityName]);

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", margin: "0 auto" }}>
      <PageLoader show={isLabOptionsLoading || isSubmitting} />
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: colors.primary.main }}
        >
          New Lab Bill
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handleReprintClick}
          sx={{
            textTransform: "none",
            borderColor: "#D1D5DB",
            color: "#374151",
            "&:hover": { bgcolor: "#F3F4F6" }
          }}
        >
          Reprint Archived Bill
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Header Inputs */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, color: colors.primary.main, fontWeight: 600 }}
            >
              Token Number
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter Token Number"
              size="small"
              variant="outlined"
              type="text"
              value={diagnosisId}
              onChange={(e) => setDiagnosisId(e.target.value)}
              sx={{ bgcolor: "#F9FAFB" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, color: colors.primary.main, fontWeight: 600 }}
            >
              Token Date
            </Typography>
            <DatePickerComponent
              label=""
              name="tokenDate"
              value={tokenDate}
              onChange={(e) => setTokenDate(e.target.value)}
              showInputLabel={false}
              sxInput={{
                padding: 0,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#F9FAFB",
                  height: "40px",
                },
              }}
              format="YYYY-MM-DD"
              currentYear={undefined}
              calendarSx={{
                "& .MuiDayCalendar-root": { margin: 0, padding: 0 },
                "& .MuiPickersDay-root": {
                  margin: 0,
                  width: 32,
                  height: 32,
                  fontSize: "0.75rem",
                },
                "& .MuiPickersCalendarHeader-root": { mb: 0 },
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Products / Services Header */}
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: 600, color: "#374151" }}
        >
          Lab Tests
        </Typography>

        {/* Table */}
        <TableContainer sx={{ mb: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: "#6B7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #E5E7EB",
                    py: 2,
                    textAlign: "center",
                  }}
                >
                  Title
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6B7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #E5E7EB",
                    py: 2,
                    textAlign: "center",
                  }}
                >
                  Remarks
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6B7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #E5E7EB",
                    py: 2,
                    width: "160px",
                    textAlign: "center",
                  }}
                >
                  Unit Price
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6B7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #E5E7EB",
                    py: 2,
                    width: "140px",
                    textAlign: "center",
                  }}
                >
                  Discount
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6B7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #E5E7EB",
                    py: 2,
                    width: "120px",
                    textAlign: "center",
                  }}
                >
                  Total Price
                </TableCell>
                <TableCell
                  sx={{ borderBottom: "1px solid #E5E7EB", width: "50px" }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:hover": { bgcolor: "#F9FAFB" } }}
                >
                  <TableCell sx={{ py: 2, borderBottom: "1px solid #F3F4F6" }}>
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={labOptions}
                      loading={isLabOptionsLoading}
                      getOptionLabel={(option) => {
                        // Handle string options (rare but possible)
                        if (typeof option === "string") return option;
                        // Handle object options
                        return option.test_name || "";
                      }}
                      isOptionEqualToValue={(option, value) => {
                        if (!value) return false;
                        // Compare IDs if available (most reliable)
                        if (option.test_id && value.test_id) {
                          return option.test_id === value.test_id;
                        }
                        // Fallback to name comparison
                        return option.test_name === value.test_name;
                      }}
                      value={row.selectedOption || null}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          // Determine test_id safely
                          const testId =
                            newValue.test_id !== undefined
                              ? newValue.test_id
                              : newValue.id;
                              
                          // Update all fields at once
                          const updatedRow = {
                            ...row,
                            selectedOption: newValue,
                            test: newValue.test_name || "",
                            test_id: testId,
                          };
                          
                          // Auto-fill other fields if present
                          if (newValue.description) {
                            updatedRow.remarks = newValue.description;
                          }
                          if (newValue.price) {
                            updatedRow.price = newValue.price;
                          }
                          
                          // Update state
                          setRows(rows.map(r => r.id === row.id ? updatedRow : r));
                        } else {
                          // Clear everything
                          const clearedRow = {
                            ...row,
                            selectedOption: null,
                            test: "",
                            test_id: null,
                            remarks: "",
                            price: 0
                          };
                          setRows(rows.map(r => r.id === row.id ? clearedRow : r));
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Test Name"
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": { bgcolor: "#fff" },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#E5E7EB",
                            },
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2, borderBottom: "1px solid #F3F4F6" }}>
                    <TextField
                      fullWidth
                      placeholder="Remarks"
                      size="small"
                      variant="outlined"
                      value={row.remarks}
                      onChange={(e) =>
                        handleChange(row.id, "remarks", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": { bgcolor: "#fff" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E5E7EB",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2, borderBottom: "1px solid #F3F4F6" }}>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      variant="outlined"
                      onWheel={(e) => e.target.blur()}
                      value={row.price}
                      onChange={(e) =>
                        handleChange(row.id, "price", e.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": { bgcolor: "#fff" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E5E7EB",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2, borderBottom: "1px solid #F3F4F6" }}>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      variant="outlined"
                      onWheel={(e) => e.target.blur()}
                      value={row.discount}
                      onChange={(e) =>
                        handleChange(row.id, "discount", e.target.value)
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": { bgcolor: "#fff" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E5E7EB",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 2,
                      borderBottom: "1px solid #F3F4F6",
                      textAlign: "right",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    ₹{calculateFinal(row.price, row.discount).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ py: 2, borderBottom: "1px solid #F3F4F6" }}>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRow(row.id)}
                      sx={{
                        color: "#EF4444",
                        "&:hover": { bgcolor: "#FEF2F2" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 4, color: "#9CA3AF" }}
                  >
                    No items added. Click below to add a new test.
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell
                  colSpan={6}
                  sx={{ py: 2, borderBottom: "none", textAlign: "center" }}
                >
                  <StyledButton
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                    sx={{
                      textTransform: "none",
                      color: colors.primary.main,
                      bgcolor: "#F0FDF4",
                      "&:hover": { bgcolor: "#DCFCE7" },
                    }}
                  >
                    Add new item
                  </StyledButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        {/* Footer / Totals */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: "350px" }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Subtotal:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#374151" }}
              >
                ₹{calculateSubtotal().toFixed(2)}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Item Discount Amount:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#EF4444" }}
              >
                -₹{calculateTotalDiscount().toFixed(2)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                Overall Discount (%):
              </Typography>
              <TextField
                size="small"
                type="number"
                variant="outlined"
                onWheel={(e) => e.target.blur()}
                value={overallDiscount}
                onChange={(e) => setOverallDiscount(e.target.value)}
                sx={{
                  width: "100px",
                  bgcolor: "#F9FAFB",
                  "& input": { textAlign: "right", py: 0.5 },
                }}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#374151" }}
              >
                Total value:
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colors.primary.main }}
              >
                ₹{calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            variant="outlined"
            onClick={resetForm}
            disabled={isSubmitting}
            sx={{
              borderColor: "#D1D5DB",
              color: "#374151",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <StyledButton
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSubmitting}
            sx={{
              bgcolor: "#059669",
              textTransform: "none",
              borderRadius: "6px",
              boxShadow: "none",
            }}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </StyledButton>
        </Box>
      </Paper>
      {/* Snackbar for Notifications */}
      <AlertSnackbar
        showAlert={openSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setOpenSnackbar(false)}
      />

      {/* Print Confirmation Dialog */}
      <Dialog
        open={openPrintDialog}
        onClose={handlePrintCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Print Bill?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            The bill has been saved successfully. Do you want to print it now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrintCancel} color="inherit">
            No
          </Button>
          <Button onClick={handlePrintConfirm} autoFocus color="primary">
            Yes, Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reprint Dialog */}
      <Dialog open={openReprintDialog} onClose={handleReprintClose}>
        <DialogTitle>Reprint Lab Bill</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter the Token Number and Date to retrieve and print the bill.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Token Number"
            type="text"
            fullWidth
            variant="outlined"
            value={reprintDiagnosisId}
            onChange={(e) => setReprintDiagnosisId(e.target.value)}
          />
          <DatePickerComponent
            label="Token Date (dd-mm-yyyy)"
            name="reprintTokenDate"
            value={reprintTokenDate}
            onChange={(e) => setReprintTokenDate(e.target.value)}
            showInputLabel={false}
            format="YYYY-MM-DD"
            currentYear={null}
            sxInput={{
              padding: 0,
              "&.MuiTextField-root .MuiOutlinedInput-root": {
                backgroundColor: "transparent",
              },
              "& .MuiSvgIcon-root": {
                color: colors.primary.main,
                fontSize: 24,
              },
            }}
            inputProps={{
              margin: "dense",
              size: "medium",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReprintClose} color="inherit">Cancel</Button>
          <Button onClick={handleReprintSubmit} variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? "Fetching..." : "Fetch & Print"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden Reprint Template */}
      <div ref={reprintRef} style={{ display: "none" }}>
        {reprintData && (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Sno</th>
                  <th>Test</th>
                  <th>Remarks</th>
                  <th>Price</th>
                  <th>Discount %</th>
                  <th>FINAL</th>
                </tr>
              </thead>
              <tbody>
                {reprintData.items && reprintData.items.length > 0 ? (
                  reprintData.items.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{row.test_name || row.test_id}</td>
                      <td>{row.remarks || "-"}</td>
                      <td>{row.price || 0}</td>
                      <td>{row.discount_percent || 0}</td>
                      <td>
                        {row.final_price || ((parseFloat(row.price || 0) * (100 - parseFloat(row.discount_percent || 0))) / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="total-section" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <table style={{ borderCollapse: "collapse", textAlign: "right", fontSize: "14px" }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: "4px 12px", color: "#666" }}>Subtotal:</td>
                            <td style={{ padding: "4px 0", fontWeight: "bold" }}>
                                ₹{(reprintData.items || []).reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2)}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "4px 12px", color: "#666" }}>Item Discount Amount:</td>
                            <td style={{ padding: "4px 0", fontWeight: "bold", color: "red" }}>
                                -₹{(reprintData.items || []).reduce((sum, item) => sum + ((parseFloat(item.price || 0) * parseFloat(item.discount_percent || 0)) / 100), 0).toFixed(2)}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "4px 12px", color: "#666" }}>Overall Discount ({reprintData.discount_percent || 0}%):</td>
                            <td style={{ padding: "4px 0", fontWeight: "bold", color: "red" }}>
                                -₹{(() => {
                                    const sub = (reprintData.items || []).reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
                                    const itemDisc = (reprintData.items || []).reduce((sum, item) => sum + ((parseFloat(item.price || 0) * parseFloat(item.discount_percent || 0)) / 100), 0);
                                    return ((sub - itemDisc) * (parseFloat(reprintData.discount_percent) || 0) / 100).toFixed(2);
                                })()}
                            </td>
                        </tr>
                        <tr style={{ borderTop: "1px solid #ddd" }}>
                            <td style={{ padding: "8px 12px", fontWeight: "bold", fontSize: "16px" }}>Total:</td>
                            <td style={{ padding: "8px 0", fontWeight: "bold", fontSize: "16px" }}>₹{reprintData.total || 0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export default LabBilling;
