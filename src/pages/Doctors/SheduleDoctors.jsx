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
  Divider,
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
  DOCTOR_SHEDULE_SLOTS_OPTIONS,
} from "@data/staticData";
import {
  useSheduleDoctor,
  timeSlotObj,
} from "@/stores/doctorStore";
import {
  postDoctorShedule,
  deleteDoctorSheduleSlot,
  getDoctorSheduleDetails,
} from "@/serviceApis";
import { useShowAlert } from "@/stores/showAlertStore";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// 🔹 Helper Functions
const convertTo24Hour = (timeStr) => {
  const hour = parseInt(timeStr);
  const isPM = timeStr.toLowerCase().includes("pm");
  return isPM && hour !== 12 ? hour + 12 : isPM && hour === 12 ? 12 : hour;
};

const getSlotCount = (startTime, endTime, durationMinutes = 15) => {
  const start = convertTo24Hour(startTime);
  const end = convertTo24Hour(endTime);
  if (isNaN(start) || isNaN(end) || end <= start) return 0;
  const totalMinutes = (end - start) * 60;
  return Math.floor(totalMinutes / Math.max(1, durationMinutes));
};
// const getSlotCount = (startTime, endTime) => {
//   const start = convertTo24Hour(startTime);
//   const end = convertTo24Hour(endTime);
//   if (isNaN(start) || isNaN(end) || end <= start) return 0;
//   return (end - start) * 4; // 15-min slots
//   //   return (end - start) * 4;
// };

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
    weekDaysList,
    onChangeSheduleDoctor,
    setDoctorSheduleSlots,
    onReset,
    doctor_id,
    facility_id,
    leavePeriods,
  } = useSheduleDoctor();

  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();
  const queryClient = useQueryClient();
  const [editIndex, setEditIndex] = useState({ weekIndex: null, slotIndex: null });
  const doctorSheduleState = useSheduleDoctor();
  const [slotDurations, setSlotDurations] = useState(
    (weekDaysList || []).map(() => 15)
  );

  useEffect(() => {
    const next = (weekDaysList || []).map((day) => {
      const first = (day.slotWeeks || [])[0];
      const m = Number(first?.slotDurationMinutes);
      return Number.isFinite(m) && m > 0 ? m : 15;
    });
    setSlotDurations(next);
  }, [weekDaysList]);

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
      // Invalidate dashboard queries to trigger refetch and update slot counts
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onReset();
      setOpen(false);
      // Ensure doctor schedule query is invalidated so dialogs/views immediately refresh
      if (doctor_id) {
        queryClient.invalidateQueries({ queryKey: ["queryGetDoctorSheduleDetails", doctor_id] });
      }
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
    mutationFn: (payload) => deleteDoctorSheduleSlot({ facility_id, ...payload }),
    onSuccess: async () => {
      setShowAlert({
        show: true,
        message: "Doctor slot deleted successfully",
        status: "success",
      });
      // Invalidate dashboard queries to trigger refetch and update slot counts
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // Ensure doctor schedule query is invalidated so dialogs/views immediately refresh
      if (doctor_id) {
        queryClient.invalidateQueries({ queryKey: ["queryGetDoctorSheduleDetails", doctor_id] });
      }
      try {
        const fresh = await getDoctorSheduleDetails({
          facility_id,
          doctor_id,
        });
        const normalizedWeekDays = (fresh?.weekDaysList || []).map((d) => {
          const normalizedSlotWeeksRaw = (d.slotWeeks || [])
            .filter((s) => (s.startTime && s.endTime) || s.window || s.window_num || s.windowNum)
            .map((slot, j) => ({
              ...slot,
              windowNum: slot.windowNum || slot.window_num || slot.window || j + 1,
            }));
          const duration = Number((d.slotWeeks || [])[0]?.slotDurationMinutes) || 15;
          const normalizedSlotWeeks =
            normalizedSlotWeeksRaw.length > 0
              ? normalizedSlotWeeksRaw
              : [{ startTime: "", endTime: "", totalSlots: "", slotDurationMinutes: duration, windowNum: "" }];
          return {
            ...d,
            slotWeeks: normalizedSlotWeeks,
            isChecked: normalizedSlotWeeks.some((s) => s.windowNum),
          };
        });
        setDoctorSheduleSlots(normalizedWeekDays);
      } catch (_) {
        // ignore refetch errors; keep optimistic UI
      }
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
    const filteredWeeks = weekDaysList
      .filter((w) => w.isChecked)
      .map((day, i) => {
        const slots = (day.slotWeeks || [])
          .filter((s) => s.startTime && s.endTime)
          .map((slot, j) => ({
            ...slot,
            windowNum: slot.windowNum || slot.window_num || slot.window || j + 1,
            slotDurationMinutes:
              Number(slot.slotDurationMinutes) > 0
                ? Number(slot.slotDurationMinutes)
                : slotDurations[i] || 15,
          }));
        return { ...day, slotWeeks: slots };
      });
    const validLeavePeriods =
      (leavePeriods || []).filter(
        (lp) => lp.leaveStartDate && lp.leaveEndDate
      );

    const payload = {
      ...doctorSheduleState,
      weekDaysList: filteredWeeks,
      leavePeriods: validLeavePeriods,
    };
    mutationAddSchedule.mutate(payload);
  };

  const addTimeSlot = (weekIndex) => {
    const nextRaw = weekDaysList.map((day, i) =>
      i === weekIndex ? { ...day, slotWeeks: [...day.slotWeeks, timeSlotObj] } : day
    );
    const next = nextRaw.map((day) => ({
      ...day,
      slotWeeks: (day.slotWeeks || []).map((slot, j) => ({
        ...slot,
        windowNum: slot.windowNum || slot.window_num || slot.window || j + 1,
      })),
    }));
    setDoctorSheduleSlots(next);
    if (doctor_id) {
      queryClient.setQueryData(["queryGetDoctorSheduleDetails", doctor_id], (old) => {
        if (!old) return old;
        return { ...old, weekDaysList: next };
      });
    }
  };

  const handleSlotChange = (weekIndex, slotIndex, field, value) => {
    const updated = weekDaysList.map((day, i) => {
      if (i !== weekIndex) return day;
      const updatedSlots = day.slotWeeks.map((slot, j) => {
        if (j !== slotIndex) return slot;
        const newStart = field === "startTime" ? value : slot.startTime;
        const newEnd = field === "endTime" ? value : slot.endTime;
        const duration = slotDurations[weekIndex] || 15;
        const totalSlots =
          newStart && newEnd
            ? getSlotCount(newStart, newEnd, duration).toString()
            : slot.totalSlots;
        // const totalSlots =
        //   field === "endTime"
        //     ? getSlotCount(slot.startTime, value).toString()
        //     : slot.totalSlots;
        return { ...slot, [field]: value, totalSlots, slotDurationMinutes: duration};
      });
      return { ...day, slotWeeks: updatedSlots };
    });
    setDoctorSheduleSlots(updated);
    // Update cached schedule so other components (DoctorDetailsDialog) reflect changes immediately
    if (doctor_id) {
      queryClient.setQueryData(["queryGetDoctorSheduleDetails", doctor_id], (old) => {
        if (!old) return old;
        return { ...old, weekDaysList: updated };
      });
    }
  };

  const handleDeleteSlot = ({
    weekIndex,
    slotIndex,
    windowNum,
  }) => {
    setEditIndex({ weekIndex, slotIndex });
    const daySlots = weekDaysList[weekIndex]?.slotWeeks || [];
    const weekDayName = weekDaysList[weekIndex]?.weekDay;
    if (windowNum) {
      mutationDeleteSlot.mutate({
        doctor_id,
        week_day: weekDayName,
        window_num: windowNum,
      });
    }
    let updated;
    if (daySlots.length <= 1) {
      const duration = slotDurations[weekIndex] || 15;
      const blank = { startTime: "", endTime: "", totalSlots: "", slotDurationMinutes: duration, windowNum: "" };
      updated = weekDaysList.map((day, i) =>
        i === weekIndex ? { ...day, slotWeeks: [blank] } : day
      );
    } else {
      const updatedRaw = deleteDoctorSlot(weekDaysList, weekIndex, slotIndex);
      updated = updatedRaw.map((day) => ({
        ...day,
        slotWeeks: (day.slotWeeks || []).map((slot, j) => ({
          ...slot,
          windowNum: slot.windowNum || slot.window_num || slot.window || j + 1,
        })),
      }));
    }
    setDoctorSheduleSlots(updated);
    if (doctor_id) {
      queryClient.setQueryData(["queryGetDoctorSheduleDetails", doctor_id], (old) => {
        if (!old) return old;
        return { ...old, weekDaysList: updated };
      });
    }
  };

  const updateSlotDuration = (weekIndex, inputVal) => {
    const minutes = parseInt(String(inputVal).replace(/\D/g, ""), 10);
    const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 15;
    setSlotDurations((prev) => {
      const next = [...prev];
      next[weekIndex] = safeMinutes;
      return next;
    });
    const updated = weekDaysList.map((day, i) => {
      if (i !== weekIndex) return day;
      const recomputedSlots = (day.slotWeeks || []).map((slot) => {
        const totalSlots =
          slot.startTime && slot.endTime
            ? getSlotCount(slot.startTime, slot.endTime, safeMinutes).toString()
            : slot.totalSlots;
        return { ...slot, totalSlots, slotDurationMinutes: safeMinutes };
      });
      return { ...day, slotWeeks: recomputedSlots };
    });
    setDoctorSheduleSlots(updated);
    // Reflect slot duration changes in cached schedule so other components update immediately
    if (doctor_id) {
      queryClient.setQueryData(["queryGetDoctorSheduleDetails", doctor_id], (old) => {
        if (!old) return old;
        return { ...old, weekDaysList: updated };
      });
    }
  };

  const getFilteredEndTimes = (startTime) =>
    DOCTOR_SHEDULE_SLOTS_OPTIONS.filter(
      ({ value }) => convertTo24Hour(value) > convertTo24Hour(startTime)
    );

  const handleClose = () => {
    onReset();
    onResetAlert();
    setOpen(false);
  };

  const addLeaveRow = () => {
    const prev = Array.isArray(leavePeriods) ? leavePeriods : [];
    onChangeSheduleDoctor({
      leavePeriods: [...prev, { leaveStartDate: "", leaveEndDate: "" }],
    });
  };

  const deleteLeaveRow = (index) => {
    const next = (leavePeriods || []).filter((_, i) => i !== index);
    onChangeSheduleDoctor({ leavePeriods: next });
  };


  const updateLeaveRow = (index, field, value) => {
    const prev = Array.isArray(leavePeriods)
      ? leavePeriods
      : [{ leaveStartDate: "", leaveEndDate: "" }];
    const next = prev.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    onChangeSheduleDoctor({ leavePeriods: next });
  };


  return (
    <>
      <Dialog
        open={open || false}
        // onClose={handleClose}
        fullWidth
        maxWidth="md"
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
          
          <Box sx={{ pl: 4, pr: 2, mb: 1 }}>
            <TextInputWithLabel
              type="number"
              name={`slotDuration-${weekIndex}`}
              value={(slotDurations[weekIndex] || 15).toString()}
              label="Slot Duration (mins)"
              placeholder="e.g. 15"
              disabled={!isChecked}
              onChange={(e) => updateSlotDuration(weekIndex, e.target.value)}
              LabelSxProps={{ fontWeight: 600 }}
              InputSxProps={{ height: 40, fontSize: "0.9rem", minWidth: 120 }}
            />
          </Box>

              {/* Time Slots */}
              {(() => {
                const rows = slotWeeks.length ? slotWeeks : [{ ...timeSlotObj, id: genId(`tmp-${weekIndex}-`) }];
                return rows.map(({ startTime, endTime, totalSlots, windowNum, id }, slotIndex) => (
                  <Stack
                    key={id || windowNum || `${weekIndex}-${slotIndex}`}
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
                      menuOptions={DOCTOR_SHEDULE_SLOTS_OPTIONS}
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
                    {slotIndex === rows.length - 1 && (
                      <IconButton
                        color="primary"
                        disabled={!isChecked}
                        onClick={() => addTimeSlot(weekIndex)}
                      >
                        <AddCircleOutlineIcon sx={{ color: "#115E59" }} />
                      </IconButton>
                    )}
                  </Stack>
                ));
              })()}
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />

          {/* Leave Dates */}
          <Box mt={3}>
            {/* Show Add Leave button when no leave rows exist */}
            {leavePeriods?.length === 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <StyledButton variant="outlined" onClick={addLeaveRow}>
                  Add Leave
                </StyledButton>
              </Box>
            )}

            {/* Render leave rows */}
            {(leavePeriods || []).map((row, index) => (
              <Stack
                key={index}
                direction={isMobile ? "column" : "row"}
                spacing={1.5}
                alignItems="center"
              >
                <Box sx={{ flex: 1 }}>
                  <DatePickerComponent
                    name="leaveStartDate"
                    value={row.leaveStartDate}
                    label={index === 0 ? "Leave Start Date" : ""}
                    labelSx={compactLabelSx}
                    inputSx={compactInputSx}
                    onChange={(e) =>
                      updateLeaveRow(index, "leaveStartDate", e.target.value)
                    }
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <DatePickerComponent
                    name="leaveEndDate"
                    value={row.leaveEndDate}
                    disabled={!row.leaveStartDate}
                    minDate={row.leaveStartDate ? dayjs(row.leaveStartDate) : undefined}
                    label={index === 0 ? "Leave End Date" : ""}
                    labelSx={compactLabelSx}
                    inputSx={compactInputSx}
                    onChange={(e) =>
                      updateLeaveRow(index, "leaveEndDate", e.target.value)
                    }
                  />
                </Box>

                {/* Delete + Add icons */}
                <Box
                  sx={{
                    width: 60,
                    flexShrink: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    pt: "20px",
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      color="error"
                      onClick={() => deleteLeaveRow(index)}
                    >
                      <DeleteForeverIcon />
                    </IconButton>

                    {index === leavePeriods.length - 1 && (
                      <IconButton color="primary" onClick={addLeaveRow}>
                        <AddCircleOutlineIcon sx={{ color: "#115E59" }} />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
              </Stack>
            ))}
          </Box>
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
