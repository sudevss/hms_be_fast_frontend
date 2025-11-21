import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Stack,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StyledButton from "@components/StyledButton";
import TextInputWithLabel from "@components/inputs/TextInputWithLabel";
import SelectWithLabel from "@components/inputs/SelectWithLabel";
import DatePickerComponent from "@components/DatePicker";
import AlertSnackbar from "@components/AlertSnackbar";
import PageLoader from "@pages/PageLoader";

import { GENDER_DATA, INITIAL_SHOW_ALERT } from "@data/staticData";
import { postAddNewPatient, patchUpdatePatient } from "@/serviceApis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    onChangePatient,
    onReset,
    id,
  } = usePatient();

  const patientState = usePatient();
  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();
  const queryClient = useQueryClient();

  // 💠 Compact styles for labels and inputs
  const labelSx = {
    fontSize: "0.85rem",
    fontWeight: 600,
    mb: 0.5,
    color: "text.primary",
  };

  const inputSx = {
    height: 40,
    fontSize: "0.9rem",
  };

  // ✅ Prepare payload
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
    id,
  });

  // ✅ Mutation for add/update
  const mutationUpdatePatient = useMutation({
    mutationFn: (payload) =>
      !payload?.id ? postAddNewPatient(payload) : patchUpdatePatient(payload),
    onSuccess: () => {
      setShowAlert({
        show: true,
        message: `Patient details updated successfully.`,
        status: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["queryGetPaientsDetails"],
        exact: false,
        refetchActive: true,
      });
      onReset();
      setOpen(false);
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Updating patient failed. Please try again.`,
        status: "error",
      });
    },
  });

  const isSubmitDisabled = !patientRequiredFileds?.every(
    (field) => patientState[field]
  );

  const handleSubmit = () => {
    mutationUpdatePatient.mutate(reqPayload());
  };

  const handleClose = () => {
    onReset();
    onResetAlert();
    setOpen(false);
  };

  return (
    <Dialog
      open={open || false}
      onClose={handleClose}
      aria-labelledby="edit-patient-dialog"
      sx={{
        maxHeight: "calc(100% - 100px)",
        "& .MuiDialog-container": {
          alignItems: "flex-start",
        },
        "& .MuiPaper-root": {
          mt: 10,
          borderRadius: 2,
          width: { xs: "95%", sm: "500px" },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "18px",
          fontWeight: 600,
          textAlign: "center",
          pb: 0,
        }}
        id="edit-patient-dialog"
      >
        {id ? "Update Patient Details" : "Add New Patient"}
      </DialogTitle>

      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          mt: 1,
          "& .MuiInputLabel-root": {
            fontSize: "0.85rem",
          },
        }}
      >
        {/* Mobile Number */}
        <TextInputWithLabel
          type="text"
          name="contact_number"
          value={contact_number?.replace(/\D/g, "").slice(0, 10)}
          label="Mobile #"
          placeholderText="Enter Mobile #"
          onChange={(e) => onChangePatient(e.target.name, e.target.value)}
          LabelSxProps={labelSx}
          InputSxProps={inputSx}
        />

        {/* First & Last Name */}
        <Stack direction="row" gap={1}>
          <TextInputWithLabel
            type="text"
            name="firstname"
            label="First Name"
            value={firstname}
            placeholder="Enter First Name"
            onChange={(e) => onChangePatient(e.target.name, e.target.value)}
            LabelSxProps={labelSx}
            InputSxProps={inputSx}
          />
          <TextInputWithLabel
            type="text"
            name="lastname"
            label="Last Name"
            value={lastname}
            placeholder="Enter Last Name"
            onChange={(e) => onChangePatient(e.target.name, e.target.value)}
            LabelSxProps={labelSx}
            InputSxProps={inputSx}
          />
        </Stack>

        {/* DOB & Age */}
        <Stack direction="row" gap={1}>
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
                const dobValue = e.target.value;
                onChangePatient("dob", dobValue);
                onChangePatient("age", calculateAge(dobValue));
              }}
            />
          </Box>
          {/* <Box sx={{ flex: 1 }}>
            <DatePickerComponent
              name="dob"
              value={dob}
              required
              showInputLabel
              disableFuture
              label="Date of Birth"
              labelSx={labelSx}
              inputSx={inputSx}
              onChange={(e) => {
                const dobValue = e.target.value;
                onChangePatient("dob", dobValue);
                onChangePatient("age", calculateAge(dobValue));
              }}
            />
          </Box> */}
          <TextInputWithLabel
            type="text"
            name="age"
            label="Age"
            value={age?.toString()?.replace(/\D/g, "").slice(0, 2)}
            disabled={!!dob}
            placeholderText="Enter Age"
            onChange={(e) => onChangePatient(e.target.name, e.target.value)}
            LabelSxProps={labelSx}
            InputSxProps={inputSx}
          />
        </Stack>

        {/* Gender */}
        <SelectWithLabel
          type="text"
          name="gender"
          label="Gender"
          value={gender}
          fullWidth
          placeholderText="Select Gender"
          menuOptions={GENDER_DATA}
          onChangeHandler={(value) => onChangePatient("gender", value)}
          labelSx={labelSx}
          inputSx={inputSx}
        />

        {/* ABHA ID */}
        <TextInputWithLabel
          type="text"
          name="ABDM_ABHA_id"
          label="ABDM ABHA ID"
          value={ABDM_ABHA_id}
          placeholder="Enter ABHA ID"
          onChange={(e) => onChangePatient(e.target.name, e.target.value)}
          LabelSxProps={labelSx}
          InputSxProps={inputSx}
        />

        {/* Address */}
        <TextInputWithLabel
          type="text"
          name="address"
          label="Address"
          value={address}
          placeholder="Enter Address"
          onChange={(e) => onChangePatient(e.target.name, e.target.value)}
          LabelSxProps={labelSx}
          InputSxProps={inputSx}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
        <StyledButton
          disabled={isSubmitDisabled}
          variant="contained"
          onClick={handleSubmit}
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
