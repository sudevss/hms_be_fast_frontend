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
import SelectWithLabel from "@components/inputs/SelectWithLabel";
import {
  GENDER_DATA,
  INITIAL_SHOW_ALERT,
  PAYMENT_METHODS,
  TIME_SLOTS_HOURS_OPTIONS,
  TOKEN_TYPES,
} from "@data/staticData";
import { bookingRequiredFileds, useBooking } from "@/stores/bookingStore";
import TextAreaInputWithLabel from "@components/inputs/TextAreaInputWithLabel";
import {
  getAllDoctorsDetails,
  getPaientDetailsByPhone,
  postNewAppoinmentBooking,
  postNewAppoinmentBookingWithExistingPatient,
} from "@/serviceApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import PageLoader from "@pages/PageLoader";
import DatePickerComponent from "@components/DatePicker";
import AlertSnackbar from "@components/AlertSnackbar";
import { useShowAlert } from "@/stores/showAlertStore";
import { calculateAge } from "@/stores/patientStore";

const AddOrEditBooking = ({ open, setOpen }) => {
  const {
    firstname,
    lastname,
    age,
    dob,
    contact_number,
    address,
    gender,
    email_id,
    disease,
    ABDM_ABHA_id,
    doctor_id,
    facility_id,
    AppointmentDate,
    AppointmentTime,
    doctorName,
    AppointmentMode,
    payment_status,
    payment_method,
    onChangeBooking,
    setBookingData,
    onReset,
    Reason,
    addPatient,
  } = useBooking();
  const bookingState = useBooking();
  const [paientDetailsByNum, setPaientDetailsByNum] = useState([]);
  const [selectPaientName, setSelectPaientName] = useState({});
  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();

  const queryGetAllDoctorsDetails = useQuery({
    queryKey: ["queryGetAllDoctorsDetails"],
    queryFn: () =>
      getAllDoctorsDetails({
        facility_id: "1",
      }),
    enabled: true,
  });

  const { data: doctorsData = [], isLoading } = queryGetAllDoctorsDetails || {};

  const doctorMenuOptions = doctorsData?.map((obj) => ({
    value: `${obj.doctor_name} - ${obj.specialization}`,
    id: obj?.id,
    label: `${obj.doctor_name} - ${obj.specialization}`,
  }));

  const reqPayload = () => ({
    patient_info: {
      firstname,
      lastname,
      age,
      dob,
      contact_number,
      address,
      gender,
      email_id,
      disease,
      ABDM_ABHA_id,
    },
    doctor_id,
    facility_id,
    AppointmentDate,
    AppointmentTime,
    Reason,
    AppointmentMode: AppointmentMode[0],
    // room_id,
    payment_status,
    payment_method,
  });
  const queryClient = useQueryClient();

  const mutationAddBooikng = useMutation({
    mutationFn: (payload) =>
      selectPaientName?.id
        ? postNewAppoinmentBookingWithExistingPatient({
            ...payload,
            patient_id: selectPaientName?.id,
          })
        : postNewAppoinmentBooking({ ...payload }),
    onSuccess: (data) => {
      setShowAlert({
        show: true,
        message: `Appointment booking has successfully`,
        status: "success",
      });
      onReset();
      queryClient.invalidateQueries({
        queryKey: ["queryGetAppointmentsAndBookings"],
        exact: false,
        refetchActive: true,
        refetchInactive: false,
      });
      setSelectPaientName({});
      setOpen(false);
      setPaientDetailsByNum([]);
    },
    onError: (error) => {
      console.log(error?.response?.data?.detail);
      setShowAlert({
        show: true,
        message: error?.response?.data?.detail,
        status: "error",
      });
    },
  });
  const isSubmit = !bookingRequiredFileds?.every((name) => bookingState[name]);

  const onSumbitBooking = () => {
    // bookingRequiredFileds
    mutationAddBooikng.mutate(reqPayload());
  };

  const mutationByMobileNum = useMutation({
    mutationFn: (value) =>
      getPaientDetailsByPhone({
        facility_id: "1",
        contact_number: value,
      }),
    onSuccess: (data) => {
      const patientsList = data?.patients.map((obj) => ({
        ...obj,
        value: obj?.name,
        label: obj?.name,
      }));

      setPaientDetailsByNum(patientsList);
      setSelectPaientName(patientsList?.[0] || "");
    },
  });

  const handleOnBlurMobileNumber = (e) => {
    if (e.target.value.trim()) {
      mutationByMobileNum.mutate(e.target.value);
    }
    setSelectPaientName({});
  };

  useEffect(() => {
    onResetAlert();
  }, [open]);

  return (
    <Dialog
      open={open || false}
      // onClose={() => {
      //   onReset();
      //   setSelectPaientName({});
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
        New Booking
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => {
          onReset();
          setSelectPaientName({});
          // setPaientDetailsByNum([])
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
          onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
          onBlur={handleOnBlurMobileNumber}
          LabelSxProps={{ fontWeight: 600 }}
        />
        {paientDetailsByNum?.length > 0 && (
          <SelectWithLabel
            type="text"
            name="selectPaientName"
            value={selectPaientName?.name}
            label="Select Patient Name"
            width="100%"
            placeholderText="Select Patient Name"
            menuOptions={paientDetailsByNum}
            minWidth={210}
            onChangeHandler={(value) => {
              const fullObj = paientDetailsByNum.find(
                (opt) => opt.name === value
              );
              setSelectPaientName({ ...fullObj });

              setBookingData(fullObj);
            }}
            // renderValue={(value) => onChangeBooking("gender", value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
        )}
        {paientDetailsByNum?.length > 0 && (
          <Stack
            width="50%"
            justifyContent="center"
            alignItems="center"
            my="1rem"
          >
            <StyledButton
              variant="contained"
              onClick={() => {
                setSelectPaientName({});
                addPatient({ contact_number });
              }}
            >
              Add New Patient
            </StyledButton>
          </Stack>
        )}
        {!selectPaientName?.id && (
          <>
            <Stack flexDirection="row" gap={2}>
              <TextInputWithLabel
                type="text"
                name="firstname"
                label="First Name"
                value={firstname}
                placeholder="Enter First name"
                onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
                LabelSxProps={{ fontWeight: 600 }}
              />
              <TextInputWithLabel
                type="text"
                name="lastname"
                value={lastname}
                label="Last Name"
                placeholder="Enter Last name"
                onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
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
                    onChangeBooking("age", calculateAge(e.target.value));
                    onChangeBooking([e.target.name], e.target.value);
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
                onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
                LabelSxProps={{ fontWeight: 600 }}
              />
            </Stack>
            <SelectWithLabel
              type="text"
              name="gender"
              fullWidth
              value={gender}
              label="Gender"
              width="100%"
              placeholderText="Select Gender"
              menuOptions={GENDER_DATA}
              minWidth={210}
              onChangeHandler={(value) => onChangeBooking("gender", value)}
              LabelSxProps={{ fontWeight: 600 }}
            />
            <TextInputWithLabel
              type="text"
              name="ABDM_ABHA_id"
              value={ABDM_ABHA_id}
              label="ABDM ABHA ID #"
              placeholder="Enter ABDM ABHA ID #"
              onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
              LabelSxProps={{ fontWeight: 600 }}
            />
            <TextInputWithLabel
              type="text"
              name="address"
              value={address}
              label="Address"
              placeholder="Enter Address"
              onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
              LabelSxProps={{ fontWeight: 600 }}
            />
            {/* <TextAreaInputWithLabel
            type="text"
            name="disease"
            value={disease}
            // multiline
            rows={2}
            label="Disease"
            placeholder="Enter Disease"
            onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          /> */}
          </>
        )}
        <SelectWithLabel
          type="text"
          fullWidth
          name="doctorName"
          value={doctorName}
          menuOptions={doctorMenuOptions}
          label="Doctor"
          width="100%"
          placeholderText="Select Doctor"
          searchable
          searchPlaceholder="Search doctor"
          onChangeHandler={(val) => {
            const doctor_id = doctorMenuOptions?.find(
              ({ label }) => label === val
            )?.id;
            onChangeBooking("doctorName", val);

            onChangeBooking("doctor_id", doctor_id);
          }}
          LabelSxProps={{ fontWeight: 600 }}
        />
        <Stack flexDirection="row" gap={2}>
          <Box>
            <DatePickerComponent
              name="AppointmentDate"
              value={AppointmentDate}
              required={true}
              showInputLabel={true}
              inputProps={{ disablePast: true, error: !AppointmentDate }}
              label="Appointment Date"
              helperText={!AppointmentDate && "Appointment Date is required"}
              sxLabel={{ fontWeight: 600 }}
              onChange={(e) => onChangeBooking([e.target.name], e.target.value)}
            />
          </Box>
          <SelectWithLabel
            type="text"
            fullWidth
            disabled={!AppointmentDate}
            name="AppointmentTime"
            value={AppointmentTime}
            minWidth={110}
            label="Time Slot"
            width="100%"
            placeholderText="Time Slot"
            menuOptions={TIME_SLOTS_HOURS_OPTIONS}
            onChangeHandler={
              (value) => onChangeBooking("AppointmentTime", value)
              //   onChangeDoctor("gender", value)
            }
            // renderValue={(value) => onChangeDoctor("gender", value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
          {/* <TextInputWithLabel
            type="text"
            name="AppointmentDate"
            value={AppointmentDate}
            label="Date"
            width="100%"
            placeholderText="Enter Date"
            onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          /> */}
          {/* <TextInputWithLabel
            type="text"
            name="AppointmentTime"
            value={AppointmentTime}
            label="Slot Time"
            width="100%"
            placeholderText="Enter Slot time"
            onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
            LabelSxProps={{ fontWeight: 600 }}
          /> */}
        </Stack>

        <SelectWithLabel
          type="text"
          fullWidth
          name="AppointmentMode"
          value={AppointmentMode}
          label="Token Type"
          width="100%"
          placeholderText="Select Token Type"
          menuOptions={TOKEN_TYPES}
          minWidth={210}
          onChangeHandler={(value) => onChangeBooking("AppointmentMode", value)}
          // renderValue={(value) => onChangeBooking("gender", value)}
          LabelSxProps={{ fontWeight: 600 }}
        />
        <SelectWithLabel
          type="text"
          fullWidth
          name="payment_method"
          value={payment_method}
          label="Payment Method"
          width="100%"
          placeholderText="Select Payment Method"
          menuOptions={PAYMENT_METHODS}
          searchable
          searchPlaceholder="Search payment method"
          minWidth={210}
          onChangeHandler={(value) => onChangeBooking("payment_method", value)}
          // renderValue={(value) => onChangeBooking("gender", value)}
          LabelSxProps={{ fontWeight: 600 }}
        />

        <TextAreaInputWithLabel
          type="text"
          name="Reason"
          value={Reason}
          // multiline
          rows={2}
          label="Reason"
          placeholder="Enter Reason"
          onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
          LabelSxProps={{ fontWeight: 600 }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
        <StyledButton
          variant="contained"
          onClick={onSumbitBooking}
          // disabled={isSubmit}
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
      <PageLoader
        show={
          mutationByMobileNum?.isPending ||
          isLoading ||
          mutationAddBooikng?.isPending
        }
      />
    </Dialog>
  );
};

export default AddOrEditBooking;
