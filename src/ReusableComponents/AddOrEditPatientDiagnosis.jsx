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
import { useEffect, useState } from "react";
import PageLoader from "@pages/PageLoader";
import DatePickerComponent from "@components/DatePicker";
import AlertSnackbar from "@components/AlertSnackbar";
import { usePatientDiagnosis } from "@/stores/patientStore";
import { INITIAL_SHOW_ALERT } from "@data/staticData";
import { useShowAlert } from "@/stores/showAlertStore";
import dayjs from "dayjs";

const AddOrEditPatientDiagnosis = ({ open, setOpen }) => {
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
  } = usePatientDiagnosis();

  const patientDiagnosisObj = usePatientDiagnosis();

  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();

  const queryClient = useQueryClient();

  const mutationAddOrUpdatePatientDiagnosis = useMutation({
    mutationFn: (payload) => putAddPatientDiagnosis(payload),
    onSuccess: (res) => {
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
      onReset();
      setOpen(false);
    },
    onError: (error) => {
      setShowAlert({
        show: true,
        message: "Patient Diagnosis update Failed",
        status: "error",
      });
    },
  });

  const reqPayload = () => ({
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
    vital_hr,
    vital_spo2,
    vital_temp,
    height,
    weight,
    diagnosis_id,
  });

  const onSumbitPatientDiagnosis = () => {
    mutationAddOrUpdatePatientDiagnosis.mutate(reqPayload());
  };

  useEffect(() => {
    onResetAlert();
    onReset();
  }, [open, setOpen]);
  
  useEffect(() => {
    // ✅ This runs when the component mounts or dependencies change
    return () => {
      onResetAlert();
      onReset();
    };
  }, []); // empty dependency → runs once on mount/unmount

  return (
    <Dialog
      open={open || false}
      onClose={() => {
        onReset();
        onResetAlert();
        setOpen(false);
      }}
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
        onClick={() => {
          onReset();
          onResetAlert();
          setOpen(false);
        }}
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
            value={vital_bp}
            label="BP"
            width="100%"
            placeholderText="Enter BP"
            onChange={(e) =>
              onChangePatientDiagnosis(e.target.name, e.target.value)
            }
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="vital_hr"
            value={vital_hr}
            label="HR"
            width="100%"
            placeholderText="Enter HR"
            onChange={(e) =>
              onChangePatientDiagnosis(e.target.name, e.target.value)
            }
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="vital_temp"
            value={vital_temp}
            label="Temp"
            width="100%"
            placeholderText="Enter Temp"
            onChange={(e) =>
              onChangePatientDiagnosis(e.target.name, e.target.value)
            }
            LabelSxProps={{ fontWeight: 600 }}
          />
        </Stack>
        <Stack flexDirection="row" gap={2}>
          <TextInputWithLabel
            type="text"
            name="height"
            value={height}
            label="Height"
            width="100%"
            placeholderText="Enter Height"
            onChange={(e) =>
              onChangePatientDiagnosis(e.target.name, e.target.value)
            }
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="weight"
            value={weight}
            label="Weight"
            width="100%"
            placeholderText="Enter Weight"
            onChange={(e) =>
              onChangePatientDiagnosis(e.target.name, e.target.value)
            }
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="vital_spo2"
            value={vital_spo2}
            label="Spo2"
            width="100%"
            placeholderText="Enter Spo2"
            onChange={(e) =>
              onChangePatientDiagnosis(e.target.name, e.target.value)
            }
            LabelSxProps={{ fontWeight: 600 }}
          />
        </Stack>
        <Stack flexDirection="row" gap={2}>
          <Box>
            <DatePickerComponent
              name="followup_date"
              value={followup_date}
              required={true}
              showInputLabel={true}
              // inputProps={{ disablePast: true, error: !AppointmentDate }}
              label="Followup Date"
              sxLabel={{ fontWeight: 600 }}
              onChange={(e) =>
                onChangePatientDiagnosis([e.target.name], e.target.value)
              }
            />
          </Box>
          <Box>
            <DatePickerComponent
              name="diagnosis_date"
              value={diagnosis_date}
              required={true}
              showInputLabel={true}
              disabled
              // inputProps={{ disablePast: true, error: !AppointmentDate }}
              label="Diagnosis Date"
              sxLabel={{ fontWeight: 600 }}
              onChange={(e) =>
                onChangePatientDiagnosis([e.target.name], e.target.value)
              }
            />
          </Box>
        </Stack>

        <TextAreaInputWithLabel
          type="text"
          name="chief_complaint"
          value={chief_complaint}
          // multiline
          rows={2}
          label="Chief Complaint"
          placeholder="Enter Chief Complaint"
          onChange={(e) =>
            onChangePatientDiagnosis(e.target.name, e.target.value)
          }
          LabelSxProps={{ fontWeight: 600 }}
        />

        <TextAreaInputWithLabel
          type="text"
          name="assessment_notes"
          value={assessment_notes}
          multiline
          rows={8}
          label="Assessment notes"
          placeholder="Enter Assessment notes"
          onChange={(e) =>
            onChangePatientDiagnosis(e.target.name, e.target.value)
          }
          LabelSxProps={{ fontWeight: 600 }}
        />
        <TextAreaInputWithLabel
          type="text"
          name="treatment_plan"
          value={treatment_plan}
          multiline
          rows={4}
          label="Treatment Plan"
          placeholder="Enter Treatment Plan"
          onChange={(e) =>
            onChangePatientDiagnosis(e.target.name, e.target.value)
          }
          LabelSxProps={{ fontWeight: 600 }}
        />
        <TextAreaInputWithLabel
          type="text"
          name="recomm_tests"
          value={recomm_tests}
          // multiline
          rows={4}
          label="Recomm Tests"
          placeholder="Enter Recomm Tests"
          onChange={(e) =>
            onChangePatientDiagnosis(e.target.name, e.target.value)
          }
          LabelSxProps={{ fontWeight: 600 }}
        />
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
