import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import StyledButton from "@/components/StyledButton";
import { dayjs } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { getPatientDiagnosis } from "@/serviceApis";
import { getPatientDetailsById } from "@/serviceApis";
import { getPatientReports } from "@/serviceApis";
import { getPatientReportFileDownload } from "@/serviceApis";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddOrEditPatientDiagnosis from "@/ReusableComponents/AddOrEditPatientDiagnosis";
import { usePatientDiagnosis } from "@/stores/patientStore";
import PatientReports from "@/ReusableComponents/PatientReports";

const labelSx = { color: "#6b7280", fontWeight: 600, textTransform: "uppercase", textAlign: "center" };
const valueSx = { color: "#111827", fontWeight: 600, textAlign: "center" };

const get = (obj, keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== "") return obj[k];
  }
  return undefined;
};

// To Prevent accordion toggle
const handleIconClick = (e, fn) => {
  e.stopPropagation();
  e.preventDefault();
  fn();
};

const Field = ({ label, value }) => (
  <Box>
    <Typography variant="caption" sx={labelSx}>{label}</Typography>
    <Box sx={{ height: 6 }} />
    <Typography variant="body1" sx={valueSx}>{value ?? "-"}</Typography>
  </Box>
);

// No custom Section; we use MUI Accordion for collapsible sections

const AppointmentDetailsDialog = ({ open, onClose, appointment, showDiagnosis = true }) => {

  const normalized = useMemo(() => {
    if (!appointment) return null;
    const a = appointment;
    return {
      appointment_id: a.appointment_id,
      patient_name: get(a, ["patient_name", "name", "firstname"]),
      contact: get(a, ["contact_number", "phone"]),
      doctor_name: get(a, ["doctor_name", "doctor"]),
      facility_name: get(a, ["facility_name", "facility"]),
      date: get(a, ["date", "appointment_date"]),
      time_slot: a.time_slot,
      is_paid: get(a, ["is_paid", "paid"]) ?? false,
      payment_method: get(a, ["payment_method", "payment_type"]),
      diagnosis_id: a.diagnosis_id,
      patient_id: get(a, ["patient_id", "PatientID"]),
      doctor_id: a.doctor_id,
      facility_id: a.facility_id,
    };
  }, [appointment]);

  const { data: diagnosis } = useQuery({
    queryKey: [
      "queryGetDiagnosisForDetails",
      normalized?.patient_id,
      normalized?.doctor_id,
      normalized?.diagnosis_id,
    ],
    queryFn: () =>
      getPatientDiagnosis({
        patient_id: normalized.patient_id,
        doctor_id: normalized.doctor_id,
        diagnosis_id: normalized.diagnosis_id,
        facility_id: normalized.facility_id,
      }),
    enabled:
      showDiagnosis && open && Boolean(normalized?.patient_id && normalized?.doctor_id && normalized?.diagnosis_id),
    select: (arr) => arr?.[0],
  });

  const { data: patientDetails } = useQuery({
    queryKey: [
      "queryGetPatientDetails",
      normalized?.patient_id,
      normalized?.facility_id,
    ],
    queryFn: () =>
      getPatientDetailsById({
        patient_id: normalized.patient_id,
        facility_id: normalized.facility_id,
      }),
    enabled:
      open && Boolean(normalized?.patient_id && normalized?.facility_id),
  });

  const { data: reports = [], isLoading: isReportsLoading } = useQuery({
    queryKey: [
      "queryGetPatientReports",
      normalized?.patient_id,
      normalized?.appointment_id,
      normalized?.facility_id,
    ],
    queryFn: () =>
      getPatientReports({
        patient_id: normalized.patient_id,
        appointment_id: normalized.appointment_id,
        facility_id: normalized.facility_id,
      }),
    enabled: showDiagnosis && open && Boolean(normalized?.patient_id && normalized?.appointment_id),
  });

  // Add/Edit Diagnosis dialog control
  const [diagOpen, setDiagOpen] = useState(false);
  const { setPatientDiagnosis, onReset: resetDiagnosis } = usePatientDiagnosis();
  const [openReports, setOpenReports] = useState(false);
  const [patientReportsObj, setPatientReportsObj] = useState({});

  const handleOpenAddDiagnosis = () => {
    resetDiagnosis();
    setPatientDiagnosis({
      appointment_id: normalized?.appointment_id,
      doctor_id: normalized?.doctor_id,
      facility_id: normalized?.facility_id,
      patient_id: normalized?.patient_id,
      diagnosis_date: dayjs().format("YYYY-MM-DD"),
    });
    setDiagOpen(true);
  };

  const handleOpenEditDiagnosis = () => {
    setPatientDiagnosis({
      appointment_id: diagnosis?.appointment_id ?? normalized?.appointment_id,
      doctor_id: diagnosis?.doctor_id ?? normalized?.doctor_id,
      facility_id: diagnosis?.facility_id ?? normalized?.facility_id,
      patient_id: diagnosis?.patient_id ?? normalized?.patient_id,
      diagnosis_id: diagnosis?.diagnosis_id,
      diagnosis_date: diagnosis?.diagnosis_date ?? dayjs().format("YYYY-MM-DD"),
      chief_complaint: diagnosis?.chief_complaint,
      assessment_notes: diagnosis?.assessment_notes,
      treatment_plan: diagnosis?.treatment_plan,
      recomm_tests: diagnosis?.recomm_tests,
      vital_bp: diagnosis?.vital_bp,
      vital_hr: diagnosis?.vital_hr,
      vital_temp: diagnosis?.vital_temp,
      vital_spo2: diagnosis?.vital_spo2,
      height: diagnosis?.height,
      weight: diagnosis?.weight,
      followup_date: diagnosis?.followup_date,
    });
    setDiagOpen(true);
  };

  const seedReportsObj = () => ({
    appointment_id: normalized?.appointment_id,
    patient_id: normalized?.patient_id,
    doctor_id: normalized?.doctor_id,
    diagnosis_id: diagnosis?.diagnosis_id,
    facility_id: normalized?.facility_id,
  });

  const handleOpenAddReports = () => {
    setPatientReportsObj(seedReportsObj());
    setOpenReports(true);
  };

  const handleOpenEditReports = () => {
    setPatientReportsObj(seedReportsObj());
    setOpenReports(true);
  };

  const ReportThumb = ({ report }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [dataUrl, setDataUrl] = useState(undefined);

    const { data: blob } = useQuery({
      queryKey: [
        "queryGetPatientReportFile",
        normalized?.patient_id,
        normalized?.facility_id,
        report?.upload_id,
      ],
      queryFn: () =>
        getPatientReportFileDownload({
          patient_id: normalized.patient_id,
          facility_id: normalized.facility_id,
          upload_id: report.upload_id,
        }),
      enabled: open && Boolean(report?.upload_id),
    });

    // Convert blob to data URL so the thumbnail/preview keeps working even after dialogs mount/unmount
    useEffect(() => {
      if (!blob) {
        setDataUrl(undefined);
        return;
      }

      let cancelled = false;
      const reader = new FileReader();
      reader.onload = () => {
        if (!cancelled) setDataUrl(reader.result);
      };
      reader.onerror = () => {
        if (!cancelled) setDataUrl(undefined);
      };
      reader.readAsDataURL(blob);

      return () => {
        cancelled = true;
        // reader.abort may not be available in all browsers but call if present
        try { reader.abort && reader.abort(); } catch (e) {}
      };
    }, [blob]);

    const handleView = () => {
      if (!dataUrl) return;
      setPreviewOpen(true);
    };

    const handleClosePreview = () => {
      setPreviewOpen(false);
    };

    return (
      <>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Box sx={{
            width: 72,
            height: 72,
            borderRadius: 1,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            backgroundColor: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {dataUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <img src={dataUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Box sx={{ fontSize: 12, color: "#6b7280" }}>Preview</Box>
            )}
          </Box>
          <IconButton size="small" onClick={handleView} disabled={!dataUrl}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>

        <Dialog
          open={previewOpen}
          // onClose={handleClosePreview}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Report Preview</DialogTitle>
          <DialogContent>
            <Box sx={{ 
              width: "100%", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              minHeight: "60vh"
            }}>
              {dataUrl && (
                <img
                  src={dataUrl}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain"
                  }}
                  alt="Report Preview"
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <StyledButton onClick={handleClosePreview}>Close</StyledButton>
          </DialogActions>
        </Dialog>
      </>
    );
  };


  return (
    <>
    <Dialog open={open} 
      // onClose={onClose}
 maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
        Appointment
      </DialogTitle>
      <DialogContent>
        {normalized && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Patient Details moved above and accordion removed */}
            <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, width: "100%", textAlign: "left", mb: 2 }}>Patient Details</Typography>
              {!normalized?.patient_id ? (
                <Typography variant="body2" sx={{ color: "#6b7280", textAlign: "center" }}>No patient details available</Typography>
              ) : !patientDetails ? (
                <Typography variant="body2" sx={{ color: "#6b7280", textAlign: "center" }}>Loading patient details...</Typography>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={6} md={3}><Field label="Patient ID" value={patientDetails.id || patientDetails.patient_id} /></Grid>
                  <Grid item xs={6} md={3}><Field label="First Name" value={patientDetails.firstname} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Last Name" value={patientDetails.lastname} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Age" value={patientDetails.age} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Date of Birth" value={patientDetails.dob ? dayjs(patientDetails.dob).format("DD-MM-YYYY") : "-"} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Contact Number" value={patientDetails.contact_number} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Gender" value={patientDetails.gender} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Address" value={patientDetails.address} /></Grid>
                  <Grid item xs={6} md={3}><Field label="ABDM ABHA ID" value={patientDetails.ABDM_ABHA_id} /></Grid>
                </Grid>
              )}
            </Box>

            <Accordion defaultExpanded sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, width: "100%", textAlign: "left" }}>Appointment Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <Grid container spacing={3} textAlign="center">
                <Grid item xs={6} md={3}><Field label="Appointment ID" value={normalized.appointment_id} /></Grid>
                <Grid item xs={6} md={3}><Field label="Patient Name" value={normalized.patient_name} /></Grid>
                <Grid item xs={6} md={3}><Field label="Contact" value={normalized.contact} /></Grid>
                <Grid item xs={6} md={3}><Field label="Doctor" value={normalized.doctor_name} /></Grid>
                <Grid item xs={6} md={3}><Field label="Date" value={normalized.date ? dayjs(normalized.date).format("DD-MM-YYYY") : "-"} /></Grid>
                <Grid item xs={6} md={3}><Field label="Time Slot" value={normalized.time_slot} /></Grid>
                <Grid item xs={6} md={3}>
                  <Box>
                    <Typography variant="caption" sx={labelSx}>Payment Status</Typography>
                    <Box sx={{ height: 4 }} />
                    <Chip
                      label={normalized.is_paid ? "Paid" : "Unpaid"}
                      size="small"
                      sx={{
                        backgroundColor: normalized.is_paid ? "#16a34a" : "#ef4444",
                        color: "#fff",
                        fontWeight: 700,
                        width: 70,
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}><Field label="Payment Method" value={normalized.payment_method} /></Grid>
                <Grid item xs={6} md={3}><Field label="Diagnosis ID" value={normalized.diagnosis_id} /></Grid>
              </Grid>
              </AccordionDetails>
            </Accordion>

            {showDiagnosis && (
            <Accordion defaultExpanded sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: "left" }}>Diagnosis Details</Typography>
                  {diagnosis ? (
                    <IconButton
                      size="small"
                      aria-label="Edit Diagnosis"
                      onClick={(e) => handleIconClick(e, handleOpenEditDiagnosis)}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <EditOutlinedIcon />
                    </IconButton>

                  ) : (
                    <IconButton
                      size="small"
                      aria-label="Add Diagnosis"
                      onClick={(e) => handleIconClick(e, handleOpenAddDiagnosis)}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>

                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}><Field label="diagnosis id" value={diagnosis?.diagnosis_id} /></Grid>
                <Grid item xs={6} md={3}><Field label="facility id" value={diagnosis?.facility_id} /></Grid>
                <Grid item xs={6} md={3}><Field label="patient id" value={diagnosis?.patient_id} /></Grid>
                <Grid item xs={6} md={3}><Field label="diagnosis date" value={diagnosis?.diagnosis_date} /></Grid>
                <Grid item xs={6} md={3}><Field label="appointment id" value={diagnosis?.appointment_id} /></Grid>
                <Grid item xs={6} md={3}><Field label="doctor id" value={diagnosis?.doctor_id} /></Grid>
                <Grid item xs={6} md={3}><Field label="vital bp" value={diagnosis?.vital_bp} /></Grid>
                <Grid item xs={6} md={3}><Field label="vital hr" value={diagnosis?.vital_hr} /></Grid>
                <Grid item xs={6} md={3}><Field label="vital temp" value={diagnosis?.vital_temp} /></Grid>
                <Grid item xs={6} md={3}><Field label="vital spo2" value={diagnosis?.vital_spo2} /></Grid>
                <Grid item xs={6} md={3}><Field label="weight" value={diagnosis?.weight} /></Grid>
                <Grid item xs={6} md={3}><Field label="height" value={diagnosis?.height} /></Grid>
                <Grid item xs={6} md={3}><Field label="chief complaint" value={diagnosis?.chief_complaint} /></Grid>
                <Grid item xs={6} md={3}><Field label="assessment notes" value={diagnosis?.assessment_notes} /></Grid>
              </Grid>
              </AccordionDetails>
            </Accordion>
            )}

            {showDiagnosis && (
            <Accordion defaultExpanded sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: "left" }}>Reports</Typography>
                  {reports && reports.length > 0 ? (
                    <IconButton
                      size="small"
                      aria-label="Edit Reports"
                      onClick={(e) => handleIconClick(e, handleOpenEditReports)}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <EditOutlinedIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      aria-label="Add Reports"
                      onClick={(e) => handleIconClick(e, handleOpenAddReports)}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {isReportsLoading ? (
                  <Typography variant="body2" sx={{ color: "#6b7280", textAlign: "center" }}>Loading reports…</Typography>
                ) : reports && reports.length > 0 ? (
                  <Grid container spacing={2}>
                    {reports.map((rep) => (
                      <Grid item key={rep.upload_id} xs={4} md={2}>
                        <ReportThumb report={rep} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" sx={{ color: "#6b7280", textAlign: "center" }}>No reports found</Typography>
                )}
              </AccordionDetails>
            </Accordion>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mb: 1 }}>
        <StyledButton variant="outlined" onClick={onClose}>Close</StyledButton>
      </DialogActions>
    </Dialog>
    <PatientReports
      open={openReports}
      setOpen={setOpenReports}
      patientReportsObj={patientReportsObj}
      setPatientReportObj={setPatientReportsObj}
    />
    <AddOrEditPatientDiagnosis open={diagOpen} setOpen={setDiagOpen} />
  </>
  );
};

export default AppointmentDetailsDialog;


