import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  FormControlLabel,
  Checkbox,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CloseIcon from "@mui/icons-material/Close";

import StyledButton from "@components/StyledButton";
import TextInputWithLabel from "@components/inputs/TextInputWithLabel";
import SelectWithLabel from "@components/inputs/SelectWithLabel";
import DatePickerComponent from "@components/DatePicker";
import AlertSnackbar from "@components/AlertSnackbar";
import PageLoader from "@pages/PageLoader";

import {
  INITIAL_SHOW_ALERT,
  TIME_SLOTS_HOURS_OPTIONS,
} from "@data/staticData";
import {
  useSheduleDoctor,
  timeSlotObj,
} from "@/stores/doctorStore";
import {
  postDoctorShedule,
  deleteDoctorSheduleSlot,
} from "@/serviceApis";
import { useShowAlert } from "@/stores/showAlertStore";

import { useState } from "react";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";

// 🔹 Helper Functions
const convertTo24Hour = (timeStr) => {
  const hour = parseInt(timeStr);
  const isPM = timeStr.toLowerCase().includes("pm");
  return isPM && hour !== 12 ? hour + 12 : isPM && hour === 12 ? 12 : hour;
};

const getSlotCount = (startTime, endTime) => {
  const start = convertTo24Hour(startTime);
  const end = convertTo24Hour(endTime);
  if (isNaN(start) || isNaN(end) || end <= start) return 0;
  return (end - start) * 4; // 15-min slots
};

const deleteDoctorSlot = (weekdaysSlots, weekIndex, slotIndex) =>
  weekdaysSlots.map((day, i) =>
    i === weekIndex
      ? { ...day, slotWeeks: day.slotWeeks.filter((_, s) => s !== slotIndex) }
      : day
  );

// 🔹 Main Component
const SheduleDoctors = ({ open, setOpen }) => {
  const {
    startDate,
    endDate,
    leaveStartDate,
    leaveEndDate,
    weekDaysList,
    onChangeSheduleDoctor,
    setDoctorSheduleSlots,
    onReset,
    doctor_id,
  } = useSheduleDoctor();

  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();
  const [editIndex, setEditIndex] = useState({ weekIndex: null, slotIndex: null });
  const doctorSheduleState = useSheduleDoctor();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const compactLabelSx = {
    fontSize: "0.85rem",
    fontWeight: 600,
    mb: 0.5,
    color: "text.primary",
  };
  const compactInputSx = {
    height: 40,
    fontSize: "0.9rem",
  };

  // 🔹 Mutation: Add Schedule
  const mutationAddSchedule = useMutation({
    mutationFn: postDoctorShedule,
    onSuccess: () => {
      setShowAlert({
        show: true,
        message: "Doctor schedule added successfully",
        status: "success",
      });
      onReset();
      setOpen(false);
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: "Failed to add schedule",
        status: "error",
      });
    },
  });

  // 🔹 Mutation: Delete Slot
  const mutationDeleteSlot = useMutation({
    mutationFn: (payload) => deleteDoctorSheduleSlot({ facility_id: 1, ...payload }),
    onSuccess: () => {
      setShowAlert({
        show: true,
        message: "Doctor slot deleted successfully",
        status: "success",
      });
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: "Failed to delete slot",
        status: "error",
      });
    },
  });

  const handleSubmit = () => {
    const filteredWeeks = weekDaysList.filter((w) => w.isChecked);
    const payload = { ...doctorSheduleState, weekDaysList: filteredWeeks };
    mutationAddSchedule.mutate(payload);
  };

  const addTimeSlot = (weekIndex) => {
    setDoctorSheduleSlots(
      weekDaysList.map((day, i) =>
        i === weekIndex
          ? { ...day, slotWeeks: [...day.slotWeeks, timeSlotObj] }
          : day
      )
    );
  };

  const handleSlotChange = (weekIndex, slotIndex, field, value) => {
    const updated = weekDaysList.map((day, i) => {
      if (i !== weekIndex) return day;
      const updatedSlots = day.slotWeeks.map((slot, j) => {
        if (j !== slotIndex) return slot;
        const totalSlots =
          field === "endTime"
            ? getSlotCount(slot.startTime, value).toString()
            : slot.totalSlots;
        return { ...slot, [field]: value, totalSlots };
      });
      return { ...day, slotWeeks: updatedSlots };
    });
    setDoctorSheduleSlots(updated);
  };

  const handleDeleteSlot = ({
    weekIndex,
    slotIndex,
    startDate,
    endDate,
    windowNum,
  }) => {
    setEditIndex({ weekIndex, slotIndex });
    if (windowNum) {
      mutationDeleteSlot.mutate({
        weekIndex,
        startDate,
        endDate,
        windowNum,
        doctor_id,
      });
    }
    const updated = deleteDoctorSlot(weekDaysList, weekIndex, slotIndex);
    setDoctorSheduleSlots(updated);
  };

  const getFilteredEndTimes = (startTime) =>
    TIME_SLOTS_HOURS_OPTIONS.filter(
      ({ value }) => convertTo24Hour(value) > convertTo24Hour(startTime)
    );

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
            // p: 2,
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#115E59",
            textAlign: "center",
            pb: 0,
          }}
        >
          Schedule Doctor
        </DialogTitle>
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Body */}
        <DialogContent sx={{ py: 3, overflowY: "auto" }}>
          {/* Date Range */}
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            mb={3}
            // justifyContent="space-between"
          >
            <Box>
            <DatePickerComponent
              name="startDate"
              value={startDate}
              required
              label="Start Date"
              labelSx={compactLabelSx}
              inputSx={compactInputSx}
              onChange={(e) =>
                onChangeSheduleDoctor({
                  [e.target.name]: e.target.value,
                  endDate: "",
                })
              }
            />
            </Box>
             <Box>
            <DatePickerComponent
              name="endDate"
              value={endDate}
              required
              disabled={!startDate}
              minDate={dayjs(startDate)}
              label="End Date"
              labelSx={compactLabelSx}
              inputSx={compactInputSx}
              onChange={(e) =>
                onChangeSheduleDoctor({
                  [e.target.name]: e.target.value,
                })
              }
            />
            </Box>
          </Stack>

          {/* Weekday Slots */}
          {weekDaysList.map(({ isChecked, weekDay, slotWeeks }, weekIndex) => (
            <Box key={weekDay} mb={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) =>
                        setDoctorSheduleSlots(
                          weekDaysList.map((d, i) =>
                            i === weekIndex
                              ? { ...d, isChecked: e.target.checked }
                              : d
                          )
                        )
                      }
                    />
                  }
                  label={<strong>{weekDay}</strong>}
                />
                
              </Stack>

              {/* Time Slots */}
              {slotWeeks.map(({ startTime, endTime, totalSlots, windowNum }, slotIndex) => (
                <Stack
                  key={slotIndex}
                  direction={isMobile ? "column" : "row"}
                  spacing={1.5}
                  alignItems="center"
                  mt={1}
                  pl={4}
                >
                  <SelectWithLabel
                    name="startTime"
                    value={startTime}
                    disabled={!isChecked}
                    menuOptions={TIME_SLOTS_HOURS_OPTIONS}
                    placeholderText="Start Time"
                    labelSx={compactLabelSx}
                    inputSx={compactInputSx}
                    onChangeHandler={(val) =>
                      handleSlotChange(weekIndex, slotIndex, "startTime", val)
                    }
                    minWidth={100}
                  />
                  <SelectWithLabel
                    name="endTime"
                    value={endTime}
                    disabled={!isChecked || !startTime}
                    menuOptions={startTime ? getFilteredEndTimes(startTime) : []}
                    placeholderText="End Time"
                    labelSx={compactLabelSx}
                    inputSx={compactInputSx}
                    onChangeHandler={(val) =>
                      handleSlotChange(weekIndex, slotIndex, "endTime", val)
                    }
                    minWidth={100}
                  />
                  <TextInputWithLabel
                    name="totalSlots"
                    value={totalSlots}
                    disabled
                    labelSx={compactLabelSx}
                    InputSxProps={{
                      minWidth: "120px",
                      height: 40,
                      fontSize: "0.9rem",
                    }}
                  />
                  {slotIndex > 0 ? (
                    <IconButton
                      color="error"
                      onClick={() =>
                        handleDeleteSlot({
                          weekIndex,
                          slotIndex,
                          startDate,
                          endDate,
                          windowNum,
                        })
                      }
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  ): <IconButton
                  color="primary"
                  disabled={!isChecked}
                  onClick={() => addTimeSlot(weekIndex)}
                >
                  <AddCircleOutlineIcon sx={{ color: "#115E59" }} />
                </IconButton>}
                </Stack>
              ))}
            </Box>
          ))}

          {/* Leave Dates */}
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            mt={3}
            justifyContent="space-between"
          >
            <Box>
            <DatePickerComponent
              name="leaveStartDate"
              value={leaveStartDate}
              label="Leave Start Date"
              labelSx={compactLabelSx}
              inputSx={compactInputSx}
              onChange={(e) =>
                onChangeSheduleDoctor({
                  [e.target.name]: e.target.value,
                  leaveEndDate: "",
                })
              }
            />
            </Box>
            <Box>
            <DatePickerComponent
              name="leaveEndDate"
              value={leaveEndDate}
              disabled={!leaveStartDate}
              minDate={dayjs(leaveStartDate)}
              label="Leave End Date"
              labelSx={compactLabelSx}
              inputSx={compactInputSx}
              onChange={(e) =>
                onChangeSheduleDoctor({
                  [e.target.name]: e.target.value,
                })
              }
            />
            </Box>
          </Stack>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <StyledButton variant="contained" onClick={handleSubmit}>
            Submit
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar + Loader */}
      <AlertSnackbar
        message={showAlert.message}
        showAlert={showAlert.show}
        severity={showAlert.status}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setShowAlert(INITIAL_SHOW_ALERT)}
      />
      <PageLoader show={mutationAddSchedule.isPending} />
    </>
  );
};

export default SheduleDoctors;
