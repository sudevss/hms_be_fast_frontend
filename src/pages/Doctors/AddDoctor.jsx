import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import StyledButton from "@components/StyledButton";
import TextInputWithLabel from "@components/inputs/TextInputWithLabel";
import SelectWithLabel from "@components/inputs/SelectWithLabel";
import AlertSnackbar from "@components/AlertSnackbar";
import PageLoader from "@pages/PageLoader";

import { GENDER_DATA, INITIAL_SHOW_ALERT } from "@data/staticData";
import { useDoctor, doctorRequiredFileds } from "@/stores/doctorStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postNewDoctor, putUpdateDoctor } from "@/serviceApis";
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
    gender,
    age,
    experience,
    onChangeDoctor,
    onReset,
  } = useDoctor();

  const doctorState = useDoctor();
  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isSubmitDisabled = !doctorRequiredFileds.every(
    (field) => doctorState[field]
  );

  // ✅ Mutation for Add / Update Doctor
  const mutateAddDoctor = useMutation({
    mutationFn: () =>
      doctorState?.id
        ? putUpdateDoctor({...doctorState, facility_id: 1})
        : postNewDoctor(doctorState),
    onSuccess: () => {
      const message = doctorState?.id
        ? "Doctor updated successfully"
        : "New doctor added successfully";

      setShowAlert({
        show: true,
        message,
        status: "success",
      });

      queryClient.invalidateQueries(["queryGetAllDoctorsDetails"]);
      onReset();
      setOpen(false);
    },
    onError: (error) => {
      const message = doctorState?.id
        ? "Failed to update doctor"
        : "Failed to add doctor";
      console.error(error);
      setShowAlert({
        show: true,
        message,
        status: "error",
      });
    },
  });

  const handleSubmit = () => {
    if (!isSubmitDisabled) mutateAddDoctor.mutate();
  };

  const handleClose = () => {
    onReset();
    onResetAlert();
    setOpen(false);
  };

  return (
    <>
      <Dialog
        open={open || false}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            mt: isMobile ? 2 : 8,
            borderRadius: 3,
            boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* HEADER */}
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: "700",
            textAlign: "center",
            color: "#115E59",
            pb: 0,
          }}
        >
          {doctorState?.id ? "Edit Doctor" : "Add Doctor"}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>

        {/* BODY */}
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            pt: 2,
          }}
        >
          <Stack direction={isMobile ? "column" : "row"} gap={2}>
            <TextInputWithLabel
              type="text"
              name="firstname"
              label="First Name"
              value={firstname}
              required
              error={!firstname}
              helperText={!firstname && "First Name required"}
              placeholder="Enter First name"
              onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
            />
            <TextInputWithLabel
              type="text"
              name="lastname"
              label="Last Name"
              value={lastname}
              required
              error={!lastname}
              helperText={!lastname && "Last Name required"}
              placeholder="Enter Last name"
              onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
            />
          </Stack>

          <SelectWithLabel
            name="gender"
            label="Gender"
            value={gender}
            error={!gender}
            required
            helperText={!gender && "Gender required"}
            menuOptions={GENDER_DATA}
            placeholderText="Select Gender"
            onChangeHandler={(value) => onChangeDoctor("gender", value)}
          />

          <Stack direction={isMobile ? "column" : "row"} gap={2}>
            <TextInputWithLabel
              type="number"
              name="experience"
              label="Experience (Years)"
              value={experience?.toString()?.replace(/\D/g, "").slice(0, 2) || ""}
              required
              error={!experience}
              helperText={!experience && "Experience required"}
              placeholder="Enter Experience"
              onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
            />
            <TextInputWithLabel
              type="number"
              name="age"
              label="Age"
              value={age?.toString()?.replace(/\D/g, "").slice(0, 2) || ""}
              required
              error={!age}
              helperText={!age && "Age required"}
              placeholder="Enter Age"
              onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
            />
          </Stack>

          <TextInputWithLabel
            type="number"
            name="phone_number"
            label="Mobile #"
            value={phone_number?.toString()?.replace(/\D/g, "").slice(0, 10) || ""}
            required
            error={!phone_number}
            helperText={!phone_number && "Mobile # required"}
            placeholder="Enter Mobile #"
            onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
          />

          <TextInputWithLabel
            type="email"
            name="email"
            label="Email"
            value={email}
            placeholder="Enter Email"
            onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
          />

          <TextInputWithLabel
            type="number"
            name="consultation_fee"
            label="Consultation Fee"
            value={consultation_fee?.toString()?.replace(/\D/g, "").slice(0, 4) || ""}
            required
            error={!consultation_fee}
            helperText={!consultation_fee && "Consultation fee required"}
            placeholder="Enter Consultation Fee"
            onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
          />

          <TextInputWithLabel
            type="text"
            name="specialization"
            label="Specialization"
            value={specialization}
            required
            error={!specialization}
            helperText={!specialization && "Specialization required"}
            placeholder="Enter Specialization"
            onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
          />

          <TextInputWithLabel
            type="text"
            name="ABDM_NHPR_id"
            label="ABDM NHPR ID"
            value={ABDM_NHPR_id}
            required
            error={!ABDM_NHPR_id}
            helperText={!ABDM_NHPR_id && "ABDM NHPR ID required"}
            placeholder="Enter ABDM NHPR ID"
            onChange={(e) => onChangeDoctor(e.target.name, e.target.value)}
          />
        </DialogContent>

        {/* FOOTER */}
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <StyledButton
            disabled={isSubmitDisabled}
            variant="contained"
            onClick={handleSubmit}
            sx={{
              px: 5,
              py: 1.2,
              fontSize: "0.95rem",
              borderRadius: "25px",
            }}
          >
            Submit
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <AlertSnackbar
        message={showAlert.message}
        showAlert={showAlert.show}
        severity={showAlert.status}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setShowAlert(INITIAL_SHOW_ALERT)}
      />

      {/* Loader */}
      <PageLoader show={mutateAddDoctor.isPending} />
    </>
  );
};

export default AddDoctor;
