import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Toolbar,
  Typography,
  TextField,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";

import DiagnosisSection from "./DiagnosisSection";
import PrescriptionSection from "./PrescriptionSection";
import LabTestSection from "./LabTestSection";
import ProcedureSection from "./ProcedureSection";
import DiagnosisRightSidebar from "./DiagnosisRightSidebar";

import { useQuery } from "@tanstack/react-query";
import { dayjs } from "@/utils/dateUtils";
import { getPatientDiagnosis } from "@/serviceApis";
import { usePatientDiagnosis } from "@/stores/patientStore";

const Field = ({ label, value }) => (
  <Box textAlign="center">
    <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 600 }}>{value ?? "-"}</Typography>
  </Box>
);

const ViewScreen = ({ open, onClose, appointment }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const diagnosisStore = usePatientDiagnosis();
  const {
    chief_complaint,
    vital_bp,
    vital_hr,
    vital_temp,
    height,
    weight,
    vital_spo2,
    diagnosis_id,
    onChangePatientDiagnosis,
    setPatientDiagnosis,
  } = diagnosisStore;

  const tokenNumber = appointment?.token ?? appointment?.appointment_id ?? "-";
  const patientName =
    appointment?.patient_name ??
    appointment?.name ??
    appointment?.firstname ??
    "-";
  const visitDate = appointment?.appointment_date
    ? dayjs(appointment.appointment_date).format("DD-MM-YYYY")
    : "-";

  /* -------- FETCH DIAGNOSIS -------- */
  const { data, isLoading } = useQuery({
    queryKey: ["diagnosis-view", appointment?.diagnosis_id],
    queryFn: () =>
      getPatientDiagnosis({
        patient_id: appointment?.patient_id,
        doctor_id: appointment?.doctor_id,
        diagnosis_id: appointment?.diagnosis_id,
        facility_id: appointment?.facility_id,
      }),
    enabled: open && Boolean(appointment?.diagnosis_id),
    select: (arr) => arr?.[0],
  });

  useEffect(() => {
    if (data) setPatientDiagnosis(data);
  }, [data, setPatientDiagnosis]);

  /* -------- SUBMIT -------- */
  const handleSubmit = () => setConfirmOpen(true);
  const handleConfirmSubmit = () => {
    setConfirmOpen(false);
    console.log("Submitting diagnosis:", diagnosisStore);
  };

  return (
    <>
      <Dialog fullScreen open={open} onClose={onClose}>
        {/* App Bar */}
        <AppBar sx={{ bgcolor: "#115E59" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              Doctor Diagnosis
            </Typography>
            <IconButton color="inherit" onClick={() => window.print()}>
              <PrintIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Toolbar />

        <Box sx={{ display: "flex" }}>
          {/* MAIN */}
          <Box sx={{ flex: 1, p: 3 }}>
            {/* Patient Header */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Field label="Token" value={tokenNumber} />
              <Field label="Patient" value={patientName} />
              <Field label="Visit Date" value={visitDate} />
            </Box>

            {/* Vitals */}
            <Box sx={{ border: "1px solid #e5e7eb", p: 2, borderRadius: 2 }}>
              <Typography fontWeight={700} mb={2}>
                Vitals
              </Typography>

              {isLoading ? (
                <Typography align="center">Loading...</Typography>
              ) : !diagnosis_id ? (
                <Typography align="center">No Diagnosis Found</Typography>
              ) : (
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Field label="BP" value={vital_bp} />
                  <Field label="HR" value={vital_hr} />
                  <Field label="Temp" value={vital_temp} />
                  <Field label="Height" value={height} />
                  <Field label="Weight" value={weight} />
                  <Field label="SPO2" value={vital_spo2} />
                </Box>
              )}
            </Box>

            {/* Chief Complaint */}
            <Box sx={{ border: "1px solid #e5e7eb", p: 2, mt: 3 }}>
              <Typography fontWeight={700} mb={1}>
                Chief Complaints
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={chief_complaint ?? ""}
                onChange={(e) =>
                  onChangePatientDiagnosis("chief_complaint", e.target.value)
                }
              />
            </Box>

            {/* Sections */}
            <DiagnosisSection
              patientId={appointment?.patient_id}
              patientName={patientName}
              tokenNumber={tokenNumber}
              appointmentDate={visitDate}
            />
            <PrescriptionSection {...{ patientName, tokenNumber, visitDate }} />
            <LabTestSection {...{ patientName, tokenNumber, visitDate }} />
            <ProcedureSection {...{ patientName, tokenNumber, visitDate }} />

            {/* Submit */}
            <Box textAlign="center" mt={3}>
              <Button variant="contained" onClick={handleSubmit}>
                Submit
              </Button>
            </Box>
          </Box>

          {/* SIDEBAR */}
          <DiagnosisRightSidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen((p) => !p)}
            patientId={appointment?.patient_id}
          />
        </Box>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          Are you sure you want to submit this diagnosis?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmSubmit}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewScreen;
