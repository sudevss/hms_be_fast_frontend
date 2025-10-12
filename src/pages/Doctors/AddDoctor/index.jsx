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
} from "@mui/material";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import StyledButton from "@components/StyledButton";
import TextInputWithLabel from "@components/Inputs/TextInputWithLabel";
import SelectWithLabel from "@components/Inputs/SelectWithLabel";
import { GENDER_DATA, INITIAL_SHOW_ALERT } from "@data/staticData";
import { useDoctor, doctorRequiredFileds } from "@/stores/doctorStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postNewDoctor, putUpdateDoctor } from "@/serviceApis";
import PageLoader from "@pages/PageLoader";
import AlertSnackbar from "@components/AlertSnackbar";
import { useState } from "react";
import { useShowAlert } from "@/stores/showAlertStore";

const AddDoctor = ({ open, setOpen }) => {
  const {
    firstname,
    lastname,
    specialization,
    phone_number,
    email,
    consultation_fee,
    ABDM_NHPR_id,
    facility_id,
    gender,
    age,
    experience,
    is_active,
    onChangeDoctor,
    onReset,
  } = useDoctor();
  const doctorState = useDoctor();
  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();

  const queryClient = useQueryClient();

  const isSubmit = !doctorRequiredFileds?.every((name) => doctorState[name]);

  const mutateAddDoctor = useMutation({
    mutationFn: () =>
      doctorState?.id
        ? putUpdateDoctor(doctorState)
        : postNewDoctor(doctorState),
    onSuccess: (res) => {
      let message = doctorState?.id ? "Updated Doctor " : "Added New Doctor";

      setShowAlert({
        show: true,
        message: `${message} has successfully`,
        status: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["queryGetAllDoctorsDetails"],
        exact: false,
        refetchActive: true,
        refetchInactive: false,
      });
      onReset();
      setOpen(false);
    },
    onError: (_error) => {
      console.log(_error);
      setShowAlert({
        show: true,
        message: `${message} has failed.`,
        status: "error",
      });
    },
  });

  const onSumbitDoctor = () => {
    if (!isSubmit) {
      mutateAddDoctor.mutate({ ...doctorState });
    }
  };

  return (
    <>
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
            p: 2,
            fontSize: "18px",
            fontWeight: "600",
            justifyContent: "center",
            display: "flex",
          }}
          id="customized-dialog-title"
        >
          Add Doctor
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
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Stack flexDirection="row" gap={2}>
            <TextInputWithLabel
              type="text"
              name="firstname"
              label="First Name"
              value={firstname}
              error={!firstname}
              required
              helperText={!firstname && "First Name required"}
              placeholder="Enter First name"
              onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
              LabelSxProps={{ fontWeight: 600 }}
            />
            <TextInputWithLabel
              type="text"
              name="lastname"
              label="Last Name"
              value={lastname}
              error={!lastname}
              required
              helperText={!lastname && "Last Name required"}
              placeholder="Enter Last name"
              onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
              LabelSxProps={{ fontWeight: 600 }}
            />
          </Stack>
          {/* <TextInputWithLabel
          type="text"
          name="fullName"
          value={`${firstName} ${lastName}`}
          disabled
          label="Full Name"
          width="100%"
          placeholderText="Enter Full Name"
          LabelSxProps={{ fontWeight: 600 }}
        /> */}
          <SelectWithLabel
            type="text"
            name="gender"
            label="Gender"
            value={gender}
            error={!gender}
            required
            helperText={!gender && "Gender required"}
            width="100%"
            placeholderText="Select Gender"
            menuOptions={GENDER_DATA}
            minWidth={210}
            onChangeHandler={(value) => onChangeDoctor("gender", value)}
            // renderValue={(value) => onChangeDoctor("gender", value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          <Stack flexDirection="row" gap={2}>
            <TextInputWithLabel
              type="number"
              name="experience"
              label="Experinace"
              value={experience.toString()?.replace(/\D/g, "").slice(0, 2)}
              error={!experience}
              required
              helperText={!experience && "Experinace required"}
              width="100%"
              placeholderText="Enter Experinace"
              onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
              LabelSxProps={{ fontWeight: 600 }}
            />
            <TextInputWithLabel
              type="number"
              name="age"
              label="Age"
              value={age.toString()?.replace(/\D/g, "").slice(0, 2)}
              error={!age}
              required
              helperText={!age && "Age required"}
              width="100%"
              placeholderText="Enter Age"
              onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
              LabelSxProps={{ fontWeight: 600 }}
            />
          </Stack>
          <TextInputWithLabel
            type="number"
            name="phone_number"
            label="Mobile #"
            value={phone_number?.toString()?.replace(/\D/g, "").slice(0, 10)}
            error={!phone_number}
            required
            helperText={!phone_number && "Mobile # required"}
            width="100%"
            placeholderText="Enter Mobile #"
            onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="email"
            value={email}
            label="Email"
            width="100%"
            placeholderText="Enter Email"
            onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="number"
            name="consultation_fee"
            label="Consultation fee"
            value={consultation_fee?.toString()?.replace(/\D/g, "").slice(0, 4)}
            error={!consultation_fee}
            required
            helperText={!consultation_fee && "Consultation fee required"}
            width="100%"
            placeholderText="Enter Consultation fee"
            onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="specialization"
            label="Specialization"
            value={specialization}
            error={!specialization}
            required
            helperText={!specialization && "Specialization required"}
            placeholder="Enter Specialization"
            onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          <TextInputWithLabel
            type="text"
            name="ABDM_NHPR_id"
            value={ABDM_NHPR_id}
            label="ABDM NHPR ID"
            error={!ABDM_NHPR_id}
            required
            helperText={!ABDM_NHPR_id && "ABDM NHPR ID required"}
            placeholder="Enter ABDM NHPR ID"
            onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <StyledButton
            disabled={isSubmit}
            variant="contained"
            onClick={onSumbitDoctor}
          >
            Submit
          </StyledButton>
        </DialogActions>
      </Dialog>
      <AlertSnackbar
        message={showAlert.message}
        showAlert={showAlert.show}
        severity={showAlert.status}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setShowAlert(INITIAL_SHOW_ALERT)}
      />
      <PageLoader show={mutateAddDoctor.isPending} />
    </>
  );
};

export default AddDoctor;
