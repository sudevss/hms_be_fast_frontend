import { useMemo } from "react";
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
import StyledButton from "@/components/StyledButton";
import { dayjs } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { getPatientDiagnosis } from "@/serviceApis";

const labelSx = { color: "#6b7280", fontWeight: 600, textTransform: "uppercase", textAlign: "center" };
const valueSx = { color: "#111827", fontWeight: 600, textAlign: "center" };

const get = (obj, keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== "") return obj[k];
  }
  return undefined;
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
        Appointment
      </DialogTitle>
      <DialogContent>
        {normalized && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Accordion defaultExpanded sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, width: "100%", textAlign: "left" }}>Appointment Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <Grid container spacing={3}>
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700, width: "100%", textAlign: "left" }}>Diagnosis Details</Typography>
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
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mb: 1 }}>
        <StyledButton variant="outlined" onClick={onClose}>Close</StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;


