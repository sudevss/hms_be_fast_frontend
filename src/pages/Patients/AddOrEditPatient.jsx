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
  INITIAL_SHOW_ALERT,
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
import {
  calculateAge,
  patientRequiredFileds,
  usePatient,
} from "@/stores/patientStore";
import { useShowAlert } from "@/stores/showAlertStore";

const AddOrEditPatient = ({ open, setOpen }) => {
  const {
    firstname,
    lastname,
    age,
    dob,
    contact_number,
    address,
    gender,
    email_id,
    ABDM_ABHA_id,
    setPatientData,
    onChangePatient,
    onReset,
    id,
  } = usePatient();
  const patientState = usePatient();
  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();

  const reqPayload = () => ({
    firstname,
    lastname,
    age,
    dob,
    contact_number,
    address,
    gender,
    email_id,
    ABDM_ABHA_id,
    facility_id: 1,
    disease: "",
    room_id: 1,
    id,
  });

  const queryClient = useQueryClient();

  const mutationUpdatePatient = useMutation({
    mutationFn: (payload) =>
      !payload?.id
        ? postAddNewPatient({ ...payload })
        : patchUpdatePatient({ ...payload }),
    onSuccess: (res) => {
      setShowAlert({
        show: true,
        message: `Updated Patient has successfully`,
        status: "success",
      });
      onReset();
      queryClient.invalidateQueries({
        queryKey: ["queryGetPaientsDetails"],
        exact: false,
        refetchActive: true,
        refetchInactive: false,
      });
      setOpen(false);
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Update Patient has failed`,
        status: "erro",
      });
    },
  });
  const isSubmit = !patientRequiredFileds?.every((name) => patientState[name]);

  const onSumbitPatient = () => {
    mutationUpdatePatient.mutate(reqPayload());
  };

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
        Update Patient Details
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
        <TextInputWithLabel
          type="text"
          name="contact_number"
          value={contact_number?.replace(/\D/g, "").slice(0, 10)}
          label="Mobile #"
          width="100%"
          placeholderText="Enter Mobile #"
          onChange={(e) => onChangePatient(e.target.name, e.target.value)}
          LabelSxProps={{ fontWeight: 600 }}
        />
        <Stack flexDirection="row" gap={2}>
          <TextInputWithLabel
            type="text"
            name="firstname"
            label="First Name"
            value={firstname}
            placeholder="Enter First name"
            onChange={(e) => onChangePatient(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="lastname"
            value={lastname}
            label="Last Name"
            placeholder="Enter Last name"
            onChange={(e) => onChangePatient(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
        </Stack>
        <Stack flexDirection="row" gap={2}>
          <Box>
            <DatePickerComponent
              name="dob"
              value={dob}
              required={true}
              showInputLabel={true}
              currentYear={null}
              disableFuture
              // resProps={{ maxDate}}
              // inputProps={{ disableFuture: true }}
              label="Date of Birth"
              // helperText={!AppointmentDate && "Date of Birth  is required"}
              sxLabel={{ fontWeight: 600 }}
              onChange={(e) => {
                onChangePatient("age", calculateAge(e.target.value));
                onChangePatient([e.target.name], e.target.value);
              }}
            />
          </Box>
          <TextInputWithLabel
            type="text"
            name="age"
            value={age?.toString()?.replace(/\D/g, "").slice(0, 2)}
            label="Age #"
            width="100%"
            disabled={dob}
            placeholderText="Enter Age #"
            onChange={(e) => onChangePatient(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
        </Stack>
        <SelectWithLabel
          type="text"
          name="gender"
          value={gender}
          label="Gender"
          width="100%"
          placeholderText="Select Gender"
          menuOptions={GENDER_DATA}
          minWidth={210}
          onChangeHandler={(value) => onChangePatient("gender", value)}
          LabelSxProps={{ fontWeight: 600 }}
        />

        <TextInputWithLabel
          type="text"
          name="ABDM_ABHA_id"
          value={ABDM_ABHA_id}
          label="ABDM ABHA ID #"
          placeholder="Enter ABDM ABHA ID #"
          onChange={(e) => onChangePatient(e.target.name, e.target.value)}
          LabelSxProps={{ fontWeight: 600 }}
        />
        <TextInputWithLabel
          type="text"
          name="address"
          value={address}
          label="Address"
          placeholder="Enter Address"
          onChange={(e) => onChangePatient(e.target.name, e.target.value)}
          LabelSxProps={{ fontWeight: 600 }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
        <StyledButton
          disabled={isSubmit}
          variant="contained"
          onClick={onSumbitPatient}
        >
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
      <PageLoader show={mutationUpdatePatient?.isPending} />
    </Dialog>
  );
};

export default AddOrEditPatient;
