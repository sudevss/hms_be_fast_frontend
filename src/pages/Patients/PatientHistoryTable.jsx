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
import TextInputWithLabel from "@components/Inputs/TextInputWithLabel";
import SelectWithLabel from "@components/Inputs/SelectWithLabel";
import {
  GENDER_DATA,
  PAYMENT_METHODS,
  TIME_SLOTS_HOURS_OPTIONS,
  TOKEN_TYPES,
} from "@data/staticData";
import TextAreaInputWithLabel from "@components/Inputs/TextAreaInputWithLabel";
import {
  getAllDoctorsDetails,
  getPaientDetailsByPhone,
  patchUpdatePatient,
  postAddNewPatient,
  postNewAppoinmentBooking,
} from "@/serviceApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import PageLoader from "@pages/PageLoader";
import DatePickerComponent from "@components/DatePicker";
import AlertSnackbar from "@components/AlertSnackbar";
import { usePatient } from "@/stores/patientStore";
import AppointmentsTable from "@/ReusableComponents/AppointmentsTable";

const PatientHistoryTable = ({ open, setOpen }) => {
  const { id, onReset } = usePatient();

  return (
    <Dialog
      fullScreen
      fullWidth
      open={open || false}
      onClose={() => {
        setOpen(false);
        onReset();
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
      <IconButton
        aria-label="close"
        onClick={() => {
          setOpen(false);
          onReset();
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
        Patient Appointment History
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        <AppointmentsTable tabName="Completed" patient_id={id} />
      </DialogContent>
    </Dialog>
  );
};

export default PatientHistoryTable;
