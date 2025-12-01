import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Toolbar,
  Typography,
  Grid,
  Divider,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
// import SaveIcon from "@mui/icons-material/Save";
import { useQuery } from "@tanstack/react-query";
import { dayjs } from "@/utils/dateUtils";
import { getPatientDiagnosis } from "@/serviceApis";
import DiagnosisSection from "./DiagnosisSection";
import PrescriptionSection from "./PrescriptionSection";
import LabTestSection from "./LabTestSection";
import ProcedureSection from "./ProcedureSection";
import PreviousAppointments from "./PreviousAppointments";
import StyledButton from "@components/StyledButton";
import DiagnosisRightSidebar from "./DiagnosisRightSidebar";

const labelSx = { color: "#6b7280", fontWeight: 600, textTransform: "uppercase", fontSize: "1.0rem" };
const valueSx = { color: "#111827", fontWeight: 600, fontSize: "1.0rem" };

const Field = ({ label, value }) => (
  <Box>
    <Typography variant="caption" sx={labelSx}>{label}</Typography>
    <Box sx={{ height: 6 }} />
    <Typography variant="body1" sx={valueSx}>{value ?? "-"}</Typography>
  </Box>
);

const ViewScreen = ({ open, onClose, appointment /*, onSave */ }) => {
  const [currentAppointment, setCurrentAppointment] = useState(appointment);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => { setCurrentAppointment(appointment); }, [appointment]);
  const tokenNumber = currentAppointment?.token ?? currentAppointment?.appointment_id ?? "-";
  const patientName = currentAppointment?.patient_name ?? currentAppointment?.name ?? currentAppointment?.firstname ?? "-";
  const visitDateRaw = currentAppointment?.date ?? currentAppointment?.appointment_date;
  const visitDate = visitDateRaw ? dayjs(visitDateRaw).format("DD-MM-YYYY") : "-";

  const { data: diagnosis, isLoading: isDiagLoading } = useQuery({
    queryKey: [
      "queryGetDiagnosisForViewScreen",
      currentAppointment?.patient_id,
      currentAppointment?.doctor_id,
      currentAppointment?.diagnosis_id,
    ],
    queryFn: () =>
      getPatientDiagnosis({
        patient_id: currentAppointment?.patient_id,
        doctor_id: currentAppointment?.doctor_id,
        diagnosis_id: currentAppointment?.diagnosis_id,
        facility_id: currentAppointment?.facility_id,
      }),
    enabled: open && Boolean(currentAppointment?.patient_id && currentAppointment?.doctor_id && currentAppointment?.diagnosis_id),
    select: (arr) => arr?.[0],
  });
  const [chiefComplaint, setChiefComplaint] = useState("");
  useEffect(() => {
    setChiefComplaint(diagnosis?.chief_complaint || "");
  }, [diagnosis]);

  /*
  // handleSave was added to call the optional onSave prop. Commenting out for now.
  const handleSave = () => {
    const payload = { appointment, diagnosis, chiefComplaint };
    if (typeof onSave === "function") {
      onSave(payload);
    } else {
      // fallback: log to console so developer can wire actual save logic
      // eslint-disable-next-line no-console
      console.log("ViewScreen save:", payload);
    }
  };
  */
  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      {/* Top AppBar */}
      <AppBar sx={{ position: "fixed", bgcolor: "#115E59", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>

          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Doctor Diagnosis
          </Typography>
          {currentAppointment?.appointment_id !== appointment?.appointment_id && (
            <StyledButton variant="outlined" onClick={() => setCurrentAppointment(appointment)}>Back</StyledButton>
          )}

          {/* Save button (commented out)
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ ml: 1 }}
          >
            Save
          </Button>
          */}
        </Toolbar>
      </AppBar>
      <Toolbar />

      {/* Page Content */}
      <Box sx={{ width: "100%", p: 0, display: "flex", gap: 2 }}>
        <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <Box sx={{ flex: "1 1 33%", textAlign: "left", width: "100%" }}>
                <Field label="Token Number" value={tokenNumber} />
              </Box>

              <Box sx={{ flex: "1 1 34%", textAlign: "center", width: "100%" }}>
                <Field label="Patient Name" value={patientName} />
              </Box>

              <Box sx={{ flex: "1 1 33%", textAlign: "right", width: "100%" }}>
                <Field label="Date of Visit" value={visitDate} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "1.0rem", mb: 2 }}>Vitals</Typography>
            {isDiagLoading ? (
              <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>Loading Diagnosis...</Typography>
            ) : !diagnosis ? (
              <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>No Diagnosis Found</Typography>
            ) : (
               <Box sx={{ display: "flex", gap: 2, width: "100%", flexWrap: "wrap", alignItems: "stretch" }}>
                 <Box sx={{ flex: "1 1 0", minWidth: { xs: "45%", md: 0 }, textAlign: "center" }}><Field label="Blood Pressure" value={diagnosis?.vital_bp} /></Box>
                 <Box sx={{ flex: "1 1 0", minWidth: { xs: "45%", md: 0 }, textAlign: "center" }}><Field label="Heart Rate" value={diagnosis?.vital_hr} /></Box>
                 <Box sx={{ flex: "1 1 0", minWidth: { xs: "45%", md: 0 }, textAlign: "center" }}><Field label="Temperature" value={diagnosis?.vital_temp} /></Box>
                 <Box sx={{ flex: "1 1 0", minWidth: { xs: "45%", md: 0 }, textAlign: "center" }}><Field label="Height" value={diagnosis?.height} /></Box>
                 <Box sx={{ flex: "1 1 0", minWidth: { xs: "45%", md: 0 }, textAlign: "center" }}><Field label="Weight" value={diagnosis?.weight} /></Box>
                 <Box sx={{ flex: "1 1 0", minWidth: { xs: "45%", md: 0 }, textAlign: "center" }}><Field label="SPO2" value={diagnosis?.vital_spo2} /></Box>
               </Box>
            )}
          </Box>

          <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2, mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "1.0rem", mb: 2 }}>Chief Complaints</Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Enter chief complaints"
            />
          </Box>

          <DiagnosisSection />
          <PrescriptionSection />
          <LabTestSection />
          <ProcedureSection />
        </Box>
        <DiagnosisRightSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          patientId={currentAppointment?.patient_id}
        />
      </Box>
    </Dialog>
  );
};

export default ViewScreen;
