import MuiReactTableComponent from "@/components/Table/MuiReactTableComponent";
import { useEffect, useMemo, useState } from "react";
import { Box, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Stack, TextField, Tooltip, Typography, Alert, Divider, CircularProgress } from "@mui/material";

import {
  deleteAppoinmentBooking,
  getAppointmentsAndBookings,
  getPatientDiagnosis,
  postCheckinAppoinmentBooking,
  getAppointmentDetailsById,
  getPatientDetailsById,
  postUpdateAppointmentStatus,
  postRecordPayment,
  getPaymentSummary,
} from "@/serviceApis";
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableRow, TableHead } from "@mui/material";

import PageLoader from "@pages/PageLoader";
import AlertSnackbar from "@components/AlertSnackbar";
import DatePickerComponent from "@components/DatePicker";
import AddOrEditPatientDiagnosis from "@/ReusableComponents/AddOrEditPatientDiagnosis";
import AddOrEditBooking from "@/ReusableComponents/AddOrEditBooking";
import PatientReports from "@/ReusableComponents/PatientReports";
import ViewScreen from "@/pages/DoctorDiagnosis/ViewScreen";
import PrescriptionSection from "@pages/DoctorDiagnosis/PrescriptionSection";

import { FaDiagnoses, FaCheck, FaHourglassHalf } from "react-icons/fa";
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
import { printPaymentSummaryBill } from "@/ReusableComponents/PaymentPrintUtils";



// 🔹 Helper function to check if appointment is a review
const isReview = (data) => {
  const raw =
    data?.is_review ??
    data?.isReview ??
    data?.IsReview ??
    data?.review ??
    data?.Review;
  const val = String(raw).toLowerCase();
  return (
    raw === true ||
    raw === 1 ||
    raw === "1" ||
    val === "true" ||
    val === "y" ||
    val === "yes" ||
    val === "review"
  );
};

const RupeeOffIcon = ({ size = 24 }) => (
  <Box sx={{ position: "relative", width: size, height: size }}>
    <CurrencyRupeeIcon sx={{ color: "#9CA3AF", fontSize: size }} />
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size * 0.9,
        height: 2,
        bgcolor: "#EF4444",
        transform: "translate(-50%, -50%) rotate(-45deg)",
        borderRadius: 1,
      }}
    />
  </Box>
);

const getTokenIdentifiersFromRow = (row) => {
  const source = row?.original || row || {};
  const token_number =
    source.token ||
    source.token_number ||
    source.token_id ||
    source.TokenID ||
    source.tokenNo ||
    source.TokenNo ||
    source.TokenNumber ||
    null;

  const token_date =
    source.token_date ||
    source.date ||
    source.appointment_date ||
    source.appointmentDate ||
    null;

  return { token_number, token_date };
};

const PaymentStatusCell = ({ row, isDashboardRow }) => {
  const { token_number, token_date } = getTokenIdentifiersFromRow(row);

  const baseReview = isReview(row.original);
  const hasApptIds =
    !!row.original.appointment_id && !!row.original.facility_id;

  const { data: apptDetails } = useQuery({
    queryKey: [
      "paymentReviewMeta",
      row.original.appointment_id,
      row.original.facility_id,
    ],
    queryFn: () =>
      getAppointmentDetailsById({
        appointment_id: row.original.appointment_id,
        facility_id: row.original.facility_id,
      }),
    enabled: isDashboardRow && !baseReview && hasApptIds,
    staleTime: 30000,
  });

  const normalizedAppt = Array.isArray(apptDetails)
    ? apptDetails?.[0]
    : apptDetails;

  const isReviewAppt = baseReview || isReview(normalizedAppt || row.original);

  const { data: paymentSummary, isLoading } = useQuery({
    queryKey: ["paymentSummaryStatus", token_number, token_date],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, Math.random() * 5000));
      return getPaymentSummary({ token_number, token_date });
    },
    enabled: !!token_number && !!token_date && !isReviewAppt,
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
    retryDelay: 3000,
  });

  if (isReviewAppt) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tooltip title="Payment not required" arrow>
          <IconButton>
            <RupeeOffIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  if (isLoading && token_number && token_date) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress size={20} sx={{ color: "#115E59" }} />
      </Box>
    );
  }

    // Determine status
  // Default fallback to row data if no summary
  let status = "unpaid";
  const isPaidFallback = row.original.is_paid || row.original.paid;

  if (paymentSummary) {
    if (parseFloat(paymentSummary.total_pending || 0) === 0) {
      status = "paid";
    } else if (parseFloat(paymentSummary.total_paid || 0) === 0) {
      status = "unpaid";
    } else {
      status = "partial";
    }
  } else {
    status = isPaidFallback ? "paid" : "unpaid";
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Tooltip
        title={
          status === "paid"
            ? "Paid"
            : status === "partial"
            ? "Partial"
            : "Not Paid"
        }
        arrow
      >
        <IconButton>
          {status === "paid" ? (
            <FaCheck color="#115E59" />
          ) : status === "partial" ? (
            <FaHourglassHalf color="#F59E0B" />
          ) : (
            <FcCancel />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const PaymentTypeCell = ({ row, isDashboardRow }) => {
  const baseReview = isReview(row.original);
  const hasApptIds =
    !!row.original.appointment_id && !!row.original.facility_id;

  const { data: apptDetails } = useQuery({
    queryKey: [
      "paymentReviewMeta",
      row.original.appointment_id,
      row.original.facility_id,
    ],
    queryFn: () =>
      getAppointmentDetailsById({
        appointment_id: row.original.appointment_id,
        facility_id: row.original.facility_id,
      }),
    enabled: isDashboardRow && !baseReview && hasApptIds,
    staleTime: 30000,
  });

  const normalizedAppt = Array.isArray(apptDetails)
    ? apptDetails?.[0]
    : apptDetails;

  const isReviewAppt = baseReview || isReview(normalizedAppt || row.original);

  const label = isReviewAppt ? "Review" : row.original.payment_type;

  return <>{label || "-"}</>;
};

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
  const [openDoctorDiagnosis, setOpenDoctorDiagnosis] = useState(false);
  const [openEditBooking, setOpenEditBooking] = useState(false);
  const [editBookingTitle, setEditBookingTitle] = useState("");
  

  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const [paymentObj, setPaymentObj] = useState({
    appointment_id: "",
    facility_id: 1,
    diagnosis_id: "",
    token_number: "",
    token_date: "",
    payment_status: false,
    payment_method: "",
    payment_comments: "",
    
    consultation_fee: 0,
    consultation_paid_amount: 0,
    consultation_pending: 0,
    
    lab_fee: 0,
    lab_paid_amount: 0,
    lab_pending: 0,
    
    pharmacy_fee: 0,
    pharmacy_paid_amount: 0,
    pharmacy_pending: 0,
    
    procedure_fee: 0,
    procedure_paid_amount: 0,
    procedure_pending: 0,
    
    total_amount: 0,
    total_paid: 0,
    total_pending: 0,

    consultation_paid: false,
    lab_paid: false,
    pharmacy_paid: false,
    procedure_paid: false,
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


  
  const PaymentUpdateAction = ({ row }) => {
    const { data } = useQuery({
      queryKey: ["apptDetailsForPayment", row?.appointment_id, row?.facility_id],
      queryFn: () =>
        getAppointmentDetailsById({
          appointment_id: row.appointment_id,
          facility_id: row.facility_id,
        }),
      enabled: Boolean(row?.appointment_id && row?.facility_id),
      staleTime: 30000,
    });
    const normalized = Array.isArray(data) ? data?.[0] : data;
    const review = isReview(normalized || row);
    if (review) return null;
    return (
      <Tooltip placement="top" title="Payment Update" arrow enterDelay={100}>
        <IconButton
          color="#115E59"
          onClick={() => {
            updatePaymentStatus(row);
          }}
        >
          <CurrencyRupeeIcon color="#115E59" />
        </IconButton>
      </Tooltip>
    );
  };
  


  const handleMoveToCompleted = async (row) => {
    // 🔹 Check if it's a review appointment - skip payment entirely
    if (isReview(row)) {
      updateAppointmentStatus(row);
      return;
    }

    // 🔹 Fetch fresh details to confirm review status (especially for Dashboard data)
    setIsFetchingDetails(true);
    try {
      const data = await getAppointmentDetailsById({
        appointment_id: row.appointment_id,
        facility_id: row.facility_id,
      });
      const normalized = Array.isArray(data) ? data?.[0] : data;

      // Check again with fresh data
      if (isReview(normalized)) {
        updateAppointmentStatus(row);
        setIsFetchingDetails(false);
        return;
      }

      if (normalized.is_paid || normalized.paid || row.is_paid || row.paid) {
        // User is paid, show confirmation with payment details
        updateAppointmentStatus(row);
      } else {
        // User not paid, show payment dialog
        
        const { token_number, token_date } = getTokenIdentifiersFromRow(normalized || row);
        
        // Restore fallback fee from appointment data
        const appointmentFee = normalized.consultation_fee || normalized.doctor_consultation_fee || row.consultation_fee || row.doctor_consultation_fee || row.fee || 0;

        let summary = {
          consultation_fee: 0, consultation_paid: 0, consultation_pending: 0,
          lab_total: 0, lab_paid: 0, lab_pending: 0,
          pharmacy_total: 0, pharmacy_paid: 0, pharmacy_pending: 0,
          procedure_total: 0, procedure_paid: 0, procedure_pending: 0,
          total_amount: 0, total_paid: 0, total_pending: 0
        };

        if (token_number && token_date) {
           let attempts = 0;
           let success = false;
           
           while (attempts < 3 && !success) {
              try {
                  const data = await getPaymentSummary({ token_number, token_date });
                  if (data) {
                      summary = { ...summary, ...data };
                      success = true;
                  }
              } catch (e) {
                  console.error(`Error fetching payment summary (Attempt ${attempts + 1})`, e);
                  attempts++;
                  if (attempts < 3) await new Promise(r => setTimeout(r, 1000));
              }
           }

           if (!success) {
              console.error("Failed to fetch payment summary in move to completed");
              setShowAlert({
                  show: true,
                  message: "Could not fetch payment details. Please try again.",
                  status: "warning",
              });
              setIsFetchingDetails(false);
              return;
           }
        }

        // Apply fallback if API didn't return consultation fee
        if (summary.consultation_fee === 0 && appointmentFee > 0) {
            summary.consultation_fee = appointmentFee;
            // If API returned 0 fee, it likely tracked 0 pending. Recalculate pending.
            summary.consultation_pending = appointmentFee - summary.consultation_paid;
        }

        setPendingStatusUpdate(row);
        setPaymentObj({ 
          ...paymentObj, 
          appointment_id: row.appointment_id,
          facility_id: row.facility_id,
          token_number,
          token_date,
          
          consultation_fee: summary.consultation_fee,
          consultation_paid_amount: summary.consultation_paid,
          consultation_pending: summary.consultation_pending,
          
          lab_fee: summary.lab_total,
          lab_paid_amount: summary.lab_paid,
          lab_pending: summary.lab_pending,
          
          pharmacy_fee: summary.pharmacy_total,
          pharmacy_paid_amount: summary.pharmacy_paid,
          pharmacy_pending: summary.pharmacy_pending,
          
          procedure_fee: summary.procedure_total,
          procedure_paid_amount: summary.procedure_paid,
          procedure_pending: summary.procedure_pending,
          
          total_amount: summary.total_amount,
          total_paid: summary.total_paid,
          total_pending: summary.total_pending,
          
          // Auto-select pending items for payment
          consultation_paid: false,
          lab_paid: false,
          pharmacy_paid: false,
          procedure_paid: false,
          
          payment_status: true,
          payment_method: normalized.payment_method || "",
          payment_comments: row.payment_comments || "",
          open: true 
        });
      }
    } catch (error) {
      console.error(error);
      setShowAlert({
        show: true,
        message: "Failed to fetch appointment details",
        status: "error",
      });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const updatePaymentStatus = async (row) => {
    // 🔹 Prevent payment updates for review appointments
    if (isReview(row)) {
      setShowAlert({
        show: true,
        message: "Payment is not required for review appointments",
        status: "info",
      });
      return;
    }
    
    // 🔹 Fetch fresh details to confirm review status before opening payment dialog
    setIsFetchingDetails(true);
    try {
      const data = await getAppointmentDetailsById({
        appointment_id: row.appointment_id,
        facility_id: row.facility_id,
      });
      const normalized = Array.isArray(data) ? data?.[0] : data;
      
      // If backend indicates review, do not open payment
      if (isReview(normalized)) {
        setShowAlert({
          show: true,
          message: "Payment is not required for review appointments",
          status: "info",
        });
        setIsFetchingDetails(false);
        return;
      }

      const { token_number, token_date } = getTokenIdentifiersFromRow(normalized || row);
      
      // Restore fallback fee from appointment data
      const appointmentFee = normalized.consultation_fee || normalized.doctor_consultation_fee || row.consultation_fee || row.doctor_consultation_fee || row.fee || 0;

      let summary = {
          consultation_fee: 0, consultation_paid: 0, consultation_pending: 0,
          lab_total: 0, lab_paid: 0, lab_pending: 0,
          pharmacy_total: 0, pharmacy_paid: 0, pharmacy_pending: 0,
          procedure_total: 0, procedure_paid: 0, procedure_pending: 0,
          total_amount: 0, total_paid: 0, total_pending: 0
      };

      if (token_number && token_date) {
         let attempts = 0;
         let success = false;
         
         while (attempts < 3 && !success) {
            try {
                // Fetch payment summary from API
                const data = await getPaymentSummary({ token_number, token_date });
                if (data) {
                    summary = { ...summary, ...data };
                    success = true;
                }
            } catch (e) {
                console.error(`Error fetching payment summary (Attempt ${attempts + 1})`, e);
                attempts++;
                if (attempts < 3) {
                    await new Promise(r => setTimeout(r, 1000)); // Wait 1 second before retry
                }
            }
         }

         if (!success) {
            console.error("Failed to fetch payment summary after retries");
            setShowAlert({
                show: true,
                message: "Could not fetch latest payment details. Please try again.",
                status: "warning",
            });
            setIsFetchingDetails(false);
            return; // Stop here to prevent showing partial/wrong data
         }
      }

      // Apply fallback if API didn't return consultation fee
      if (summary.consultation_fee === 0 && appointmentFee > 0) {
          summary.consultation_fee = appointmentFee;
          // If API returned 0 fee, it likely tracked 0 pending. Recalculate pending.
          summary.consultation_pending = appointmentFee - summary.consultation_paid;
      }
      
      const isPaid = normalized.is_paid || normalized.paid || row.is_paid || row.paid || false;

      setPaymentObj({
        ...paymentObj,
        appointment_id: normalized.appointment_id || row.appointment_id,
        facility_id: normalized.facility_id || row.facility_id,
        token_number,
        token_date,
        patient_name: normalized.patient_name || row.patient_name || normalized.name || row.name || "",
        
        consultation_fee: summary.consultation_fee,
        consultation_paid_amount: summary.consultation_paid,
        consultation_pending: summary.consultation_pending,
        
        lab_fee: summary.lab_total,
        lab_paid_amount: summary.lab_paid,
        lab_pending: summary.lab_pending,
        
        pharmacy_fee: summary.pharmacy_total,
        pharmacy_paid_amount: summary.pharmacy_paid,
        pharmacy_pending: summary.pharmacy_pending,
        
        procedure_fee: summary.procedure_total,
        procedure_paid_amount: summary.procedure_paid,
        procedure_pending: summary.procedure_pending,
        
        total_amount: summary.total_amount,
        total_paid: summary.total_paid,
        total_pending: summary.total_pending,
        
        // Auto-select pending items for payment
        consultation_paid: false,
        lab_paid: false,
        pharmacy_paid: false,
        procedure_paid: false,
        
        payment_status: true,
        payment_method: normalized.payment_method || normalized.payment_type || row.payment_method || row.payment_type || "",
        payment_comments: normalized.payment_comments || row.payment_comments || "",
        open: true,
      });
    } catch (error) {
      setShowAlert({
        show: true,
        message: "Failed to fetch appointment details",
        status: "error",
      });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const mutationPaymentStatusUpdate = useMutation({
    mutationFn: async (data) => {
        const { token_number, token_date, facility_id, payment_method, payment_comments } = data;
        const commonPayload = { token_number, token_date, facility_id, payment_method, payment_comments };
        
        // --- OLD CODE START (Parallel Execution) ---
        // const payments = [];
        // if (data.consultation_paid && data.consultation_pending > 0) {
        //     payments.push(postRecordPayment({ ...commonPayload, payment_type: "consultation", amount_paid: parseFloat(data.consultation_pending) }));
        // }
        // if (data.lab_paid && data.lab_pending > 0) {
        //     payments.push(postRecordPayment({ ...commonPayload, payment_type: "lab", amount_paid: parseFloat(data.lab_pending) }));
        // }
        // if (data.pharmacy_paid && data.pharmacy_pending > 0) {
        //     payments.push(postRecordPayment({ ...commonPayload, payment_type: "pharmacy", amount_paid: parseFloat(data.pharmacy_pending) }));
        // }
        // if (data.procedure_paid && data.procedure_pending > 0) {
        //     payments.push(postRecordPayment({ ...commonPayload, payment_type: "procedure", amount_paid: parseFloat(data.procedure_pending) }));
        // }
        // if (payments.length === 0) throw new Error("No payment selected");
        // return Promise.all(payments);
        // --- OLD CODE END ---

        const paymentActions = [];

        if (data.consultation_paid && data.consultation_pending > 0) {
            paymentActions.push(() => postRecordPayment({ ...commonPayload, payment_type: "consultation", amount_paid: parseFloat(data.consultation_pending) }));
        }
        if (data.lab_paid && data.lab_pending > 0) {
            paymentActions.push(() => postRecordPayment({ ...commonPayload, payment_type: "lab", amount_paid: parseFloat(data.lab_pending) }));
        }
        if (data.pharmacy_paid && data.pharmacy_pending > 0) {
            paymentActions.push(() => postRecordPayment({ ...commonPayload, payment_type: "pharmacy", amount_paid: parseFloat(data.pharmacy_pending) }));
        }
        if (data.procedure_paid && data.procedure_pending > 0) {
            paymentActions.push(() => postRecordPayment({ ...commonPayload, payment_type: "procedure", amount_paid: parseFloat(data.procedure_pending) }));
        }

        if (paymentActions.length === 0) throw new Error("No payment selected");
        
        const results = [];
        const errors = [];

        for (const action of paymentActions) {
            try {
                const res = await action();
                results.push(res);
            } catch (err) {
                console.error("Payment action failed", err);
                errors.push(err);
            }
        }

        if (errors.length > 0 && results.length === 0) {
            throw errors[0]; // All failed
        }

        return { results, errors };
    },
    // --- OLD onSuccess START ---
    // onSuccess: () => {
    //   setShowAlert({
    //     show: true,
    //     message: `Payment updated successfully`,
    //     status: "success",
    //   });
    //   queryClient.invalidateQueries(["dashboard"]);
    //   if (pendingStatusUpdate) {
    //     updateAppointmentStatus(pendingStatusUpdate);
    //     setPendingStatusUpdate(null);
    //   }
    //   setPaymentObj({ appointment_id: "", open: false, payment_comments: "" });
    //   onResetAlert();
    // },
    // --- OLD onSuccess END ---
    onSuccess: (data, variables) => {
      const { errors } = data;
      const isPartialSuccess = errors && errors.length > 0;

      if (isPartialSuccess) {
          setShowAlert({
            show: true,
            message: `Some payments failed. Please check pending amounts.`,
            status: "warning",
          });
      } else {
          setShowAlert({
            show: true,
            message: `Payment updated successfully`,
            status: "success",
          });

          // --- Manual Cache Update for Instant Feedback ---
          if (variables?.token_number && variables?.token_date) {
              queryClient.setQueryData(["paymentSummaryStatus", variables.token_number, variables.token_date], (oldSummary) => {
                   if (!oldSummary) return undefined; // Let refetch handle it if no cache
                   
                   const newSummary = { ...oldSummary };
                   let totalPaidNow = 0;

                   // Helper to update specific field
                   const updateField = (type) => {
                       if (variables[`${type}_paid`]) {
                           const pending = parseFloat(variables[`${type}_pending`] || 0);
                           if (pending > 0) {
                               newSummary[`${type}_pending`] = 0;
                               newSummary[`${type}_paid`] = (parseFloat(newSummary[`${type}_paid`] || 0)) + pending;
                               totalPaidNow += pending;
                           }
                       }
                   };

                   updateField("consultation");
                   updateField("lab");
                   updateField("pharmacy");
                   updateField("procedure");
                   
                   newSummary.total_pending = Math.max(0, (parseFloat(newSummary.total_pending) || 0) - totalPaidNow);
                   newSummary.total_paid = (parseFloat(newSummary.total_paid) || 0) + totalPaidNow;
                   
                   return newSummary;
              });
          }
      }

      queryClient.invalidateQueries(["dashboard"]);
      queryClient.invalidateQueries(["queryGetAppointmentsAndBookings"]);
      
      if (variables?.token_number && variables?.token_date) {
          queryClient.invalidateQueries(["paymentSummaryStatus", variables.token_number, variables.token_date]);
      } else {
          queryClient.invalidateQueries(["paymentSummaryStatus"]);
      }
      
      // If there's a pending status update, trigger it now ONLY if no errors
      if (pendingStatusUpdate && !isPartialSuccess) {
        updateAppointmentStatus(pendingStatusUpdate);
        setPendingStatusUpdate(null);
        setPaymentObj({ appointment_id: "", open: false, payment_comments: "" });
      } else if (!isPartialSuccess) {
        // Only close if all successful
        setPaymentObj({ appointment_id: "", open: false, payment_comments: "" });
      }
      
      onResetAlert();
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Payment update failed`,
        status: "error",
      });
      // Do not clear pendingStatusUpdate so user can try again
    },
  });

  const handlePaymentSubmit = () => {
    const hasPaymentSelected = 
        (paymentObj.consultation_paid && parseFloat(paymentObj.consultation_pending || 0) > 0) ||
        (paymentObj.lab_paid && parseFloat(paymentObj.lab_pending || 0) > 0) ||
        (paymentObj.pharmacy_paid && parseFloat(paymentObj.pharmacy_pending || 0) > 0) ||
        (paymentObj.procedure_paid && parseFloat(paymentObj.procedure_pending || 0) > 0);

    if (!hasPaymentSelected) {
        if (pendingStatusUpdate) {
            // User chose to complete without paying
            updateAppointmentStatus(pendingStatusUpdate);
            setPendingStatusUpdate(null);
            setPaymentObj(prev => ({ ...prev, open: false }));
        } else {
             // Just closing without payment
             setPaymentObj(prev => ({ ...prev, open: false }));
        }
        return;
    }

    mutationPaymentStatusUpdate.mutate(paymentObj);
  };

  const handlePrintSummaryBill = () => {
    printPaymentSummaryBill({ paymentObj, setShowAlert });
  };

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
        is_review: isReview(normalized),
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
            is_review: isReview(normalized),
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
    const paymentCell = ({ row }) => (
      <PaymentStatusCell row={row} isDashboardRow={isDashboard} />
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
        <PaymentUpdateAction row={row.original} />
        <Tooltip placement="top" title="Add Diagnosis" arrow enterDelay={100}>
          <IconButton
            backgroundColor="#115E59"
            onClick={() => {
              // if (row.original?.diagnosis_id) {
              //   mutationGetDiagnosis.mutate(row.original);
              // }

              // setPatientDiagnosis({
              //   appointment_id: row.original?.appointment_id,
              //   patient_id: row.original?.PatientID,
              //   facility_id: row.original?.facility_id,
              //   doctor_id: row.original?.doctor_id,
              //   ...row.original,
              // });
              // setOpenDiagnosis(true);
              handleDiagnosis(row.original);
            }}
          >
            <FaDiagnoses color="#115E59" />
          </IconButton>
        </Tooltip>
        {row.original.checkin_time && (
          <Tooltip placement="top" title="Doctor Diagnosis" arrow enterDelay={100}>
            <IconButton
              backgroundColor="#115E59"
              onClick={() => {
                setSelectedAppointment(row.original);
                setOpenDoctorDiagnosis(true);
              }}
            >
              <MedicalInformationIcon sx={{ color: "#115E59" }} />
            </IconButton>
          </Tooltip>
        )}
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
            setOpenDoctorDiagnosis(true);
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
      {
        accessorKey: "payment_type",
        header: "Payment Type",
        Cell: ({ row }) => (
          <PaymentTypeCell row={row} isDashboardRow={isDashboard} />
        ),
      },
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
      {
        accessorKey: "payment_method",
        header: "Payment Type",
        size: 110,
        Cell: ({ row }) =>
          isReview(row.original) ? "Review" : row.original.payment_method,
      },
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
    mutationPaymentStatusUpdate.isPending ||
    isFetchingDetails;

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
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, overflow: "hidden" },
        }}
      >
        <Box sx={{ bgcolor: "#115E59", p: 2, display: "flex", alignItems: "center", position: "relative" }}>
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600, flex: 1, textAlign: "center" }}>
            {pendingStatusUpdate ? "Payment Required" : "Update Payment"}
          </Typography>
          <IconButton
            onClick={() => {
              setPaymentObj({ appointment_id: "", open: false, payment_comments: "" });
              setPendingStatusUpdate(null);
            }}
            sx={{ color: "white", position: "absolute", right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          {pendingStatusUpdate && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please complete payment before moving this appointment to completed status.
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mb: 3, justifyContent: "center" }}>
             <Grid item xs={5}>
                <Paper sx={{ p: 2, bgcolor: '#ecfdf5', border: '1px solid #d1fae5', textAlign: 'center' }} elevation={0}>
                    <Typography variant="subtitle2" sx={{ color: '#047857', fontWeight: 'bold' }}>TOTAL PAID</Typography>
                    <Typography variant="h6" sx={{ color: '#047857', fontWeight: 'bold' }}>
                        ₹{(
                            (paymentObj?.consultation_paid ? parseFloat(paymentObj?.consultation_pending || 0) : 0) + parseFloat(paymentObj?.consultation_paid_amount || 0) +
                            (paymentObj?.lab_paid ? parseFloat(paymentObj?.lab_pending || 0) : 0) + parseFloat(paymentObj?.lab_paid_amount || 0) +
                            (paymentObj?.pharmacy_paid ? parseFloat(paymentObj?.pharmacy_pending || 0) : 0) + parseFloat(paymentObj?.pharmacy_paid_amount || 0) +
                            (paymentObj?.procedure_paid ? parseFloat(paymentObj?.procedure_pending || 0) : 0) + parseFloat(paymentObj?.procedure_paid_amount || 0)
                        ).toFixed(2)}
                    </Typography>
                </Paper>
             </Grid>
             <Grid item xs={5}>
                <Paper sx={{ p: 2, bgcolor: '#fef2f2', border: '1px solid #fee2e2', textAlign: 'center' }} elevation={0}>
                    <Typography variant="subtitle2" sx={{ color: '#b91c1c', fontWeight: 'bold' }}>TOTAL PENDING</Typography>
                    <Typography variant="h6" sx={{ color: '#b91c1c', fontWeight: 'bold' }}>
                        ₹{(
                            (!paymentObj?.consultation_paid ? parseFloat(paymentObj?.consultation_pending || 0) : 0) +
                            (!paymentObj?.lab_paid ? parseFloat(paymentObj?.lab_pending || 0) : 0) +
                            (!paymentObj?.pharmacy_paid ? parseFloat(paymentObj?.pharmacy_pending || 0) : 0) +
                            (!paymentObj?.procedure_paid ? parseFloat(paymentObj?.procedure_pending || 0) : 0)
                        ).toFixed(2)}
                    </Typography>
                </Paper>
             </Grid>
          </Grid>

          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, mb: 2 }}>
            <Table size="small">
                <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                    <TableRow>
                        <TableCell padding="checkbox" sx={{ fontWeight: 600 }} align="center">Pay</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Description</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell padding="checkbox" align="center">
                            <Checkbox
                                checked={paymentObj?.consultation_paid || parseFloat(paymentObj?.consultation_pending || 0) <= 0}
                                disabled={parseFloat(paymentObj?.consultation_pending || 0) <= 0}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setPaymentObj(prev => ({
                                        ...prev,
                                        consultation_paid: checked,
                                    }));
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary" }} align="center">
                            Consultation Fee
                            {parseFloat(paymentObj?.consultation_pending || 0) > 0 && (
                                <Typography variant="caption" display="block" color="error">
                                    Pending: ₹{parseFloat(paymentObj?.consultation_pending).toFixed(2)}
                                </Typography>
                            )}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>₹{parseFloat(paymentObj?.consultation_fee || 0).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell padding="checkbox" align="center">
                            <Checkbox
                                checked={paymentObj?.lab_paid || parseFloat(paymentObj?.lab_pending || 0) <= 0}
                                disabled={parseFloat(paymentObj?.lab_pending || 0) <= 0}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setPaymentObj(prev => ({
                                        ...prev,
                                        lab_paid: checked,
                                    }));
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary" }} align="center">
                            Lab Fee
                            {parseFloat(paymentObj?.lab_pending || 0) > 0 && (
                                <Typography variant="caption" display="block" color="error">
                                    Pending: ₹{parseFloat(paymentObj?.lab_pending).toFixed(2)}
                                </Typography>
                            )}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>₹{parseFloat(paymentObj?.lab_fee || 0).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell padding="checkbox" align="center">
                            <Checkbox
                                checked={paymentObj?.pharmacy_paid || parseFloat(paymentObj?.pharmacy_pending || 0) <= 0}
                                disabled={parseFloat(paymentObj?.pharmacy_pending || 0) <= 0}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setPaymentObj(prev => ({
                                        ...prev,
                                        pharmacy_paid: checked,
                                    }));
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary" }} align="center">
                            Pharmacy Fee
                            {parseFloat(paymentObj?.pharmacy_pending || 0) > 0 && (
                                <Typography variant="caption" display="block" color="error">
                                    Pending: ₹{parseFloat(paymentObj?.pharmacy_pending).toFixed(2)}
                                </Typography>
                            )}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>₹{parseFloat(paymentObj?.pharmacy_fee || 0).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell padding="checkbox" align="center">
                            <Checkbox
                                checked={paymentObj?.procedure_paid || parseFloat(paymentObj?.procedure_pending || 0) <= 0}
                                disabled={parseFloat(paymentObj?.procedure_pending || 0) <= 0}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setPaymentObj(prev => ({
                                        ...prev,
                                        procedure_paid: checked,
                                    }));
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary" }} align="center">
                            Procedure Fee
                            {parseFloat(paymentObj?.procedure_pending || 0) > 0 && (
                                <Typography variant="caption" display="block" color="error">
                                    Pending: ₹{parseFloat(paymentObj?.procedure_pending).toFixed(2)}
                                </Typography>
                            )}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>₹{parseFloat(paymentObj?.procedure_fee || 0).toFixed(2)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  color="success"
                  checked={
                      (parseFloat(paymentObj?.consultation_pending || 0) <= 0 || paymentObj?.consultation_paid) &&
                      (parseFloat(paymentObj?.lab_pending || 0) <= 0 || paymentObj?.lab_paid) &&
                      (parseFloat(paymentObj?.pharmacy_pending || 0) <= 0 || paymentObj?.pharmacy_paid) &&
                      (parseFloat(paymentObj?.procedure_pending || 0) <= 0 || paymentObj?.procedure_paid)
                  }
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setPaymentObj((prev) => ({
                      ...prev,
                      consultation_paid: checked && parseFloat(prev.consultation_pending || 0) > 0,
                      lab_paid: checked && parseFloat(prev.lab_pending || 0) > 0,
                      pharmacy_paid: checked && parseFloat(prev.pharmacy_pending || 0) > 0,
                      procedure_paid: checked && parseFloat(prev.procedure_pending || 0) > 0,
                    }))
                  }}
                />
              }
              label={<Typography variant="body2" fontWeight={600}>Pay All Pending</Typography>}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Comments (Optional)"
                  placeholder="Add payment notes..."
                  value={paymentObj?.payment_comments || ""}
                  onChange={(e) =>
                    setPaymentObj((prev) => ({
                      ...prev,
                      payment_comments: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2, gap: 2 }}>
          <StyledButton variant="outlined" onClick={handlePrintSummaryBill}>
            Print Summary Bill
          </StyledButton>
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
