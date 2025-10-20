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
  FormControlLabel,
  Checkbox,
  InputLabel,
  Box,
  Divider,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import StyledButton from "@components/StyledButton";
import TextInputWithLabel from "@components/Inputs/TextInputWithLabel";
import SelectWithLabel from "@components/Inputs/SelectWithLabel";
import {
  GENDER_DATA,
  INITIAL_SHOW_ALERT,
  TIME_SLOTS_HOURS_OPTIONS,
  WEEK_DAYS,
} from "@data/staticData";
import { useSheduleDoctor, timeSlotObj } from "@/stores/doctorStore";
import DatePickerComponent from "@components/DatePicker";
import { Padding } from "@mui/icons-material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { deleteDoctorSheduleSlot, postDoctorShedule } from "@/serviceApis";
import PageLoader from "@pages/PageLoader";
import AlertSnackbar from "@components/AlertSnackbar";
import { useMutation } from "@tanstack/react-query";
import { useShowAlert } from "@/stores/showAlertStore";

const convertTo24Hour = (timeStr) => {
  const hour = parseInt(timeStr);
  const isPM = timeStr.toLowerCase().includes("pm");
  return isPM && hour !== 12 ? hour + 12 : isPM && hour === 12 ? 12 : hour;
};

const getSlotCount = (startTime, endTime) => {
  const startHour = convertTo24Hour(startTime);
  const endHour = convertTo24Hour(endTime);

  if (isNaN(startHour) || isNaN(endHour) || endHour <= startHour) {
    return 0; // invalid input or no time range
  }

  const durationHours = endHour - startHour;
  return durationHours * 4; // 4 slots per hour
};

const deleteDoctorSlot = (weekdaysSlots, parentIndex, childIndex) => {
  // Clone the original array to avoid mutation
  const updatedWeekdaysSlots = weekdaysSlots.map((day) => ({
    ...day,
    slotWeeks: [...day.slotWeeks],
  }));

  
  // Check if the indices are valid
  if (
    updatedWeekdaysSlots[parentIndex] &&
    updatedWeekdaysSlots[parentIndex].slotWeeks &&
    updatedWeekdaysSlots[parentIndex].slotWeeks[childIndex]
  ) {
    // Delete the slot
    updatedWeekdaysSlots[parentIndex].slotWeeks.splice(childIndex, 1);
  }

  return updatedWeekdaysSlots;
};

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

  const [editIndexs, setEditIndexs] = useState({
    weekIndex: "",
    slotIndex: "",
  });
  const doctorSheduleState = useSheduleDoctor();

  const mutateAddDoctorShedule = useMutation({
    mutationFn: (body) => postDoctorShedule(body),
    onSuccess: (res) => {
      let message = "Added Doctor Shedule";

      setShowAlert({
        show: true,
        message: `${message} has successfully`,
        status: "success",
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

  const onSumbitDoctorShedule = () => {
    const payLoad = {
      ...doctorSheduleState,
      weekDaysList: weekDaysList?.filter(({ isChecked }) => isChecked),
    };
    mutateAddDoctorShedule.mutate(payLoad);
  };

  const addTimeSheduleSlot = (weekIndex) => {
    const updatedWeekDays = doctorSheduleState?.weekDaysList.map(
      (day, index) => {
        if (index === weekIndex) {
          return {
            ...day,
            slotWeeks: [...day.slotWeeks, timeSlotObj],
          };
        }
        return day;
      }
    );
    setDoctorSheduleSlots(updatedWeekDays);
  };

  const handleSlotOnChange = (weekIndex, slotIndex, field, value) => {
    const updatedSlotChanges = doctorSheduleState.weekDaysList.map(
      (day, wIdx) => {
        if (wIdx === weekIndex) {
          const updatedSlots = day.slotWeeks.map((slotWeeks, sIdx) => {
            if (sIdx === slotIndex) {
              return {
                ...slotWeeks,
                [field]: value, // dynamically update the field
                endTime:
                  field === "startTime"
                    ? ""
                    : field === "endTime"
                    ? value
                    : slot.endTime,
                totalSlots:
                  field === "endTime"
                    ? getSlotCount(slotWeeks.startTime, value).toString()
                    : "0", // Output: 8
              };
            }
            return slotWeeks;
          });

          return {
            ...day,
            slotWeeks: updatedSlots,
          };
        }
        return day;
      }
    );
    setDoctorSheduleSlots(updatedSlotChanges);
  };
  const handleWeekDayOnChange = (weekIndex, value) => {
    const updatedWeekDayChange = doctorSheduleState?.weekDaysList.map(
      (obj, index) => {
        if (index === weekIndex) {
          return {
            ...obj,
            isChecked: value,
          };
        }
        return obj;
      }
    );
    setDoctorSheduleSlots(updatedWeekDayChange);
  };

  const getFilteredEndTimes = (startTime) => {
    const startHour = convertTo24Hour(startTime);
    return TIME_SLOTS_HOURS_OPTIONS.filter(
      ({ value }) => convertTo24Hour(value) > startHour
    );
  };

  const mutationDeleteDoctorSheduleSlot = useMutation({
    mutationFn: (payload) =>
      deleteDoctorSheduleSlot({ facility_id: "1", ...payload }),
    onSuccess: (res) => {
      setShowAlert({
        show: true,
        message: `Doctor slot deleted has successfully`,
        status: "success",
      });
      deleteDoctorSheduleTimeSlots({
        arrayList: weekDaysList,
        ...editIndexs,
      });
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Doctor slot deleted has failed`,
        status: "error",
      });
    },
  });

  const deleteDoctorSheduleTimeSlots = ({
    arrayList,
    weekIndex,
    slotIndex,
  }) => {
    const updatedWeekDaysSlots = deleteDoctorSlot(
      arrayList,
      weekIndex,
      slotIndex
    );
    setDoctorSheduleSlots(updatedWeekDaysSlots);
  };

  const handleDeleteTimeSlot = ({
    weekIndex,
    startDate,
    endDate,
    windowNum,
    slotIndex,
    doctor_id,
  }) => {
    setEditIndexs({ weekIndex, slotIndex });
    if (windowNum) {
      mutationDeleteDoctorSheduleSlot.mutate({
        weekIndex,
        startDate,
        endDate,
        windowNum,
        slotIndex,
        doctor_id,
      });
    }
    deleteDoctorSheduleTimeSlots({
      arrayList: weekDaysList,
      weekIndex,
      slotIndex,
    });
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
            m: 0,
            p: 2,
            fontSize: "18px",
            fontWeight: "600",
            justifyContent: "center",
            display: "flex",
          }}
          id="customized-dialog-title"
        >
          Shedule Doctor
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
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Stack flexDirection="column">
            <Stack flexDirection="row" gap={2} my={3}>
              <Box>
                <DatePickerComponent
                  name="startDate"
                  value={startDate}
                  required={true}
                  inputProps={{ disablePast: true, error: !startDate }}
                  label="Start Date"
                  helperText={!startDate && "Start date is required"}
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
                  required={true}
                  disabled={!startDate}
                  minDate={dayjs(startDate)}
                  disablePast
                  inputProps={{ error: !endDate }}
                  helperText={!endDate && "End date is required"}
                  label="End Date"
                  onChange={(e) =>
                    onChangeSheduleDoctor({
                      [e.target.name]: e.target.value,
                    })
                  }
                />
              </Box>
            </Stack>
            <Stack flexDirection="row" gap={6}>
              <InputLabel
                htmlFor={`menu-Start Time`}
                sx={{ fontWeight: 600, width: "20%" }}
              ></InputLabel>
              <InputLabel htmlFor={`menu-Start Time`} sx={{ fontWeight: 600 }}>
                Start Time
              </InputLabel>
              <InputLabel htmlFor={`menu- End Time`} sx={{ fontWeight: 600 }}>
                End Time
              </InputLabel>
              <InputLabel sx={{ fontWeight: 600 }}>Total Slots</InputLabel>
            </Stack>
            <Stack flexDirection="column">
              {weekDaysList.map(
                ({ isChecked, weekDay, slotWeeks }, weekIndex) => {
                  return (
                    <Stack flexDirection="column">
                      <Stack
                        flexDirection="row"
                        justifyContent="space-between"
                        my={2}
                      >
                        <Stack flexDirection="column">
                          <Stack
                            flexDirection="row"
                            gap={1}
                            alignItems="flex-start"
                          >
                            <FormControlLabel
                              sx={{ width: "50%", marginTop: "0.4rem" }}
                              control={
                                <Checkbox
                                  defaultChecked={isChecked}
                                  value={isChecked}
                                  onChange={(e) =>
                                    handleWeekDayOnChange(
                                      weekIndex,
                                      e.target.checked
                                    )
                                  }
                                />
                              }
                              label={weekDay}
                            />
                            <Stack flexDirection="column" gap={1}>
                              {slotWeeks.map(
                                (
                                  { startTime, endTime, totalSlots, windowNum },
                                  slotIndex
                                ) => (
                                  <>
                                    <Stack flexDirection="row" gap={1}>
                                      <SelectWithLabel
                                        type="text"
                                        disabled={!isChecked}
                                        name="startTime"
                                        value={startTime}
                                        minWidth={110}
                                        //   label="Start Time"
                                        width="100%"
                                        placeholderText="Start Time"
                                        menuOptions={TIME_SLOTS_HOURS_OPTIONS}
                                        onChangeHandler={
                                          (value) =>
                                            handleSlotOnChange(
                                              weekIndex,
                                              slotIndex,
                                              "startTime",
                                              value
                                            )
                                          //   onChangeDoctor("gender", value)
                                        }
                                        // renderValue={(value) => onChangeDoctor("gender", value)}
                                        LabelSxProps={{ fontWeight: 600 }}
                                      />
                                      <SelectWithLabel
                                        type="text"
                                        name="endTime"
                                        disabled={!isChecked && !startTime}
                                        value={endTime}
                                        //   label="Start Time"
                                        width="100%"
                                        placeholderText="End Time"
                                        menuOptions={
                                          startTime
                                            ? getFilteredEndTimes(startTime)
                                            : []
                                        }
                                        minWidth={110}
                                        onChangeHandler={(value) =>
                                          handleSlotOnChange(
                                            weekIndex,
                                            slotIndex,
                                            "endTime",
                                            value
                                          )
                                        }
                                        // renderValue={(value) => onChangeDoctor("gender", value)}
                                        LabelSxProps={{ fontWeight: 600 }}
                                      />
                                      <TextInputWithLabel
                                        type="text"
                                        name="totalSlots"
                                        value={totalSlots}
                                        disabled
                                        InputSxProps={{
                                          minWidth: "120px",
                                          padding: 0,
                                          marginTop: "0.5rem",
                                        }}
                                        width="100%"
                                        placeholder="Slots Count"
                                        LabelSxProps={{ fontWeight: 600 }}
                                      />
                                      {slotIndex > 0 && (
                                        <IconButton
                                          color="error"
                                          fontSize="24px"
                                          aria-label="close"
                                          onClick={() =>
                                            handleDeleteTimeSlot({
                                              weekIndex,
                                              startDate,
                                              endDate,
                                              windowNum,
                                              slotIndex,
                                              doctor_id,
                                            })
                                          }
                                        >
                                          <DeleteForeverIcon />
                                        </IconButton>
                                      )}
                                    </Stack>
                                  </>
                                )
                              )}
                            </Stack>
                          </Stack>
                        </Stack>
                        <Stack alignItems="flex-start" my={1}>
                          <IconButton
                            color="#115E59"
                            fontSize="24px"
                            aria-label="close"
                            disabled={!isChecked}
                            onClick={() => addTimeSheduleSlot(weekIndex)}
                          >
                            <AddCircleOutlineIcon />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Stack>
                  );
                }
              )}
            </Stack>
            <Stack flexDirection="row" gap={2} my={3}>
              <Box>
                <DatePickerComponent
                  name="leaveStartDate"
                  value={leaveStartDate}
                  label="Leave Start Date"
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
                  disablePast
                  label="Leave End Date"
                  onChange={(e) =>
                    onChangeSheduleDoctor({
                      [e.target.name]: e.target.value,
                    })
                  }
                />
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <StyledButton variant="contained" onClick={onSumbitDoctorShedule}>
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
      <PageLoader show={mutateAddDoctorShedule.isPending} />
    </>
  );
};

export default SheduleDoctors;
