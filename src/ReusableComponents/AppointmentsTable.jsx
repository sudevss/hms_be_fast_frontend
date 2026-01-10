import MuiReactTableComponent from "@/components/Table/MuiReactTableComponent";
import { useEffect, useMemo, useState } from "react";
import { Box, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";

import {
  deleteAppoinmentBooking,
  getAppointmentsAndBookings,
  getPatientDiagnosis,
  postCheckinAppoinmentBooking,
  getAppointmentDetailsById,
  getPatientDetailsById,
  postUpdateAppointmentStatus,
  postUpdatePaymentStatus,
} from "@/serviceApis";

import PageLoader from "@pages/PageLoader";
import AlertSnackbar from "@components/AlertSnackbar";
import DatePickerComponent from "@components/DatePicker";
import AddOrEditPatientDiagnosis from "@/ReusableComponents/AddOrEditPatientDiagnosis";
import AddOrEditBooking from "@/ReusableComponents/AddOrEditBooking";
import PatientReports from "@/ReusableComponents/PatientReports";
import ViewScreen from "@/pages/DoctorDiagnosis/ViewScreen";
import PrescriptionSection from "@pages/DoctorDiagnosis/PrescriptionSection";

import { FaDiagnoses, FaCheck } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { BiSolidReport } from "react-icons/bi";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePatientDiagnosis } from "@/stores/patientStore";
import { useBooking } from "@/stores/bookingStore";
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
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [openingPaymentDialog, setOpeningPaymentDialog] = useState(false);
  const [openDoctorDiagnosisPrompt, setOpenDoctorDiagnosisPrompt] = useState(false);
  const [openDoctorDiagnosis, setOpenDoctorDiagnosis] = useState(false);
  const [openEditBooking, setOpenEditBooking] = useState(false);
  const [editBookingTitle, setEditBookingTitle] = useState("");
  

  const [paymentObj, setPaymentObj] = useState({
    appointment_id: "",
    facility_id: 1,
    payment_status: false,
    payment_method: "",
    payment_comments: "",
    consultation_fee: 0,
    open: false,
  });

  const { setPatientDiagnosis } = usePatientDiagnosis();
  const bookingStore = useBooking();
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

const handleMoveToCompleted = async (row) => {
  if (row.is_paid || row.paid) {
    // User is paid, show confirmation with payment details
    updateAppointmentStatus(row);
  } else {
    // User not paid, show payment dialog
    // If consultation_fee is not available, fetch appointment details first
    if (!row.consultation_fee && !row.doctor_consultation_fee && !row.fee) {
      try {
        const data = await getAppointmentDetailsById({
          appointment_id: row.appointment_id,
          facility_id: row.facility_id,
        });
        
        const normalized = Array.isArray(data) ? data?.[0] : data;
        
        setPendingStatusUpdate(row);
        setPaymentObj({ 
          ...paymentObj, 
          appointment_id: row.appointment_id,
          facility_id: row.facility_id,
          consultation_fee: normalized.consultation_fee || normalized.doctor_consultation_fee || 0,
          payment_comments: row.payment_comments || "",
          open: true 
        });
        return;
      } catch (error) {
        setShowAlert({
          show: true,
          message: "Failed to fetch appointment details",
          status: "error",
        });
        return;
      }
    }
    
    const fee = row.consultation_fee || row.doctor_consultation_fee || row.fee || 0;
    
    setPendingStatusUpdate(row);
    setPaymentObj({ 
      ...paymentObj, 
      appointment_id: row.appointment_id,
      facility_id: row.facility_id,
      consultation_fee: fee,
      payment_comments: row.payment_comments || "",
      open: true 
    });
  }
};

const updatePaymentStatus = async (row) => {
  // If consultation_fee is not available, fetch appointment details first
  if (!row.consultation_fee && !row.doctor_consultation_fee && !row.fee) {
    try {
      const data = await getAppointmentDetailsById({
        appointment_id: row.appointment_id,
        facility_id: row.facility_id,
      });
      
      const normalized = Array.isArray(data) ? data?.[0] : data;
      
      setPaymentObj({
        ...paymentObj,
        appointment_id: normalized.appointment_id,
        facility_id: normalized.facility_id,
        payment_status: normalized.is_paid || normalized.paid || false,
        payment_method: normalized.payment_method || normalized.payment_type || "",
        consultation_fee: normalized.consultation_fee || normalized.doctor_consultation_fee || 0,
        payment_comments: normalized.payment_comments || "",
        open: true
      });
    } catch (error) {
      setShowAlert({
        show: true,
        message: "Failed to fetch appointment details",
        status: "error",
      });
    }
    return;
  }
  
  const fee = row.consultation_fee || row.doctor_consultation_fee || row.fee || 0;
  
  setPaymentObj({ 
    ...paymentObj, 
    appointment_id: row.appointment_id,
    facility_id: row.facility_id,
    payment_status: row.is_paid || row.paid || false,
    payment_method: row.payment_method || row.payment_type || "",
    consultation_fee: fee,
    payment_comments: row.payment_comments || "",
    open: true 
  });
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
      
      // If there's a pending status update, trigger it now
      if (pendingStatusUpdate) {
        updateAppointmentStatus(pendingStatusUpdate);
        setPendingStatusUpdate(null);
      }
      
      setPaymentObj({ appointment_id: "", open: false, payment_comments: "" });
      onResetAlert();
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Payment update failed`,
        status: "error",
      });
      setPendingStatusUpdate(null);
    },
  });

  const handlePaymentSubmit = () =>
    mutationPaymentStatusUpdate.mutate(paymentObj);

  // 🔹 Delete Appointment
  const mutationDelete = useMutation({
    mutationFn: (payload) => deleteAppoinmentBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["queryGetAppointmentsAndBookings"]);
      // Ensure dashboard counts and charts are updated too
      queryClient.invalidateQueries(["dashboard"]);
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
      // Refresh the local appointments query used in this table (useful for check-in dialog)
      refetch?.();
      // Keep the check-in dialog open so user can continue to use it; remove forced close
      // If you prefer to close it automatically, uncomment the next line:
      // setIsCheckinOpen?.(false);
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
  const handleEditBooking = async (row) => {
    try {
      const appt = await getAppointmentDetailsById({
        appointment_id: row.appointment_id,
        facility_id: row.facility_id,
      });
      const normalized = Array.isArray(appt) ? appt?.[0] : appt;
      setEditBookingTitle(String(normalized?.appointment_id || row.appointment_id));
      bookingStore.onReset();
      const apptModeRaw =
        normalized?.appointment_mode || normalized?.AppointmentMode || "";
      const apptModeLabel =
        String(apptModeRaw).toLowerCase() === "walkin" ? "Walk-in" : "Appointment";
      // Appointment meta
      bookingStore.setBookingData({
        doctor_id: normalized?.doctor_id,
        doctorName:
          row?.doctor_name && row?.specialization
            ? `${row.doctor_name} - ${row.specialization}`
            : "",
        facility_id: normalized?.facility_id || 1,
        AppointmentDate: normalized?.appointment_date || normalized?.date || "",
        AppointmentTime: normalized?.time_slot || "",
        AppointmentMode: apptModeLabel,
        payment_status: normalized?.is_paid || normalized?.paid ? 1 : 0,
        payment_method: normalized?.payment_method || normalized?.payment_type || "",
        Reason: normalized?.reason || "",
      });
      // Patient details
      if (normalized?.patient_id) {
        try {
          const patient = await getPatientDetailsById({
            patient_id: normalized.patient_id,
            facility_id: normalized.facility_id || 1,
          });
          const p = Array.isArray(patient) ? patient?.[0] : patient;
          bookingStore.setBookingData({
            firstname: p?.firstname || p?.name || "",
            lastname: p?.lastname || "",
            age: p?.age || "",
            dob: p?.dob || "",
            contact_number: p?.contact_number || p?.phone_number || "",
            address: p?.address || "",
            gender: p?.gender || "",
            email_id: p?.email_id || "",
            ABDM_ABHA_id: p?.ABDM_ABHA_id || "",
          });
          // Re-apply appointment fields to ensure they persist after patient merge
          bookingStore.setBookingData({
            doctor_id: normalized?.doctor_id,
            doctorName:
              row?.doctor_name && row?.specialization
                ? `${row.doctor_name} - ${row.specialization}`
                : bookingStore.doctorName,
            facility_id: normalized?.facility_id || 1,
            AppointmentDate: normalized?.appointment_date || normalized?.date || "",
            AppointmentTime: normalized?.time_slot || "",
            AppointmentMode: apptModeLabel,
            payment_status: normalized?.is_paid || normalized?.paid ? 1 : 0,
            payment_method:
              normalized?.payment_method || normalized?.payment_type || "",
            Reason: normalized?.reason || "",
          });
        } catch {}
      }
      setOpenEditBooking(true);
    } catch (error) {
      setShowAlert({
        show: true,
        message: "Failed to fetch appointment details",
        status: "error",
      });
    }
  };
  const handleReports = (row) => {
    setPatientReportObj({ ...row });
    setOpenReports(true);
  };

  // 🔹 Columns (memoized)
  const columns = useMemo(() => {
    const isReview = (data) => {
      const val = data?.is_review;
      return val === true || val === 1 || val === "1" || val === "true";
    };

    const paymentCell = ({ row }) => (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tooltip
          title={
            isReview(row.original)
              ? "Payment not required"
              : row.original.is_paid || row.original.paid
              ? "Paid"
              : "Not Paid"
          }
          arrow
        >
          <IconButton>
            {isReview(row.original) ||
            row.original.is_paid ||
            row.original.paid ? (
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
              onClick={() => handleMoveToCompleted(row.original)}
            >
              <EditAttributesIcon color="#115E59" />
            </IconButton>
          </Tooltip>
        )}
        {!isReview(row.original) && (
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
        )}
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

        {tabName === "Scheduled" && (
          <Tooltip placement="top" title="Edit" arrow enterDelay={100}>
            <IconButton
              backgroundColor="#115E59"
              onClick={() => handleEditBooking(row.original)}
            >
              <EditOutlinedIcon sx={{ color: "#115E59" }} />
            </IconButton>
          </Tooltip>
        )}

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

        {["Completed"].includes(tabName) && !isReview(row.original) && (
          <>
            <Tooltip
              placement="top"
              title="Payment Update"
              arrow
              enterDelay={100}
            >
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
        <Tooltip placement="top" title="Doctor Diagnosis" arrow enterDelay={100}>
          <IconButton
            backgroundColor="#115E59"
            onClick={() => {
              setSelectedAppointment(row.original);
              setOpenDoctorDiagnosisPrompt(true);
            }}
          >
            <MedicalInformationIcon sx={{ color: "#115E59" }} />
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

    const firstColumn =
      tabName === "Scheduled"
        ? { accessorKey: "appointment_id", header: "APP. ID", size: 100 }
        : {
            accessorKey: "token_id",
            header: "Token ID",
            size: 120,
            Cell: ({ row }) => (
              <span>
                {row.original.token_id ||
                  row.original.TokenID ||
                  row.original.token ||
                  row.original.token_number ||
                  "-"}
              </span>
            ),
          };
    const appointmentColumn = [
      firstColumn,
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
      columnPinning: {
        right: ["actions"],
        left: [tabName === "Scheduled" ? "appointment_id" : "token_id"],
      },
      columnOrder:
        tabName === "Scheduled"
          ? [
              "appointment_id",
              "name",
              "phone",
              "doctor",
              "time_slot",
              "payment_method",
              "paid",
              "consultation_fee",
              "actions",
            ]
          : [
              "token_id",
              "name",
              "phone",
              "doctor",
              "time_slot",
              "payment_method",
              "paid",
              "consultation_fee",
              "actions",
            ],
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
      {["Completed"].includes(tabName) && (
        <Box width="12vw">
          <DatePickerComponent
            name="endDate"
            value={endDate}
            label="End Date"
            onChange={(e) => setEndDate(e.target.value)}
            dateProps={{ disableFuture: true }}
          />
        </Box>
      )}
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
        CustomRenderTopToolbar={renderTopToolbarComponent}
      />
      <Dialog
        open={paymentObj?.open}
        onClose={() => {
          setPaymentObj({ appointment_id: "", open: false, payment_comments: "" });
          setPendingStatusUpdate(null);
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {pendingStatusUpdate ? "Payment Required to Complete" : "Update Payment"}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => {
            setPaymentObj({ appointment_id: "", open: false, payment_comments: "" });
            setPendingStatusUpdate(null);
          }}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          {pendingStatusUpdate && (
            <Typography sx={{ mb: 2, color: "text.secondary" }}>
              Please complete payment before moving this appointment to completed status.
            </Typography>
          )}
          
          <Typography sx={{ mb: 2, fontWeight: 600, fontSize: "1.1rem" }}>
            Consultation Fee: ₹{paymentObj?.consultation_fee || 0}
          </Typography>

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

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Payment Comments"
            value={paymentObj?.payment_comments || ""}
            onChange={(e) =>
              setPaymentObj((prev) => ({
                ...prev,
                payment_comments: e.target.value,
              }))
            }
            sx={{ mt: 2 }}
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

      <Dialog
        open={openDoctorDiagnosisPrompt}
        onClose={() => setOpenDoctorDiagnosisPrompt(false)}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Doctor Diagnosis
        </DialogTitle>

      <DialogContent>
        <Typography>
          Doctor Diagnosis screen will be opened. Click on continue to proceed.
        </Typography>
      </DialogContent>

      <DialogActions>
        <StyledButton
          variant="outlined"
          onClick={() => setOpenDoctorDiagnosisPrompt(false)}
        >
          Cancel
        </StyledButton>

        <StyledButton
          variant="contained"
          onClick={() => {
          setOpenDoctorDiagnosisPrompt(false);
          setOpenDoctorDiagnosis(true);
          }}
        >
          Continue
        </StyledButton>
      </DialogActions>
    </Dialog>

    {/* 🔹 NEW — Fullscreen Doctor Diagnosis Dialog */}
    <ViewScreen
      open={openDoctorDiagnosis}
      onClose={() => setOpenDoctorDiagnosis(false)}
      appointment={selectedAppointment}
    />
    {openEditBooking && (
      <AddOrEditBooking
        open={openEditBooking}
        setOpen={setOpenEditBooking}
        title={editBookingTitle}
        appointmentId={editBookingTitle}
        isEdit={true}
      />
    )}
    </>
  );
};

export default AppointmentsTable;
