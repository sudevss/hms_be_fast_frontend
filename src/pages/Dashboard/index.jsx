import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "@/pages/Layout/SideBar";
import MuiReactTableComponent from "@/components/Table/MuiReactTableComponent";
// import AddBoking from "../../AppReusbleComponents/AddBoking";
import EnhancedPieChart from "@components/Charts/EnhancedPieChart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDashBoardDetails,
  postCheckinPayment,
  postUpdateAppointmentStatus,
  postUpdatePaymentStatus,
} from "../../serviceApis";
import DoctorsSection from "./DoctersSection";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useMemo } from "react";

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import EnhancedStackedBarChart from "@components/Charts/EnhancedStackedBarChart";
import StyledButton from "@components/StyledButton";
import AddOrEditBooking from "@/ReusableComponents/AddOrEditBooking";
import PageLoader from "@pages/PageLoader";
import AppointmentsTable from "@/ReusableComponents/AppointmentsTable";
import SelectWithLabel from "@components/Inputs/SelectWithLabel";
import { INITIAL_SHOW_ALERT, PAYMENT_METHODS } from "@data/staticData";
import AlertSnackbar from "@components/AlertSnackbar";
import { FaCheck } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { useShowAlert } from "@/stores/showAlertStore";

function DashboardPage() {
  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();
  const queryClient = useQueryClient();

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const initialStatePayment = {
    appointment_id: "",
    facility_id: 1,
    payment_status: false,
    payment_method: "",
    isOpen: false,
  };
  const [paymentObj, setPaymentObj] = useState({ ...initialStatePayment });
  const { date, setDate, doctor_id, doctorSearch } = useDashboardStore();

  const [showBookingModal, setShowBookingModal] = useState(false); // Add state for doctor dropdown visibility

  const queryGetDashboard = useQuery({
    queryKey: ["dashboard", doctor_id, date, doctor_id],
    queryFn: () =>
      getDashBoardDetails({ date: date, facility_id: 1, doctor_id: doctor_id }),
    enabled: true,
  });

  const getDateColor = (date) => {
    if (!date) return "bg-white";
    const dateStr = date.toISOString().split("T")[0];
    const count = 0;
    if (count === 0) return "bg-white";
    if (count < 10) return "bg-teal-100";
    if (count < 20) return "bg-teal-200";
    if (count < 30) return "bg-teal-300";
    return "bg-teal-400";
  };

  const {
    token_data: tokenData = [],
    doctors = [],
    hourly_booking_chart: hourlyBookings = [],
    summary = {},
  } = queryGetDashboard?.data || {};

  // Filter doctors based on search input
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const appointmentSummary = [
    {
      name: "Total Appointments",
      value: summary?.total_appointments || 0,
    },
    {
      name: "Total Check-ins",
      value: summary?.total_checkin || 0,
    },
    {
      name: "Available Slots",
      value: summary?.available_slots || 0,
    },
    {
      name: "Total Walk-in Patients",
      value: summary?.total_walkin_patients || 0,
    },
  ];
  const minDate = dayjs().subtract(1, "day").toDate();
  const maxDate = dayjs().add(7, "day").toDate();

  const mutationAppoinmentStatusUpdate = useMutation({
    mutationFn: (payload) => postUpdateAppointmentStatus({ ...payload, facility_id: 1 }),
    onSuccess: (res) => {
      setShowAlert({
        show: true,
        message: `Appointment status Updated  successfully`,
        status: "success",
      });
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
       onResetAlert();
      queryGetDashboard?.refetch();
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Appointment status Update failed`,
        status: "error",
      });
    },
  });

  const mutationPayementUpdateStatus = useMutation({
    mutationFn: (payload) => postUpdatePaymentStatus({ ...payload }),
    onSuccess: (res) => {
      console.log("res", res);
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
        message: `Payment updated successfully`,
        status: "success",
      });
      onResetAlert();
      setPaymentObj({ ...initialStatePayment });
      queryGetDashboard?.refetch();
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Payment updated failed`,
        status: "error",
      });
    },
  });

  const updatePaymentStatus = (payload) => {
    setPaymentObj({
      ...initialStatePayment,
      ...payload,
      open: true,
    });
    // mutationPayementUpdateStatus.mutate({ ...payload });
    // Implement the logic to update payment status
  };

  const onsubmitPayment = () => {
    mutationPayementUpdateStatus.mutate({ ...paymentObj });
  };

  const showLoader = queryGetDashboard?.isLoading || mutationAppoinmentStatusUpdate?.isPending;

  return (
    <div className="flex flex-row min-h-screen bg-gray-50 w-full">
      {/* Main Content */}
      <div className="flex-1 mr-[15%] p-5  w-[100%]">
        <div className="flex-1   overflow-y-auto w-[95%]">
          {/* Top Search Bar */}
          <div className="flex justify-between items-center mb-6 ">
            <div className="flex justify-end w-full gap-5">
              <StyledButton
                variant="outlined"
                onClick={() => setIsBookingOpen(true)}
              >
                New Booking
              </StyledButton>
              <StyledButton
                variant="outlined"
                sx={
                  {
                    // borderRadius: "5px",
                    // border: "1px solid #888",
                    // fontWeight: 400,
                    // boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  }
                }
                onClick={() => setIsCheckinOpen(true)}
              >
                Check in
              </StyledButton>
            </div>
          </div>

          {/* Appointment Summary and Chart */}
          <div className="flex flex-row justify-items-start gap-2 mb-6">
            <div className="bg-white p-2 rounded-md shadow w-[45%]">
              <h2 className="text-lg font-bold mb-3 ml-1">
                Appointment Summary
              </h2>
              <EnhancedPieChart data={appointmentSummary} />
            </div>
            <div className="bg-white p-2 ml-0 rounded-md shadow w-[100%] ">
              <h2 className="text-lg font-bold mb-3">Hourly Booking Chart</h2>
              <EnhancedStackedBarChart data={hourlyBookings || []} />
            </div>
          </div>

          {/* Appointment Table */}
          <AppointmentsTable
            tabName="Scheduled"
            isDashboard={true}
            updatePaymentStatus={updatePaymentStatus}
            updateAppointmentStatus={(payload) =>
              mutationAppoinmentStatusUpdate.mutate({ ...payload })
            }
            dashboardData={tokenData}
            hourlyBookings={hourlyBookings}
            summary={summary}
            //  tableProps={tableProps}
            isDate={false}
            refetchDashBoard={queryGetDashboard?.refetch()}
            setIsCheckinOpen={setIsCheckinOpen}
          />
          {/* <MuiReactTableComponent
            data={tokenData}
            columns={columns}
            tableProps={tableProps}
          /> */}
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="fixed top-0 right-0 w-[17%]  bg-white p-3 border-l overflow-y-auto h-[96%]">
        <div className="mb-4">
          <div className="text-lg font-bold mb-2">Select Date</div>
          <DatePicker
            selected={date}
            onChange={(date) => setDate(date)}
            inline
            minDate={minDate}
            maxDate={maxDate}
            dateFormat="YYYY-MM-DD"
            calendarClassName="heatmap-calendar"
            // dayClassName={(date) => getDateColor(date)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="mb-4">
          <DoctorsSection filteredDoctors={filteredDoctors || doctors} />
        </div>
      </div>
      {/* Patient Modal Overlay */}
      <AddOrEditBooking open={isBookingOpen} setOpen={setIsBookingOpen} />
      <PageLoader show={queryGetDashboard?.isLoading} />
      {isCheckinOpen && (
        <Dialog
          fullWidth
          open={isCheckinOpen}
          slotProps={{
            paper: {
              sx: {
                width: "80vw", // or '90%', '60vw', etc.
                maxWidth: "none",
              },
            },
          }}
          onClose={() => {
            setIsCheckinOpen(false);
            onResetAlert();
          }}
        >
          <DialogTitle color="hms.main" fontSize="18px" fontWeight={500}>
            Check-In Booking Details
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsCheckinOpen(false);
              onResetAlert();
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
          <DialogContent color="hms.main" fontSize="16px">
            <AppointmentsTable
              tabName="Scheduled"
              refetchDashBoard={queryGetDashboard?.refetch()}
              setIsCheckinOpen={setIsCheckinOpen}
            />
          </DialogContent>
        </Dialog>
      )}
      <Dialog
        open={paymentObj?.open}
        onClose={() => {
          onResetAlert();
          setPaymentObj({ ...initialStatePayment });
        }}
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
          Update Payment
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => {
            onResetAlert();
            setPaymentObj({ ...initialStatePayment });
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
          sx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          <FormControlLabel
            sx={{ width: "100%", marginTop: "0.4rem" }}
            control={
              <Checkbox
                defaultChecked={paymentObj?.payment_status}
                value={paymentObj?.payment_status}
                onChange={(e) =>
                  setPaymentObj((prev) => ({
                    ...prev,
                    payment_status: e.target.checked,
                  }))
                }
              />
            }
            label={"Payment status"}
          />
          <SelectWithLabel
            type="text"
            name="paymentMethod"
            value={paymentObj?.payment_method}
            label="Payment Method"
            width="100%"
            placeholderText="Select Payment Method"
            menuOptions={PAYMENT_METHODS}
            minWidth={210}
            onChangeHandler={(value) =>
              setPaymentObj((prev) => ({
                ...prev,
                payment_method: value,
              }))
            }
            LabelSxProps={{ fontWeight: 600 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
          <StyledButton variant="contained" onClick={onsubmitPayment}>
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
        <PageLoader show={showLoader} />
      </Dialog>
    </div>
  );
}

export default DashboardPage;
