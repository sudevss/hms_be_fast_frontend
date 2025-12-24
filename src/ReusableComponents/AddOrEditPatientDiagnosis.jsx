import {
  Dialog,
  DialogTitle,
  Alert,
  AlertTitle,
  DialogActions,
  DialogContent,
  Button,
  Typography,
  Stack,
  Box,
} from "@mui/material";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import StyledButton from "@components/StyledButton";
import TextInputWithLabel from "@components/inputs/TextInputWithLabel";
import TextAreaInputWithLabel from "@components/inputs/TextAreaInputWithLabel";
import { getPaientDetailsByPhone, putAddPatientDiagnosis } from "@/serviceApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import PageLoader from "@pages/PageLoader";
import DatePickerComponent from "@components/DatePicker";
import AlertSnackbar from "@components/AlertSnackbar";
import { usePatient, usePatientDiagnosis } from "@/stores/patientStore";
import { INITIAL_SHOW_ALERT } from "@data/staticData";
import { useShowAlert } from "@/stores/showAlertStore";
import dayjs from "dayjs";

const AddOrEditPatientDiagnosis = ({ open, setOpen }) => {
  const patientDiagnosisStore = usePatientDiagnosis();
  const {
    appointment_id,
    assessment_notes,
    chief_complaint,
    diagnosis_date,
    doctor_id,
    facility_id,
    followup_date,
    patient_id,
    recomm_tests,
    treatment_plan,
    vital_bp,
    height,
    weight,
    vital_hr,
    vital_spo2,
    vital_temp,
    onReset,
    onChangePatientDiagnosis,
    diagnosis_id,
    setPatientDiagnosis,
  } = patientDiagnosisStore;

  // Local state for instant feedback
  const [localValues, setLocalValues] = useState({});
  const updateTimerRef = useRef({});

  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();

  const queryClient = useQueryClient();

  // Sync local state with store when dialog opens
  useEffect(() => {
    if (open) {
      setLocalValues({
        vital_bp,
        vital_hr,
        vital_temp,
        height,
        weight,
        vital_spo2,
        chief_complaint,
        assessment_notes,
        treatment_plan,
        recomm_tests,
      });
    }
  }, [open]);

  const mutationAddOrUpdatePatientDiagnosis = useMutation({
    mutationFn: (payload) => putAddPatientDiagnosis(payload),
    onSuccess: (res) => {
      onReset();
      setLocalValues({});
      setShowAlert({
        show: true,
        message: `Patient Diagnosis update has successfully`,
        status: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["queryGetAppointmentsAndBookings"],
        exact: false,
        refetchActive: true,
        refetchInactive: false,
      });
      queryClient.invalidateQueries({ 
        queryKey: ["queryGetDiagnosisForDetails"], 
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["queryGetDiagnosisForHistory"], 
        exact: false 
      });
      
      setOpen(false);
    },
    onError: (error) => {
      console.error('Diagnosis update error:', error);
      setShowAlert({
        show: true,
        message: "Patient Diagnosis update Failed",
        status: "error",
      });
    },
  });

  // Handle input change with debounced store update
  const handleInputChange = useCallback((name, value) => {
    // Update local state immediately for instant feedback
    setLocalValues(prev => ({ ...prev, [name]: value }));

    // Clear existing timer for this field
    if (updateTimerRef.current[name]) {
      clearTimeout(updateTimerRef.current[name]);
    }

    // Debounce the store update
    updateTimerRef.current[name] = setTimeout(() => {
      onChangePatientDiagnosis(name, value);
      delete updateTimerRef.current[name];
    }, 150);
  }, [onChangePatientDiagnosis]);

  // Handle blur to immediately sync if needed
  const handleBlur = useCallback((name) => {
    if (updateTimerRef.current[name]) {
      clearTimeout(updateTimerRef.current[name]);
      onChangePatientDiagnosis(name, localValues[name]);
      delete updateTimerRef.current[name];
    }
  }, [localValues, onChangePatientDiagnosis]);

  const reqPayload = () => {
    const payload = {
      appointment_id,
      assessment_notes: localValues.assessment_notes ?? assessment_notes,
      chief_complaint: localValues.chief_complaint ?? chief_complaint,
      diagnosis_date,
      doctor_id,
      facility_id,
      patient_id,
      recomm_tests: localValues.recomm_tests ?? recomm_tests,
      treatment_plan: localValues.treatment_plan ?? treatment_plan,
      vital_bp: localValues.vital_bp ?? vital_bp,
      vital_hr: localValues.vital_hr ?? vital_hr,
      vital_spo2: localValues.vital_spo2 ?? vital_spo2,
      vital_temp: localValues.vital_temp ?? vital_temp,
      height: localValues.height ?? height,
      weight: localValues.weight ?? weight,
      diagnosis_id,
    };
    
    // Only include followup_date if it exists and is valid
    // Check for null, undefined, empty string, and invalid dates
    if (followup_date && 
        followup_date !== "" && 
        followup_date !== null && 
        followup_date !== "Invalid Date" &&
        (!dayjs.isDayjs(followup_date) || followup_date.isValid())) {
      payload.followup_date = followup_date;
    }
    
    return payload;
  };

  const onSumbitPatientDiagnosis = () => {
    // Clear any pending updates
    Object.keys(updateTimerRef.current).forEach(key => {
      clearTimeout(updateTimerRef.current[key]);
      onChangePatientDiagnosis(key, localValues[key]);
    });
    updateTimerRef.current = {};
    
    const payload = reqPayload();
    console.log('Submitting payload:', payload);
    mutationAddOrUpdatePatientDiagnosis.mutate(payload);
  };

  const handleClose = useCallback(() => {
    // Clear all pending timers
    Object.values(updateTimerRef.current).forEach(clearTimeout);
    updateTimerRef.current = {};
    
    onReset();
    onResetAlert();
    setLocalValues({});
    setOpen(false);
  }, [onReset, onResetAlert, setOpen]);

  useEffect(() => {
    onResetAlert();
  }, [open, setOpen]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(updateTimerRef.current).forEach(clearTimeout);
    };
  }, []);
  

  return (
    <Dialog
      open={open || false}
      // onClose={() => {
      //   onReset();
      //   onResetAlert();
      //   setOpen(false);
      // }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        maxHeight: "calc(100% - 100px)",
        "& .MuiDialog-container": {
          alignItems: "flex-start", // Align to top
        },
        "& .MuiPaper-root": {
          mt: 10, // Add top margin
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          fontSize: "18px",
          fontWeight: "600",
          justifyContent: "center",
          display: "flex",
        }}
        id="customized-dialog-title"
      >
        Add or edit Diagnosis
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          //   color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Stack flexDirection="row" gap={2}>
          <TextInputWithLabel
            type="text"
            name="vital_bp"
            value={localValues.vital_bp ?? vital_bp}
            label="BP"
            width="100%"
            placeholderText="Enter BP"
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            onBlur={(e) => handleBlur(e.target.name)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="vital_hr"
            value={localValues.vital_hr ?? vital_hr}
            label="HR"
            width="100%"
            placeholderText="Enter HR"
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            onBlur={(e) => handleBlur(e.target.name)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="vital_temp"
            value={localValues.vital_temp ?? vital_temp}
            label="Temp"
            width="100%"
            placeholderText="Enter Temp"
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            onBlur={(e) => handleBlur(e.target.name)}
            LabelSxProps={{ fontWeight: 600 }}
          />
        </Stack>
        <Stack flexDirection="row" gap={2}>
          <TextInputWithLabel
            type="text"
            name="height"
            value={localValues.height ?? height}
            label="Height"
            width="100%"
            placeholderText="Enter Height"
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            onBlur={(e) => handleBlur(e.target.name)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="weight"
            value={localValues.weight ?? weight}
            label="Weight"
            width="100%"
            placeholderText="Enter Weight"
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            onBlur={(e) => handleBlur(e.target.name)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="vital_spo2"
            value={localValues.vital_spo2 ?? vital_spo2}
            label="Spo2"
            width="100%"
            placeholderText="Enter Spo2"
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            onBlur={(e) => handleBlur(e.target.name)}
            LabelSxProps={{ fontWeight: 600 }}
          />
        </Stack>
        <Box>
          <DatePickerComponent
            name="diagnosis_date"
            value={diagnosis_date}
            required={true}
            showInputLabel={true}
            disabled
            label="Diagnosis Date"
            sxLabel={{ fontWeight: 600 }}
            onChange={(e) =>
              onChangePatientDiagnosis([e.target.name], e.target.value)
            }
          />
        </Box>

        <TextAreaInputWithLabel
          type="text"
          name="chief_complaint"
          // multiline
          value={localValues.chief_complaint ?? chief_complaint}
          rows={2}
          label="Chief Complaint"
          placeholder="Enter Chief Complaint"
          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
          onBlur={(e) => handleBlur(e.target.name)}
          LabelSxProps={{ fontWeight: 600 }}
        />

        <TextAreaInputWithLabel
          type="text"
          name="assessment_notes"
          value={localValues.assessment_notes ?? assessment_notes}
          multiline
          rows={8}
          label="Assessment notes"
          placeholder="Enter Assessment notes"
          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
          onBlur={(e) => handleBlur(e.target.name)}
          LabelSxProps={{ fontWeight: 600 }}
        />
        <TextAreaInputWithLabel
          type="text"
          name="treatment_plan"
          value={localValues.treatment_plan ?? treatment_plan}
          multiline
          rows={4}
          label="Treatment Plan"
          placeholder="Enter Treatment Plan"
          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
          onBlur={(e) => handleBlur(e.target.name)}
          LabelSxProps={{ fontWeight: 600 }}
        />
        <TextAreaInputWithLabel
          type="text"
          name="recomm_tests"
          value={localValues.recomm_tests ?? recomm_tests}
          rows={4}
          label="Recomm Tests"
          placeholder="Enter Recomm Tests"
          onChange={(e) => handleInputChange(e.target.name, e.target.value)}
          onBlur={(e) => handleBlur(e.target.name)}
          LabelSxProps={{ fontWeight: 600 }}
        />
        <Box>
          <DatePickerComponent
            name="followup_date"
            value={followup_date}
            required={false}
            showInputLabel={true}
            label="Followup Date"
            sxLabel={{ fontWeight: 600 }}
            onChange={(e) =>
              onChangePatientDiagnosis([e.target.name], e.target.value)
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
        <StyledButton variant="contained" onClick={onSumbitPatientDiagnosis}>
          Submit
        </StyledButton>
      </DialogActions>
      <AlertSnackbar
        message={showAlert.message}
        showAlert={showAlert.show}
        severity={showAlert.status}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setShowAlert(INITIAL_SHOW_ALERT)}
      />
      <PageLoader show={mutationAddOrUpdatePatientDiagnosis?.isPending} />
    </Dialog>
  );
};

export default AddOrEditPatientDiagnosis;
