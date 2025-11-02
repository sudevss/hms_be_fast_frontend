import MuiReactTableComponent from "@/components/Table/MuiReactTableComponent";
import { useEffect, useMemo, useState } from "react";
import { Box, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Stack, Tooltip } from "@mui/material";

import {
  deleteAppoinmentBooking,
  getAppointmentsAndBookings,
  getPatientDiagnosis,
  postCheckinAppoinmentBooking,
  getAppointmentDetailsById,
  postUpdateAppointmentStatus,
  postUpdatePaymentStatus,
} from "@/serviceApis";

import PageLoader from "@pages/PageLoader";
import AlertSnackbar from "@components/AlertSnackbar";
import DatePickerComponent from "@components/DatePicker";
import AddOrEditPatientDiagnosis from "@/ReusableComponents/AddOrEditPatientDiagnosis";
import PatientReports from "@/ReusableComponents/PatientReports";

import { FaDiagnoses, FaCheck } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { BiSolidReport } from "react-icons/bi";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePatientDiagnosis } from "@/stores/patientStore";
import { useShowAlert } from "@/stores/showAlertStore";
import { INITIAL_SHOW_ALERT, PAYMENT_METHODS } from "@data/staticData";
import { convertUTCClockToIST, dayjs } from "@utils/dateUtils";
import SelectWithLabel from "@components/inputs/SelectWithLabel";
import StyledButton from "@components/StyledButton";
import EditAttributesIcon from "@mui/icons-material/EditAttributes";
import ViewAppointmentDetails from "@/ReusableComponents/AppointmentDetailsDialog";


const AppointmentsTable = ({
  setIsCheckinOpen,
  refetchDashBoard,
  tabName,
  patient_id,
  isDate = true,
  isDashboard = false,
  dashboardData = [],
  hourlyBookings,
  summary,
  updateAppointmentStatus,
}) => {
  const currentDate = dayjs().format("YYYY-MM-DD");
  const [appointmentDateFilter, setAppointmentDateFilter] =
    useState(currentDate);
  const [endDate, setEndDate] = useState("");
  const [openDiagnosis, setOpenDiagnosis] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  const [patientReportsObj, setPatientReportObj] = useState("");
  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [paymentObj, setPaymentObj] = useState({
    appointment_id: "",
    facility_id: 1,
    payment_status: false,
    payment_method: "",
    open: false,
  });

  const { setPatientDiagnosis } = usePatientDiagnosis();
  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();
  const queryClient = useQueryClient();

  // 🔹 Manage date filters
  useEffect(() => {
    if (tabName === "Completed") {
      const previousDate = dayjs().subtract(2, "month").format("YYYY-MM-DD");
      setAppointmentDateFilter(previousDate);
      setEndDate(currentDate);
    } else {
      setAppointmentDateFilter(currentDate);
    }
  }, [tabName, patient_id]);

  // 🔹 Fetch Appointments
  const {
    data: appointmentData = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "queryGetAppointmentsAndBookings",
      appointmentDateFilter,
      tabName,
      patient_id,
      endDate,
    ],
    queryFn: () =>
      getAppointmentsAndBookings({
        date: appointmentDateFilter,
        facility_id: 1,
        appointment_status: tabName,
        end_date: tabName === "Completed" ? endDate : appointmentDateFilter,
        patient_id,
      }),
    enabled: true,
  });

  const updatePaymentStatus = (row) => {
    setPaymentObj({ ...paymentObj, ...row, open: true });
    // const payment_status = row.paid ? false : true;
    // mutationAppoinmentStatusUpdate.mutate({
    //   appointment_id: row.appointment_id,
    //   payment_status,
    //   payment_method: row.payment_method || "Cash",
    // });
  };

  const mutationPaymentStatusUpdate = useMutation({
    mutationFn: (payload) => postUpdatePaymentStatus(payload),
    onSuccess: () => {
      setShowAlert({
        show: true,
        message: `Payment updated successfully`,
        status: "success",
      });
      queryClient.invalidateQueries(["dashboard"]);
      setPaymentObj({ appointment_id: "", open: false });
      onResetAlert();
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Payment update failed`,
        status: "error",
      });
    },
  });

  const handlePaymentSubmit = () =>
    mutationPaymentStatusUpdate.mutate(paymentObj);

  // 🔹 Delete Appointment
  const mutationDelete = useMutation({
    mutationFn: (payload) => deleteAppoinmentBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["queryGetAppointmentsAndBookings"]);
      refetch();
      setShowAlert({
        show: true,
        message: "Appointment deleted successfully",
        status: "success",
      });
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: "Failed to delete appointment",
        status: "error",
      });
    },
  });

  // 🔹 Check-in
  const mutationCheckin = useMutation({
    mutationFn: (payload) => postCheckinAppoinmentBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries([
        "queryGetAppointmentsAndBookings",
        "dashboard",
      ]);
      setShowAlert({
        show: true,
        message: "Check-in successful",
        status: "success",
      });
      refetchDashBoard?.();
      setIsCheckinOpen?.(false);
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: "Check-in failed",
        status: "error",
      });
    },
  });

  // 🔹 Get Diagnosis Data
  const mutationGetDiagnosis = useMutation({
    mutationFn: (payload) => getPatientDiagnosis(payload),
    onSuccess: (data) => {
      setPatientDiagnosis({ ...data?.[0] });
      setOpenDiagnosis(true);
    },
  });

  const mutationGetAppointmentDetails = useMutation({
  mutationFn: (payload) => getAppointmentDetailsById(payload),
  onSuccess: (data) => {
    const normalized = Array.isArray(data) ? data?.[0] : data;
    setSelectedAppointment(normalized);
    setOpenViewDetails(true);
  },
  onError: () => {
    setShowAlert({
      show: true,
      message: "Failed to fetch appointment details",
      status: "error",
    });
  },
});

  // 🔹 Table Action Helpers
  const handleDelete = (row) => mutationDelete.mutate(row);
  const handleCheckin = (row) => mutationCheckin.mutate(row);
  const handleDiagnosis = (row) => {
    if (row?.diagnosis_id) mutationGetDiagnosis.mutate(row);
    else {
      setPatientDiagnosis({
        appointment_id: row.appointment_id,
        patient_id: row.PatientID,
        facility_id: row.facility_id,
        doctor_id: row.doctor_id,
        ...row,
      });
      setOpenDiagnosis(true);
    }
  };
  const handleReports = (row) => {
    setPatientReportObj({ ...row });
    setOpenReports(true);
  };

  // 🔹 Columns (memoized)
  const columns = useMemo(() => {
    const paymentCell = ({ row }) => (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        
        <Tooltip
          title={
            row.original.is_paid || row.original.paid ? "Paid" : "Not Paid"
          }
          arrow
        >
          <IconButton>
            {row.original.is_paid || row.original.paid ? (
              <FaCheck color="#115E59" />
            ) : (
              <FcCancel />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    );

    const dashboardActionsCell = ({ row }) => (
      <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
        {!["Completed"].includes(tabName) && (
          <Tooltip
            placement="top"
            title="Move Complete Status"
            arrow
            enterDelay={100}
          >
            <IconButton
              backgroundColor="#115E59"
              onClick={() => updateAppointmentStatus(row.original)}
            >
              <EditAttributesIcon color="#115E59" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip placement="top" title="Payment Update" arrow enterDelay={100}>
          <IconButton
            color="#115E59"
            disabled={row.original.is_paid || row.original.paid}
            onClick={() => {
              updatePaymentStatus(row.original);
            }}
          >
            <CurrencyRupeeIcon color="#115E59" />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title="Add Diagnosis" arrow enterDelay={100}>
          <IconButton
            backgroundColor="#115E59"
            onClick={() => {
              if (row.original?.diagnosis_id) {
                mutationGetDiagnosis.mutate(row.original);
              }

              setPatientDiagnosis({
                appointment_id: row.original?.appointment_id,
                patient_id: row.original?.PatientID,
                facility_id: row.original?.facility_id,
                doctor_id: row.original?.doctor_id,
                ...row.original,
              });
              setOpenDiagnosis(true);
            }}
          >
            <FaDiagnoses color="#115E59" />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title="Reports" arrow enterDelay={100}>
          <IconButton
            backgroundColor="#115E59"
            onClick={() => {
              setOpenReports(true);
              setPatientReportObj({ ...row.original });
              // setOpenDiagnosis(true);
              // setPatientDiagnosis({
              //   appointment_id: row.original?.appointment_id,
              // });
              // mutationGetDiagnosis(row.original);
              // setPatientDiagnosis({ ...row.original });
            }}
          >
            <BiSolidReport color="#115E59" />
          </IconButton>
        </Tooltip>
      </Box>
    );
    const actionsCell = ({ row }) => (
      <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
         <Tooltip placement="top" title="View Appointment" arrow enterDelay={100}>
            <IconButton
              backgroundColor="#115E59"
              onClick={() => {
                mutationGetAppointmentDetails.mutate({
                  appointment_id: row.original.appointment_id,
                  facility_id: row.original.facility_id,
                });
              }}
            >
            <VisibilityIcon color="#115E59" />
            </IconButton>
          </Tooltip>

        {["Scheduled"].includes(tabName) && (
          <Tooltip placement="top" title="Checkin" arrow enterDelay={100}>
            <IconButton
              backgroundColor="#115E59"
              onClick={() => handleCheckin(row.original)}
            >
              <ToggleOffOutlinedIcon color="#115E59" />
            </IconButton>
          </Tooltip>
        )}

        {["Completed"].includes(tabName) && (<>
      <Tooltip placement="top" title="Payment Update" arrow enterDelay={100}>
        <IconButton
          backgroundColor="#115E59"
          disabled={row.original.is_paid || row.original.paid}
          onClick={() => {
            updatePaymentStatus(row.original);
          }}
        >
          <CurrencyRupeeIcon color="#115E59" />
        </IconButton>
      </Tooltip>
    </>
  )}

        {!["Scheduled"].includes(tabName) && (
          <Tooltip placement="top" title="Add Diagnosis" arrow enterDelay={100}>
            <IconButton
              backgroundColor="#115E59"
              onClick={() => handleDiagnosis(row.original)}
            >
              <FaDiagnoses color="#115E59" />
            </IconButton>
          </Tooltip>
        )}
        {tabName === "Completed" && (
          <Tooltip placement="top" title="Reports" arrow enterDelay={100}>
            <IconButton
              backgroundColor="#115E59"
              onClick={() => handleReports(row.original)}
            >
              <BiSolidReport color="#115E59" />
            </IconButton>
          </Tooltip>
        )}
        {tabName === "Scheduled" && (
          <Tooltip placement="top" title="Delete" arrow enterDelay={100}>
            <IconButton
              color="error"
              onClick={() => handleDelete(row.original)}
            >
              <DeleteForeverIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
    const tokenColumn = [
      { accessorKey: "token", header: "Token" },
      { accessorKey: "patient_name", header: "Patient Name" },
      {
        accessorKey: "checkin_time",
        header: "Check-in-Time",
        Cell: ({ row }) => (
          <span>
            {row.original.checkin_time
              ? convertUTCClockToIST(row.original.checkin_time)
              : "-"}
          </span>
        ),
      },
      { accessorKey: "doctor_name", header: "Doctor" },
      { accessorKey: "payment_type", header: "Payment Type" },
      { accessorKey: "is_paid", header: "Payment", Cell: paymentCell },
      { accessorKey: "actions", header: "Actions", Cell: dashboardActionsCell },
    ];

    const appointmentColumn = [
      { accessorKey: "appointment_id", header: "ID", size: 80 },
      { accessorKey: "name", header: "Patient Name" },
      { accessorKey: "phone", header: "Mobile", size: 120 },
      { accessorKey: "doctor", header: "Doctor", size: 150 },
      { accessorKey: "time_slot", header: "Time Slot", size: 130 },
      { accessorKey: "payment_method", header: "Payment Type", size: 110 },
      { accessorKey: "paid", header: "Payment", Cell: paymentCell },
      { accessorKey: "consultation_fee", header: "Fee", size: 80 },
      { accessorKey: "actions", header: "Actions", Cell: actionsCell },
    ];
    return isDashboard ? tokenColumn : appointmentColumn;
  }, [tabName]);

  const tableProps = {
    initialState: {
      showGlobalFilter: true,
      showColumnFilters: true,
      columnPinning: { right: ["actions"], left: ["appointment_id"] },
    },
  };

  const showLoader =
    isLoading ||
    mutationDelete.isPending ||
    mutationCheckin.isPending ||
    mutationGetDiagnosis.isPending ||
    mutationPaymentStatusUpdate.isPending;

  // 🔹 Render End Date Filter (for Completed tab)
  const renderTopToolbarComponent = () => (
    <Stack direction="row" alignItems="center" gap={2}>
      <Box width="12vw">
        <DatePickerComponent
          name="endDate"
          value={endDate}
          label="End Date"
          onChange={(e) => setEndDate(e.target.value)}
          dateProps={{ disableFuture: true }}
        />
      </Box>
    </Stack>
  );

  return (
    <>
      <PageLoader show={showLoader} />
      <AlertSnackbar
        message={showAlert.message}
        showAlert={showAlert.show}
        severity={showAlert.status}
        onClose={() => onResetAlert()}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <MuiReactTableComponent
        data={isDashboard ? dashboardData : appointmentData}
        date={appointmentDateFilter}
        setDate={setAppointmentDateFilter}
        dateLabel="Start Date"
        isDate={isDate}
        columns={columns}
        tableProps={tableProps}
        maxHeight="40vh"
        CustomRenderTopToolbar={
          ["Completed"].includes(tabName) && renderTopToolbarComponent
        }
      />
      <Dialog
        open={paymentObj?.open}
        onClose={() => setPaymentObj({ appointment_id: "", open: false })}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Update Payment
        </DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={paymentObj?.payment_status}
                onChange={(e) =>
                  setPaymentObj((prev) => ({
                    ...prev,
                    payment_status: e.target.checked,
                  }))
                }
              />
            }
            label="Payment Status"
          />

          <SelectWithLabel
            type="text"
            name="paymentMethod"
            value={paymentObj?.payment_method}
            label="Payment Method"
            placeholderText="Select Payment Method"
            menuOptions={PAYMENT_METHODS}
            width="100%"
            onChangeHandler={(value) =>
              setPaymentObj((prev) => ({
                ...prev,
                payment_method: value,
              }))
            }
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <StyledButton variant="contained" onClick={handlePaymentSubmit}>
            Submit
          </StyledButton>
        </DialogActions>
      </Dialog>

      <ViewAppointmentDetails
        open={openViewDetails}
        onClose={() => setOpenViewDetails(false)}
        appointment={selectedAppointment}
        showDiagnosis={tabName === "Completed"}
      />


      {/* Modals */}
      <AddOrEditPatientDiagnosis
        open={openDiagnosis}
        setOpen={setOpenDiagnosis}
      />
      <PatientReports
        open={openReports}
        setOpen={setOpenReports}
        setPatientReportObj={setPatientReportObj}
        patientReportsObj={patientReportsObj}
      />
    </>
  );
};

export default AppointmentsTable;
