import { useMemo, useState, useEffect } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getPatientDetailsById, getAppointmentsAndBookings, getPatientDiagnosis, getPatientReports, getPatientReportFileDownload } from "@/serviceApis";
import { userLoginDetails } from "@/stores/LoginStore";
import { usePatient } from "@/stores/patientStore";
import StyledButton from "@components/StyledButton";
import AddOrEditPatient from "@pages/Patients/AddOrEditPatient";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { dayjs } from "@/utils/dateUtils";

const labelSx = { color: "#6b7280", fontWeight: 600, textTransform: "uppercase", textAlign: "center", fontSize: "1.00rem" };
const valueSx = { color: "#111827", fontWeight: 600, textAlign: "center", fontSize: "1.05rem" };

const Field = ({ label, value }) => (
  <Box>
    <Typography variant="caption" sx={labelSx}>{label}</Typography>
    <Box sx={{ height: 6 }} />
    <Typography variant="body1" sx={valueSx}>{value ?? "-"}</Typography>
  </Box>
);

const PatientDetailsDialog = ({ open, onClose, patientId }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const { setPatientData, onReset } = usePatient();
  const facilityId = userLoginDetails.getState()?.facility_id || 1;

  const { data: patientDetails } = useQuery({
    queryKey: ["queryGetPatientDetails", Number(patientId), facilityId],
    queryFn: () => getPatientDetailsById({ patient_id: patientId, facility_id: facilityId }),
    enabled: open && Boolean(patientId),
  });

  const startDate = dayjs().subtract(12, "month").format("YYYY-MM-DD");
  const endDate = dayjs().format("YYYY-MM-DD");
  const { data: history = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: [
      "queryGetAppointmentsAndBookings",
      startDate,
      "Completed",
      Number(patientId),
      endDate,
    ],
    queryFn: () =>
      getAppointmentsAndBookings({
        date: startDate,
        facility_id: facilityId,
        appointment_status: "Completed",
        end_date: endDate,
        patient_id: patientId,
      }),
    enabled: open && Boolean(patientId),
  });

  const normalized = useMemo(() => {
    if (!patientDetails) return null;
    const p = patientDetails;
    return {
      id: p.id || p.patient_id,
      firstname: p.firstname,
      lastname: p.lastname,
      age: p.age,
      dob: p.dob,
      contact_number: p.contact_number,
      gender: p.gender,
      address: p.address,
      ABDM_ABHA_id: p.ABDM_ABHA_id,
      email_id: p.email_id,
    };
  }, [patientDetails]);

  const handleOpenEdit = () => {
    onReset();
    if (normalized) setPatientData(normalized);
    setOpenEdit(true);
  };

  const DiagnosisSection = ({ appt }) => {
    const { data: diag, isLoading: isDiagLoading } = useQuery({
      queryKey: [
        "queryGetDiagnosisForHistory",
        appt?.patient_id || normalized?.id,
        appt?.doctor_id,
        appt?.diagnosis_id,
      ],
      queryFn: () =>
        getPatientDiagnosis({
          patient_id: appt?.patient_id || normalized?.id,
          doctor_id: appt?.doctor_id,
          diagnosis_id: appt?.diagnosis_id,
          facility_id: appt?.facility_id || facilityId,
        }),
      enabled: open && Boolean((appt?.patient_id || normalized?.id) && appt?.doctor_id && appt?.diagnosis_id),
      select: (arr) => arr?.[0],
    });

    return (
      <Accordion sx={{ borderRadius: 1, border: "1px solid #e5e7eb", boxShadow: "none", mt: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
          <Typography variant="body1" sx={{ fontWeight: 700, fontSize: "1.05rem" }}>Diagnosis Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {isDiagLoading ? (
            <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>Loading diagnosis…</Typography>
          ) : !diag ? (
            <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>No diagnosis found</Typography>
          ) : (
            <Grid
              container
              columnSpacing={{ xs: 2, md: 4, lg: 6 }}
              rowSpacing={{ xs: 1.5, md: 2.5, lg: 3 }}
            >
              <Grid item xs={6} md={3}><Field label="diagnosis id" value={diag?.diagnosis_id} /></Grid>
              <Grid item xs={6} md={3}><Field label="diagnosis date" value={diag?.diagnosis_date} /></Grid>
              <Grid item xs={6} md={3}><Field label="chief complaint" value={diag?.chief_complaint} /></Grid>
              {/* <Grid item xs={6} md={3}><Field label="assessment notes" value={diag?.assessment_notes} /></Grid>
              <Grid item xs={6} md={3}><Field label="treatment plan" value={diag?.treatment_plan} /></Grid>
              <Grid item xs={6} md={3}><Field label="recomm tests" value={diag?.recomm_tests} /></Grid> */}
              <Grid item xs={6} md={3}><Field label="vital bp" value={diag?.vital_bp} /></Grid>
              <Grid item xs={6} md={3}><Field label="vital hr" value={diag?.vital_hr} /></Grid>
              <Grid item xs={6} md={3}><Field label="vital temp" value={diag?.vital_temp} /></Grid>
              <Grid item xs={6} md={3}><Field label="vital spo2" value={diag?.vital_spo2} /></Grid>
              <Grid item xs={6} md={3}><Field label="weight" value={diag?.weight} /></Grid>
              <Grid item xs={6} md={3}><Field label="height" value={diag?.height} /></Grid>
            </Grid>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  const ReportThumb = ({ report, appointmentId, patientId, facilityId }) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(undefined);
    const [previewType, setPreviewType] = useState(undefined);
    const [previewName, setPreviewName] = useState(report?.filename || "File");

    const { data: blob } = useQuery({
      queryKey: [
        "queryGetPatientReportFile",
        Number(patientId),
        Number(facilityId),
        report?.upload_id,
      ],
      queryFn: () =>
        getPatientReportFileDownload({
          patient_id: patientId,
          facility_id: facilityId,
          upload_id: report.upload_id,
        }),
      enabled: open && Boolean(report?.upload_id),
    });

    useEffect(() => {
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

        <Dialog open={previewOpen} maxWidth="lg" fullWidth>
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

  const ReportsSection = ({ appt }) => {
    const { data: reports = [], isLoading: isReportsLoading } = useQuery({
      queryKey: [
        "queryGetPatientReports",
        Number(appt?.patient_id || normalized?.id),
        Number(appt?.appointment_id || appt?.id),
        Number(appt?.facility_id || facilityId),
      ],
      queryFn: () =>
        getPatientReports({
          patient_id: appt?.patient_id || normalized?.id,
          appointment_id: appt?.appointment_id || appt?.id,
          facility_id: appt?.facility_id || facilityId,
        }),
      enabled: open && Boolean((appt?.patient_id || normalized?.id) && (appt?.appointment_id || appt?.id)),
    });

    return (
      <Accordion sx={{ borderRadius: 1, border: "1px solid #e5e7eb", boxShadow: "none", mt: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
          <Typography variant="body1" sx={{ fontWeight: 700, fontSize: "1.05rem" }}>Reports</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {isReportsLoading ? (
            <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>Loading reports…</Typography>
          ) : reports && reports.length > 0 ? (
            <Grid container columnSpacing={{ xs: 2, md: 4, lg: 6 }} rowSpacing={{ xs: 1.5, md: 2.5, lg: 3 }}>
              {reports.map((rep) => (
                <Grid item key={rep.upload_id} xs={4} md={2}>
                  <ReportThumb report={rep} appointmentId={appt?.appointment_id || appt?.id} patientId={appt?.patient_id || normalized?.id} facilityId={appt?.facility_id || facilityId} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>No reports found</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <>
      <Dialog open={open} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, textAlign: "center", fontSize: "1.3rem" }}>Patient Information</DialogTitle>
        <DialogContent>
          {!patientId ? (
            <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>No patient selected</Typography>
          ) : (
            <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: "left", fontSize: "1.05rem" }}>Patient Details</Typography>
                <IconButton
                    size="small"
                    aria-label="Edit Patient"
                    onClick={handleOpenEdit} >
                  <EditOutlinedIcon sx={{ color: "#115E59", fontSize: "1.60rem" }}/>
                </IconButton>
              </Box>
              {!normalized ? (
                <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>Loading patient details…</Typography>
              ) : (
                <Grid
                  container
                  columnSpacing={{ xs: 2, md: 4, lg: 6 }}
                  rowSpacing={{ xs: 1.5, md: 2.5, lg: 3 }}
                >
                  <Grid item xs={6} md={3}><Field label="Patient ID" value={normalized.id} /></Grid>
                  <Grid item xs={6} md={3}><Field label="First Name" value={normalized.firstname} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Last Name" value={normalized.lastname} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Age" value={normalized.age} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Date of Birth" value={normalized.dob ? dayjs(normalized.dob).format("DD-MM-YYYY") : "-"} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Contact Number" value={normalized.contact_number} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Gender" value={normalized.gender} /></Grid>
                  <Grid item xs={6} md={3}><Field label="Address" value={normalized.address} /></Grid>
                  <Grid item xs={6} md={3}><Field label="ABDM ABHA ID" value={normalized.ABDM_ABHA_id} /></Grid>
                </Grid>
              )}
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Accordion defaultExpanded sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: "left", fontSize: "1.05rem" }}>Patient History</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {isHistoryLoading ? (
                  <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center" }}>Loading history…</Typography>
                ) : history && history.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {history.map((a) => {
                      const id = a.appointment_id || a.id;
                      const date = (a.date || a.appointment_date)
                        ? dayjs(a.date || a.appointment_date).format("DD-MM-YYYY")
                        : "-";
                      const doctor = a.doctor || a.doctor_name || "-";
                      const time = a.time_slot || "-";
                      const rawReview =
                        a?.is_review ??
                        a?.isReview ??
                        a?.IsReview ??
                        a?.review ??
                        a?.Review;
                      const isReview =
                        rawReview === true ||
                        rawReview === 1 ||
                        rawReview === "1" ||
                        String(rawReview).toLowerCase() === "true";
                      return (
                        <Accordion key={id} sx={{ borderRadius: 1, border: "1px solid #e5e7eb", boxShadow: "none" }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
                            <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
                              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: "1.00rem" }}>Appointment {id}</Typography>
                              <Box sx={{ display: "flex", gap: 2 }}>
                                <Typography variant="body1" sx={{ fontSize: "1.00rem", fontWeight: 600 }}>{date}</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.00rem" }}>{time}</Typography>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: "left", mb: 2, fontSize: "1.05rem" }}>Appointment Details</Typography>
                              <Grid
                                container
                                columnSpacing={{ xs: 2, md: 4, lg: 6 }}
                                rowSpacing={{ xs: 1.5, md: 2.5, lg: 3 }}
                              >
                                <Grid item xs={6} md={3}><Field label="Appointment ID" value={id} /></Grid>
                                <Grid item xs={6} md={3}><Field label="Date" value={date} /></Grid>
                                <Grid item xs={6} md={3}><Field label="Time Slot" value={time} /></Grid>
                                <Grid item xs={6} md={3}><Field label="Doctor" value={doctor} /></Grid>
                                {!isReview && <Grid item xs={6} md={3}><Field label="Payment Method" value={a.payment_method} /></Grid>}
                                <Grid item xs={6} md={3}><Field label="Payment Status" value={isReview ? "Not Required" : (a.is_paid || a.paid ? "Paid" : "Unpaid")} /></Grid>
                                {!isReview && <Grid item xs={6} md={3}><Field label="Consultation Fee" value={a.consultation_fee} /></Grid>}
                                <Grid item xs={6} md={3}><Field label="Diagnosis ID" value={a.diagnosis_id} /></Grid>
                              </Grid>
                            </Box>
                            <DiagnosisSection appt={a} />
                            <ReportsSection appt={a} />
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>No history found</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 1 }}>
          <StyledButton variant="outlined" onClick={onClose}>Close</StyledButton>
        </DialogActions>
      </Dialog>
      <AddOrEditPatient open={openEdit} setOpen={setOpenEdit} />
    </>
  );
};

export default PatientDetailsDialog;
