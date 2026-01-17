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
import { getPatientDetailsById, getAppointmentDetailsById } from "@/serviceApis";
import { getPatientReports } from "@/serviceApis";
import { getPatientReportFileDownload } from "@/serviceApis";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddOrEditPatientDiagnosis from "@/ReusableComponents/AddOrEditPatientDiagnosis";
import { usePatientDiagnosis } from "@/stores/patientStore";
import PatientReports from "@/ReusableComponents/PatientReports";

const labelSx = { color: "#6b7280", fontWeight: 600, textTransform: "uppercase", textAlign: "center", fontSize: "1.00rem" };
const valueSx = { color: "#111827", fontWeight: 600, textAlign: "center", fontSize: "1.15rem" };

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

  const { data: fetchedAppointment } = useQuery({
    queryKey: ["appointmentDetailsDialog", appointment?.appointment_id, appointment?.facility_id],
    queryFn: () =>
      getAppointmentDetailsById({
        appointment_id: appointment?.appointment_id,
        facility_id: appointment?.facility_id,
      }),
    enabled: open && Boolean(appointment?.appointment_id && appointment?.facility_id),
  });

  const normalized = useMemo(() => {
    if (!appointment) return null;
    const fetched = Array.isArray(fetchedAppointment) ? fetchedAppointment[0] : fetchedAppointment;
    const a = fetched || appointment;
    const rawReview =
      a?.is_review ??
      a?.isReview ??
      a?.IsReview ??
      a?.review ??
      a?.Review;
    const review =
      rawReview === true ||
      rawReview === 1 ||
      rawReview === "1" ||
      String(rawReview).toLowerCase() === "true";
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
      is_review: review,
    };
  }, [appointment, fetchedAppointment]);

  const { data: diagnosis, isLoading: isDiagLoading } = useQuery({
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
    const [previewUrl, setPreviewUrl] = useState(undefined);
    const [previewType, setPreviewType] = useState(undefined);
    const [previewName, setPreviewName] = useState(report?.filename || "File");

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

    useEffect(() => {
      // Build a blob URL with correct mime so PDFs render in iframe
      if (!blob) {
        setPreviewUrl(undefined);
        setPreviewType(undefined);
        return;
      }
      const ext = String(report?.filename || "").split(".").pop()?.toLowerCase();
      let mime = "application/octet-stream";
      if (ext === "pdf") mime = "application/pdf";
      else if (ext === "jpg" || ext === "jpeg") mime = "image/jpeg";
      else if (ext === "png") mime = "image/png";
      const url = URL.createObjectURL(new Blob([blob], { type: mime }));
      setPreviewUrl(url);
      setPreviewType(mime);
      setPreviewName(report?.filename || "File");
      return () => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      };
    }, [blob, report?.filename]);

    const handleView = () => {
      if (!previewUrl) return;
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
            {previewType && previewType.startsWith("image/") && previewUrl ? (
              <img src={previewUrl} alt={previewName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : previewType === "application/pdf" && previewUrl ? (
              <iframe src={previewUrl} title={previewName} style={{ width: "100%", height: "100%", border: "none" }} />
            ) : (
              <Box sx={{ fontSize: 12, color: "#6b7280" }}>Preview</Box>
            )}
          </Box>
          <IconButton size="small" onClick={handleView} disabled={!previewUrl}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>

        <Dialog
          open={previewOpen}
          // onClose={handleClosePreview}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>{previewName || "Report Preview"}</DialogTitle>
          <DialogContent sx={{ p: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
            {previewUrl && previewType && (
              previewType.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt={previewName}
                  style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain" }}
                />
              ) : previewType === "application/pdf" ? (
                <iframe
                  src={previewUrl}
                  title={previewName}
                  style={{ width: "100%", height: "75vh", border: "none" }}
                />
              ) : (
                <Box sx={{ color: "#000000ff", p: 3 }}>
                  Preview not available for this file type.
                </Box>
              )
            )}
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
 maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, textAlign: "center", fontSize: "1.3rem" }}>
        Appointment
      </DialogTitle>
      <DialogContent>
        {normalized && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Patient Details moved above and accordion removed */}
            <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, width: "100%", textAlign: "left", mb: 2, fontSize: "1.10rem" }}>Patient Details</Typography>
              {!normalized?.patient_id ? (
                <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>No patient details available</Typography>
              ) : !patientDetails ? (
                <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>Loading patient details...</Typography>
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700, width: "100%", textAlign: "left", fontSize: "1.10rem" }}>Appointment Details</Typography>
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
                      label={
                        normalized.is_review
                          ? "Not Required"
                          : normalized.is_paid
                          ? "Paid"
                          : "Unpaid"
                      }
                      size="small"
                      sx={{
                        backgroundColor: normalized.is_review
                          ? "#3b82f6"
                          : normalized.is_paid
                          ? "#16a34a"
                          : "#ef4444",
                        color: "#fff",
                        fontWeight: 700,
                        width: 110,
                      }}
                    />
                  </Box>
                </Grid>
                {!normalized.is_review && (
  <Grid item xs={6} md={3}><Field label="Payment Method" value={normalized.payment_method} /></Grid>
)}
                <Grid item xs={6} md={3}><Field label="Diagnosis ID" value={normalized.diagnosis_id} /></Grid>
              </Grid>
              </AccordionDetails>
            </Accordion>

            {showDiagnosis && (
            <Accordion defaultExpanded sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: "left", fontSize: "1.10rem" }}>Diagnosis Details</Typography>
                  {/* {diagnosis ? (
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
                  )} */}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {isDiagLoading ? (
                  <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>Loading Diagnosis...</Typography>
                ) : !diagnosis ? (
                  <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>No Diagnosis Found</Typography>
                ) : (
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
                    {/* <Grid item xs={6} md={3}><Field label="assessment notes" value={diagnosis?.assessment_notes} /></Grid> */}
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>
            )}

            {showDiagnosis && (
            <Accordion defaultExpanded sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: "left", fontSize: "1.10rem" }}>Reports</Typography>
                  {/* {reports && reports.length > 0 ? (
                    <IconButton
                      size="small"
                      aria-label="Edit Reports"
                      onClick={(e) => handleIconClick(e, handleOpenEditReports)}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <EditOutlinedIcon />
                    </IconButton>
                  ) : ( */}
                    <IconButton
                      size="small"
                      aria-label="Add Reports"
                      onClick={(e) => handleIconClick(e, handleOpenAddReports)}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <AddCircleOutlineIcon sx={{ color: "#115E59", fontSize: "1.55rem" }} />
                    </IconButton>
                  {/* )} */}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {isReportsLoading ? (
                  <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.00rem" }}>Loading reports…</Typography>
                ) : reports && reports.length > 0 ? (
                  <Grid container spacing={2}>
                    {reports.map((rep) => (
                      <Grid item key={rep.upload_id} xs={4} md={2}>
                        <ReportThumb report={rep} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.00rem" }}>No reports found</Typography>
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


