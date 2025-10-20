import MuiReactTableComponent from "@/components/Table/MuiReactTableComponent";
import { useEffect, useMemo, useState } from "react";

import { Box, Button, IconButton, Stack, Tooltip } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import EnhancedStackedBarChart from "@components/Charts/EnhancedStackedBarChart";
import {
  deleteAppoinmentBooking,
  getAppointmentsAndBookings,
  getPatientDiagnosis,
  postCheckinAppoinmentBooking,
} from "@/serviceApis";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageLoader from "@pages/PageLoader";
import AlertSnackbar from "@components/AlertSnackbar";
import { FaDiagnoses } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { BiSolidReport } from "react-icons/bi";
import AddOrEditPatientDiagnosis from "@/ReusableComponents/AddOrEditPatientDiagnosis";
import { usePatientDiagnosis } from "@/stores/patientStore";
import PatientReports from "@/ReusableComponents/PatientReports";
import DatePickerComponent from "@components/DatePicker";
import { INITIAL_SHOW_ALERT } from "@data/staticData";
import { useShowAlert } from "@/stores/showAlertStore";

const AppointmentsTable = ({
  setIsCheckinOpen,
  refetchDashBoard,
  tabName,
  patient_id,
  isDate=true,
  isDashboard=false,
  dashboardData=[],
  hourlyBookings,
  summary,
  updatePaymentStatus,
  updateAppointmentStatus
}) => {
  const currentDate = dayjs().format("YYYY-MM-DD");
  const [appointmentDateFilter, setAppointmentDateFilter] =
    useState(currentDate);
  const [endDate, setEndDate] = useState("");
  const [openDiagnosis, setOpenDiagnosis] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  const [patientReportsObj, setPatientReportObj] = useState("");

  const { setPatientDiagnosis } = usePatientDiagnosis();
  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();

  useEffect(() => {
    if (tabName === "Completed") {
      const previousDate = dayjs().subtract(2, "month").format("YYYY-MM-DD");
      setAppointmentDateFilter(previousDate);
      setEndDate(currentDate);
    } else {
      setAppointmentDateFilter(currentDate);
    }
  }, [tabName, patient_id]);
  const queryClient = useQueryClient();

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
        patient_id: patient_id,
      }),
    enabled: true,
  });

  const mutationDeleteAppointmentBooking = useMutation({
    mutationFn: (payload) => deleteAppoinmentBooking({ ...payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["queryGetAppointmentsAndBookings"],
        exact: false,
        refetchActive: true,
        refetchInactive: false,
      });
      refetch();
      setShowAlert({
        show: true,
        message: `Appointment Booking is deleted  successfully`,
        status: "success",
      });
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Appointment Booking is delete failed`,
        status: "error",
      });
    },
  });

  const mutationCheckinAppointmentBooking = useMutation({
    mutationFn: (payload) => postCheckinAppoinmentBooking({ ...payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["queryGetAppointmentsAndBookings"],
        exact: false,
        refetchActive: true,
        refetchInactive: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
        exact: false,
        refetchActive: true,
        refetchInactive: false,
      });
      setShowAlert({
        show: true,
        message: `Appointment Booking Check-in is successfully`,
        status: "success",
      });
      refetchDashBoard();
      if (setIsCheckinOpen) {
        setIsCheckinOpen(false);
      }
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Appointment Booking is Check-in failed`,
        status: "error",
      });
    },
  });
  const handleDeleleAppoinmentBooking = (_obj) => {
    mutationDeleteAppointmentBooking.mutate({ ..._obj });
  };

  const handleCheckinAppoinmentBooking = (_obj) => {
    mutationCheckinAppointmentBooking.mutate({ ..._obj });
  };


  const mutationGetDiagnosis = useMutation({
    mutationFn: (payload) => getPatientDiagnosis({ ...payload }),
    onSuccess: (data) => {
      setOpenDiagnosis(true);
      setPatientDiagnosis({ ...data?.[0] });
      return;
    },
  });
  
  const dashboardColumns = useMemo(
    () => [
      {
        accessorKey: "token", //access nested data with dot notation
        header: "Token",
        size: 100,
      },
      {
        accessorKey: "patient_name",
        header: "Patient Name",
        // size: 150,
      },

      {
        accessorKey: "checkin_time",
        header: "Check-in Time",
        size: 110,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "doctor_name",
        header: "Doctor Name",
        size: 150,
        enableSorting: false,
      },
      {
        accessorKey: "payment_type",
        header: "Payment Type",
        size: 110,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "is_paid",
        header: "Payment",
        size: 110,
        enableSorting: false,
        enableColumnFilter: false,
          Cell: ({ row }) => (
          <Box
            sx={{ display: "flex", width: "100%", justifyContent: "center" }}
          >
            <Tooltip
              placement="top"
              title={row?.original?.is_paid || row?.original?.paid  ? "Paid" : "Not paid"}
              arrow
              enterDelay={100}
            >
              <IconButton backgroundColor="#115E59">
                {row?.original?.is_paid || row?.original?.paid ? (
                  <FaCheck color="#115E59" />
                ) : (
                  <FcCancel color="#D20A3C" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 120, // Desired width in pixels
        minSize: 100, // Minimum width
        maxSize: 200, // Maximum width
        enableResizing: true, // Optional: allows user to resize
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box
            sx={{ display: "flex", width: "100%", justifyContent: "center" }}
          >
            {!["Completed"].includes(tabName) && (
              <Tooltip placement="top" title="Checkin" arrow enterDelay={100}>
                <IconButton
                  backgroundColor="#115E59"
                  onClick={() => updateAppointmentStatus(row.original)}
                >
                  <ToggleOffOutlinedIcon color="#115E59" />
                </IconButton>
              </Tooltip>
            )}
              <Tooltip placement="top" title="Payment Update" arrow enterDelay={100}>
                <IconButton
                  backgroundColor="#115E59"
                  onClick={() => updatePaymentStatus(row.original)}
                >
                  <CurrencyRupeeIcon color="#115E59" />
                </IconButton>
              </Tooltip>
              <Tooltip
                placement="top"
                title="Add Diagnosis"
                arrow
                enterDelay={100}
              >
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
        ),
      },
    ],
    [
  hourlyBookings,
  summary, dashboardData, tabName]
  );


  const columns = useMemo(
    () => [
      {
        accessorKey: "appointment_id", //access nested data with dot notation
        header: "ID",
        size: 100,
      },
      {
        accessorKey: "name",
        header: "Patient Name",
        // size: 150,
      },
      {
        accessorKey: "phone",
        header: "Mobile #",
        size: 150,
        enableSorting: false,
      },

      {
        accessorKey: "doctor",
        header: "Doctor Name",
        size: 150,
        enableSorting: false,
      },
      {
        accessorKey: "time_slot",
        header: "Appointment Time",
        size: 130,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "payment_method",
        header: "Payment Type",
        size: 110,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "paid",
        header: "Payment Type",
        size: 110,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box
            sx={{ display: "flex", width: "100%", justifyContent: "center" }}
          >
            <Tooltip
              placement="top"
              title={row?.original?.paid ? "Paid" : "Not paid"}
              arrow
              enterDelay={100}
            >
              <IconButton backgroundColor="#115E59">
                {row?.original?.paid ? (
                  <FaCheck color="#115E59" />
                ) : (
                  <FcCancel color="#D20A3C" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
      {
        accessorKey: "consultation_fee",
        header: "Fee",
        size: 110,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 120, // Desired width in pixels
        minSize: 100, // Minimum width
        maxSize: 200, // Maximum width
        enableResizing: true, // Optional: allows user to resize
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box
            sx={{ display: "flex", width: "100%", justifyContent: "center" }}
          >
            {!["Completed"].includes(tabName) && (
              <Tooltip placement="top" title="Checkin" arrow enterDelay={100}>
                <IconButton
                  backgroundColor="#115E59"
                  onClick={() => handleCheckinAppoinmentBooking(row.original)}
                >
                  <ToggleOffOutlinedIcon color="#115E59" />
                </IconButton>
              </Tooltip>
            )}
            {!["Scheduled"].includes(tabName) && (
              <Tooltip
                placement="top"
                title="Add Diagnosis"
                arrow
                enterDelay={100}
              >
                <IconButton
                  backgroundColor="#115E59"
                  onClick={() => {
                    if (row.original?.diagnosis_id) {
                      mutationGetDiagnosis.mutate(row.original);
                    setPatientDiagnosis({
                      appointment_id: row.original?.appointment_id,
                      patient_id: row.original?.PatientID,
                      facility_id: row.original?.facility_id,
                      doctor_id: row.original?.doctor_id,
                      ...row.original,
                    });
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
            )}
            {tabName === "Completed" && (
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
            )}
            {tabName === "Scheduled" && (
              <Tooltip placement="top" title="Delete" arrow enterDelay={100}>
                <IconButton
                  color="error"
                  onClick={() => handleDeleleAppoinmentBooking(row.original)}
                >
                  <DeleteForeverIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [tabName, appointmentData]
  );

  const dashboardTableProps = {
    initialState: {
      showGlobalFilter: true,
      showColumnFilters: true,
      columnPinning: {
        right: ["actions"], // built-in ID for actions column
        left: ["token"], // no columns pinned to the left
      },
    },
  };
  const tableProps = {
    initialState: {
      showGlobalFilter: true,
      showColumnFilters: true,
      columnPinning: {
        right: ["actions"], // built-in ID for actions column
        left: ["token", "appointment_id"], // no columns pinned to the left
      },
    },
  };

  // useEffect(() => {
  //   onResetAlert();
  // }, [setIsCheckinOpen, refetchDashBoard, tabName, patient_id]);

  const showLoader =
    mutationDeleteAppointmentBooking?.isPending ||
    isLoading ||
    mutationCheckinAppointmentBooking.isPending ||
    mutationGetDiagnosis?.isPending;

  const renderTopToolbarComponent = () => {
    return (
      <>
        <Stack width="100%" flexDirection="row" alignItems="center">
          <Box width="12vw">
            <DatePickerComponent
              name="date"
              value={endDate}
              required={true}
              showInputLabel={true}
              currentYear={null}
              disableFuture
              // resProps={{ maxDate}}
              // inputProps={{ disableFuture: true }}
              label={"End Date"}
              // helperText={!AppointmentDate && "Date of Birth  is required"}
              sxLabel={{ fontWeight: 600 }}
              onChange={(e) => setEndDate(e.target.value)}
              dateProps={{
                disableFuture: true,
                disablePast: false,
                required: false,
              }}
            />
          </Box>
        </Stack>
      </>
    );
  };

  return (
    <>
      <PageLoader show={showLoader} />
      <AlertSnackbar
        message={showAlert.message}
        showAlert={showAlert.show}
        severity={showAlert.status}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => onResetAlert()}
      />
      <MuiReactTableComponent
        date={appointmentDateFilter}
        setDate={setAppointmentDateFilter}
        data={isDashboard?dashboardData:appointmentData}
        dateLabel="Start Date"
        isDate={isDate}
        dateProps={{
          disableFuture: false,
          disablePast: false,
          required: false,
        }}
        // inputProps={{ disablePast: true, error: !startDate }}
        columns={isDashboard? dashboardColumns : columns}
        tableProps={ isDashboard? dashboardTableProps :tableProps}
        CustomRenderTopToolbar={
          ["Completed"].includes(tabName) && renderTopToolbarComponent
        }
        maxHeight="40vh"
      />
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
