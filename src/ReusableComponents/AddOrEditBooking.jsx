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
  FormControlLabel,
  Checkbox,
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
  TOKEN_TYPES,
} from "@data/staticData";
import { bookingRequiredFileds, useBooking } from "@/stores/bookingStore";
import TextAreaInputWithLabel from "@components/inputs/TextAreaInputWithLabel";
import {
  getAppointmentsAndBookings,
  getAllDoctorsDetails,
  getPaientDetailsByPhone,
  postNewAppoinmentBooking,
  postNewAppoinmentBookingWithExistingPatient,
  putUpdateBooking,
  getDoctorSheduleDetails,
} from "@/serviceApis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import PageLoader from "@pages/PageLoader";
import DatePickerComponent from "@components/DatePicker";
import AlertSnackbar from "@components/AlertSnackbar";
import { useShowAlert } from "@/stores/showAlertStore";
import { calculateAge } from "@/stores/patientStore";
import { dayjs } from "@utils/dateUtils";

const AddOrEditBooking = ({ open, setOpen, title, isEdit = false, appointmentId }) => {
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
    is_review,
  } = useBooking();
  const bookingState = useBooking();
  const [paientDetailsByNum, setPaientDetailsByNum] = useState([]);
  const [selectPaientName, setSelectPaientName] = useState({});
  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();
  const [isReviewChecked, setIsReviewChecked] = useState(false);
  const [isReviewEnabled, setIsReviewEnabled] = useState(false);

  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (isEdit && is_review) {
        setIsReviewChecked(true);
        setIsReviewEnabled(true);
        return;
      }

      if (AppointmentDate && doctor_id && selectPaientName?.id) {
        const startDate = dayjs(AppointmentDate)
          .subtract(7, "day")
          .format("YYYY-MM-DD");
        const endDate = dayjs(AppointmentDate).format("YYYY-MM-DD");
        try {
          const data = await getAppointmentsAndBookings({
            facility_id: facility_id || 1,
            date: startDate,
            end_date: endDate,
            patient_id: selectPaientName.id,
            appointment_status: "Completed",
          });

          const hasEligible = data.some(
            (app) =>
              String(app.doctor_id) === String(doctor_id) &&
              (app.is_paid ||
                app.paid ||
                app.appointment_status === "Completed")
          );
          setIsReviewEnabled(hasEligible);
          if (!hasEligible) setIsReviewChecked(false);
        } catch (e) {
          console.error(e);
          setIsReviewEnabled(false);
          setIsReviewChecked(false);
        }
      } else {
        setIsReviewEnabled(false);
        setIsReviewChecked(false);
      }
    };
    checkReviewEligibility();
  }, [AppointmentDate, doctor_id, selectPaientName, facility_id, isEdit, is_review]);

  // useEffect(() => {
  //   const pid = selectPaientName?.id;
  //   const did = doctor_id;
  //   if (pid && did) {
  //     try {
  //       const key = `review:${pid}:${did}`;
  //       const saved = localStorage.getItem(key);
  //       if (saved === "true" || saved === "1") setIsReviewChecked(true);
  //       else if (saved === "false" || saved === "0") setIsReviewChecked(false);
  //     } catch {}
  //   } else {
  //     setIsReviewChecked(false);
  //   }
  //   setIsReviewEnabled(Boolean(pid && did));
  // }, [selectPaientName?.id, doctor_id]);

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

  const queryGetDoctorSchedule = useQuery({
    queryKey: ["queryGetDoctorSheduleDetails", doctor_id],
    queryFn: () =>
      getDoctorSheduleDetails({
        facility_id: facility_id || 1,
        doctor_id,
      }),
    enabled: Boolean(doctor_id),
  });

  const selectedAppointmentDate = AppointmentDate
    ? dayjs(AppointmentDate).format("YYYY-MM-DD")
    : "";

  const queryGetBookedAppointments = useQuery({
    queryKey: [
      "queryGetAppointmentsAndBookings",
      "occupiedSlots",
      facility_id || 1,
      doctor_id,
      selectedAppointmentDate,
    ],
    queryFn: async () => {
      const requestPayload = {
        facility_id: facility_id || 1,
        date: selectedAppointmentDate,
        end_date: selectedAppointmentDate,
        doctor_id,
      };

      const bookedAppointmentsByStatus = await Promise.all(
        ["scheduled", "waiting", "completed"].map((appointment_status) =>
          getAppointmentsAndBookings({
            ...requestPayload,
            appointment_status,
          })
        )
      );

      const seenAppointmentIds = new Set();

      return bookedAppointmentsByStatus.flat().filter((appointment) => {
        const appointmentKey =
          appointment?.appointment_id ??
          `${appointment?.doctor_id || ""}:${appointment?.appointment_date || ""}:${appointment?.time_slot || appointment?.appointment_time || appointment?.AppointmentTime || ""}`;

        if (seenAppointmentIds.has(appointmentKey)) {
          return false;
        }

        seenAppointmentIds.add(appointmentKey);
        return true;
      });
    },
    enabled: open && Boolean(doctor_id && selectedAppointmentDate),
  });

  useEffect(() => {
    if (doctor_id && !doctorName && Array.isArray(doctorsData) && doctorsData.length > 0) {
      const found = doctorsData.find((d) => String(d.id) === String(doctor_id));
      if (found) {
        const label = `${found.doctor_name} - ${found.specialization}`;
        onChangeBooking("doctorName", label);
      }
    }
  }, [doctor_id, doctorName, doctorsData, onChangeBooking]);

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
    is_review: isReviewChecked,
  });
  const queryClient = useQueryClient();

  const parseSlotMinutes = (label) => {
    const normalized = String(label || "").trim().toLowerCase();
    if (!normalized) return null;

    const twelveHourMatch = normalized.match(
      /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i
    );
    if (twelveHourMatch) {
      let h = parseInt(twelveHourMatch[1], 10);
      const mins = twelveHourMatch[2] ? parseInt(twelveHourMatch[2], 10) : 0;
      const isPM = twelveHourMatch[3].toLowerCase() === "pm";
      h = h % 12 + (isPM ? 12 : 0);
      return h * 60 + mins;
    }

    const twentyFourHourMatch = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (twentyFourHourMatch) {
      const hours = parseInt(twentyFourHourMatch[1], 10);
      const mins = parseInt(twentyFourHourMatch[2], 10);
      if (Number.isNaN(hours) || Number.isNaN(mins) || hours > 23 || mins > 59) {
        return null;
      }
      return hours * 60 + mins;
    }

    return null;
  };

  /** Convert minutes-from-midnight to slot label e.g. 540 -> "9am", 544 -> "9:04am" */
  const minutesToSlotLabel = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h < 12 ? "am" : "pm";
    return m === 0 ? `${hour12}${ampm}` : `${hour12}:${String(m).padStart(2, "0")}${ampm}`;
  };

  const normalizeSlotLabel = (value) => {
    const minutes = parseSlotMinutes(value);
    return minutes == null ? null : minutesToSlotLabel(minutes);
  };

  const bookedSlotLabels = new Set(
    (queryGetBookedAppointments.data || [])
      .filter(
        (appointment) =>
          String(appointment?.appointment_id || "") !== String(appointmentId || "")
      )
      .map((appointment) =>
        normalizeSlotLabel(
          appointment?.time_slot ||
            appointment?.appointment_time ||
            appointment?.AppointmentTime
        )
      )
      .filter(Boolean)
  );

  /** Generate time slot options from doctor schedule (start, end, slot duration) for the selected date. */
  const getFilteredTimeSlots = () => {
    if (!AppointmentDate || !doctor_id) return [];
    const cached = queryClient.getQueryData(["queryGetDoctorSheduleDetails", doctor_id]);
    const schedule = (cached?.payload || cached) || null;
    const leavePeriods = Array.isArray(schedule?.leavePeriods) ? schedule.leavePeriods : [];
    const selectedDay = dayjs(AppointmentDate).format("YYYY-MM-DD");
    const isOnLeave = leavePeriods.some((lp) => {
      const start = lp?.leaveStartDate ? dayjs(lp.leaveStartDate).format("YYYY-MM-DD") : null;
      const end = lp?.leaveEndDate ? dayjs(lp.leaveEndDate).format("YYYY-MM-DD") : null;
      if (!start || !end) return false;
      return selectedDay >= start && selectedDay <= end;
    });
    if (isOnLeave) return [];
    const weekdayName = dayjs(AppointmentDate).format("dddd");
    const weekDaysList = Array.isArray(schedule?.weekDaysList) ? schedule.weekDaysList : [];
    const dayObj = weekDaysList.find((d) => String(d?.weekDay || "").toLowerCase() === weekdayName.toLowerCase());
    const windows = Array.isArray(dayObj?.slotWeeks) ? dayObj.slotWeeks.filter((s) => s?.startTime && s?.endTime) : [];
    const slotLabelsSet = new Set();
    for (const w of windows) {
      const startStr = String(w.startTime || "").toLowerCase();
      const endStr = String(w.endTime || "").toLowerCase();
      const startMin = parseSlotMinutes(startStr);
      const endMin = parseSlotMinutes(endStr);
      const duration = Math.max(1, Number(w.slotDurationMinutes) || 15);
      if (startMin == null) continue;
      if (endMin == null || endMin <= startMin) continue;
      for (let min = startMin; min < endMin; min += duration) {
        slotLabelsSet.add(minutesToSlotLabel(min));
      }
    }
    const sorted = Array.from(slotLabelsSet).sort(
      (a, b) => (parseSlotMinutes(a) ?? 0) - (parseSlotMinutes(b) ?? 0)
    );
    const allowedBySchedule = sorted.map((value) => ({
      value,
      label: value,
      disabled: bookedSlotLabels.has(value),
    }));
    const todayStr = dayjs().format("YYYY-MM-DD");
    const selectedStr = dayjs(AppointmentDate).format("YYYY-MM-DD");
    if (todayStr !== selectedStr) return allowedBySchedule;
    const threshold = dayjs().subtract(15, "minute");
    const thresholdMin = threshold.hour() * 60 + threshold.minute();
    return allowedBySchedule.filter(
      ({ value }) => (parseSlotMinutes(value) ?? -1) >= thresholdMin
    );
  };

  const timeSlotOptions = getFilteredTimeSlots();

  useEffect(() => {
    if (
      !AppointmentTime ||
      !AppointmentDate ||
      !doctor_id ||
      queryGetDoctorSchedule.isLoading ||
      queryGetBookedAppointments.isLoading
    ) {
      return;
    }

    const selectedOption = timeSlotOptions.find(
      (option) => option.value === AppointmentTime
    );

    if (!selectedOption || selectedOption.disabled) {
      onChangeBooking("AppointmentTime", "");
    }
  }, [
    AppointmentDate,
    AppointmentTime,
    doctor_id,
    onChangeBooking,
    queryGetBookedAppointments.dataUpdatedAt,
    queryGetBookedAppointments.isLoading,
    queryGetDoctorSchedule.dataUpdatedAt,
    queryGetDoctorSchedule.isLoading,
  ]);

  const mutationUpdateBooking = useMutation({
    mutationFn: (payload) => putUpdateBooking(appointmentId, payload),
    onSuccess: (data) => {
      setShowAlert({
        show: true,
        message: `Appointment updated successfully`,
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
    if (isEdit) {
      const payload = {
        AppointmentDate: dayjs(AppointmentDate).format("YYYY-MM-DD"),
        AppointmentTime: AppointmentTime,
        AppointmentMode: AppointmentMode[0],
        is_review: isReviewChecked,
      };
      mutationUpdateBooking.mutate(payload);
    } else {
      mutationAddBooikng.mutate(reqPayload());
    }
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
        {title || "New Booking"}
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
          disabled={isEdit}
          onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
          onBlur={isEdit ? undefined : handleOnBlurMobileNumber}
          InputSxProps={{
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "#000000",
              color: "#000000",
              opacity: 1,
            },
          }}
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
            disabled={isEdit}
            onChangeHandler={(value) => {
              const fullObj = paientDetailsByNum.find(
                (opt) => opt.name === value
              );
              setSelectPaientName({ ...fullObj });

              setBookingData(fullObj);
            }}
            SelectSxProps={{
              "& .MuiSelect-select.Mui-disabled": {
                WebkitTextFillColor: "#000000",
                color: "#000000",
                opacity: 1,
              },
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
              disabled={isEdit}
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
                disabled={isEdit}
                onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
                LabelSxProps={{ fontWeight: 600 }}
              />
              <TextInputWithLabel
                type="text"
                name="lastname"
                value={lastname}
                label="Last Name"
                placeholder="Enter Last name"
                disabled={isEdit}
                onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
                LabelSxProps={{ fontWeight: 600 }}
              />
            </Stack>
            <Stack flexDirection="row" gap={2}>
              <Box>
                <DatePickerComponent
                  name="dob"
                  value={dob}
                  required={false}
                  showInputLabel={true}
                  currentYear={null}
                  disableFuture
                  // resProps={{ maxDate}}
                  // inputProps={{ disableFuture: true }}
                  label="Date of Birth"
                  // helperText={!AppointmentDate && "Date of Birth  is required"}
                  sxLabel={{ fontWeight: 600 }}
                  disabled={isEdit}
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
                disabled={dob || isEdit}
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
              disabled={isEdit}
              onChangeHandler={(value) => onChangeBooking("gender", value)}
              LabelSxProps={{ fontWeight: 600 }}
            />
            <TextInputWithLabel
              type="text"
              name="ABDM_ABHA_id"
              value={ABDM_ABHA_id}
              label="ABDM ABHA ID #"
              placeholder="Enter ABDM ABHA ID #"
              disabled={isEdit}
              onChange={(e) => onChangeBooking(e.target.name, e.target.value)}
              LabelSxProps={{ fontWeight: 600 }}
            />
            <TextInputWithLabel
              type="text"
              name="address"
              value={address}
              label="Address"
              placeholder="Enter Address"
              disabled={isEdit}
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
          searchProps={{ disabled: isEdit }}
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
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isReviewChecked}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsReviewChecked(checked);
                    if (checked) {
                      onChangeBooking("payment_method", "");
                    }
                  }}
                  disabled={isEdit || !isReviewEnabled}
                />
              }
              label="Review"
            />
          </Box>
          <SelectWithLabel
            type="text"
            fullWidth
            disabled={!AppointmentDate || !doctor_id}
            name="AppointmentTime"
            value={AppointmentTime}
            minWidth={110}
            label="Time Slot"
            width="100%"
            placeholderText="Time Slot"
            noDataText="no slots available"
            showMenuOptionsLoadingStatus={
              queryGetDoctorSchedule.isLoading || queryGetBookedAppointments.isLoading
            }
            menuOptions={timeSlotOptions}
            disableMenuOptionConditionValidator={(option) => Boolean(option.disabled)}
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
        {!isReviewChecked && (
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
            searchProps={{ disabled: isEdit }}
            disabled={isEdit}
            minWidth={210}
            onChangeHandler={(value) => onChangeBooking("payment_method", value)}
            // renderValue={(value) => onChangeBooking("gender", value)}
            LabelSxProps={{ fontWeight: 600 }}
          />
        )}

        <TextAreaInputWithLabel
          type="text"
          name="Reason"
          value={Reason}
          // multiline
          rows={2}
          label="Reason"
          placeholder="Enter Reason"
          disabled={isEdit}
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
          mutationAddBooikng?.isPending ||
          mutationUpdateBooking?.isPending
        }
      />
    </Dialog>
  );
};

export default AddOrEditBooking;
