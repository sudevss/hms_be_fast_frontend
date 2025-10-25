import { useState, useMemo } from "react";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getDashBoardDetails,
  postUpdateAppointmentStatus,
  postUpdatePaymentStatus,
} from "@/serviceApis";
import { INITIAL_SHOW_ALERT, PAYMENT_METHODS } from "@data/staticData";

import { useDashboardStore } from "@/stores/dashboardStore";
import { useShowAlert } from "@/stores/showAlertStore";

import DoctorsSection from "./DoctersSection";
import EnhancedPieChart from "@components/charts/EnhancedPieChart";
import EnhancedStackedBarChart from "@components/charts/EnhancedStackedBarChart";
import StyledButton from "@components/StyledButton";
import AppointmentsTable from "@/ReusableComponents/AppointmentsTable";
import SelectWithLabel from "@components/inputs/SelectWithLabel";
import AddOrEditBooking from "@/ReusableComponents/AddOrEditBooking";
import PageLoader from "@pages/PageLoader";
import AlertSnackbar from "@components/AlertSnackbar";

function DashboardPage() {
  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  
  const { date, setDate, doctor_id, doctorSearch } = useDashboardStore();

  // 🔹 Fetch Dashboard Data
  const queryGetDashboard = useQuery({
    queryKey: ["dashboard", doctor_id, date],
    queryFn: () => getDashBoardDetails({ date, facility_id: 1, doctor_id }),
    enabled: true,
  });

  const {
    token_data: tokenData = [],
    doctors = [],
    hourly_booking_chart: hourlyBookings = [],
    summary = {},
  } = queryGetDashboard?.data || {};

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((d) =>
        d.name.toLowerCase().includes(doctorSearch.toLowerCase())
      ),
    [doctors, doctorSearch]
  );

  // 🔹 Appointment Summary
  const appointmentSummary = useMemo(
    () => [
      { name: "Total Appointments", value: summary?.total_appointments || 0 },
      { name: "Total Check-ins", value: summary?.total_checkin || 0 },
      { name: "Available Slots", value: summary?.available_slots || 0 },
      { name: "Walk-in Patients", value: summary?.total_walkin_patients || 0 },
    ],
    [summary]
  );

  // 🔹 Mutations
  const mutationAppoinmentStatusUpdate = useMutation({
    mutationFn: (payload) =>
      postUpdateAppointmentStatus({ ...payload, facility_id: 1 }),
    onSuccess: () => {
      setShowAlert({
        show: true,
        message: `Appointment status updated successfully`,
        status: "success",
      });
      queryClient.invalidateQueries(["dashboard"]);
      queryGetDashboard.refetch();
      onResetAlert();
    },
    onError: () => {
      setShowAlert({
        show: true,
        message: `Failed to update appointment status`,
        status: "error",
      });
    },
  });

  const showLoader =
    queryGetDashboard?.isLoading ||
    mutationAppoinmentStatusUpdate?.isPending 
  const minDate = dayjs().subtract(1, "day").toDate();
  const maxDate = dayjs().add(7, "day").toDate();

  return (
    <Box
      className="dashboard-page"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f9fafb",
        position: "relative",
        
      }}
    >
      {/* Left Content Section */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          overflowY: "auto",
          width: {
            xs: "100%", // Mobile phones (0px - 599px)
            sm: "90vw", // Small tablets (600px - 899px)
            md: "80vw", // Tablets / small laptops (900px - 1199px)
            lg: "70vw", // Desktops (1200px - 1535px)
            xl: "70vw", // Large screens (1536px+)
          }
        }}
      >
        {/* Top Action Buttons */}
        <Box
          display="flex"
          justifyContent="flex-end"
          gap={2}
          mb={3}
          flexWrap="wrap"
        >
          <StyledButton
            variant="outlined"
            onClick={() => setIsBookingOpen(true)}
          >
            New Booking
          </StyledButton>
          <StyledButton
            variant="outlined"
            onClick={() => setIsCheckinOpen(true)}
          >
            Check-in
          </StyledButton>
        </Box>

        {/* Charts Section */}
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={2}
          mb={4}
        >
          <Box
            sx={{
              flex: isMobile ? "1 1 auto" : "0 0 45%",
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              p: 2,
              height: "28vh",
            }}
          >
            <h2 className="text-lg font-bold mb-3 ml-1">Appointment Summary</h2>
            <EnhancedPieChart data={appointmentSummary} />
          </Box>

          <Box
            sx={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              p: 2,
              height: "28vh",
            }}
          >
            <h2 className="text-lg font-bold mb-3">Hourly Booking Chart</h2>
            <EnhancedStackedBarChart data={hourlyBookings || []} />
          </Box>
        </Box>

        {/* Appointment Table */}
        <AppointmentsTable
          tabName="Scheduled"
          isDashboard
          updateAppointmentStatus={(payload) =>
            mutationAppoinmentStatusUpdate.mutate(payload)
          }
          dashboardData={tokenData}
          hourlyBookings={hourlyBookings}
          summary={summary}
          isDate={false}
          refetchDashBoard={queryGetDashboard.refetch}
          setIsCheckinOpen={setIsCheckinOpen}
        />
      </Box>

      {/* Right Sidebar */}
      <Box
        sx={{
          width: {
            xs: "100%", // Mobile phones (0px - 599px)
            sm: "90vw", // Small tablets (600px - 899px)
            md: "45vw", // Tablets / small laptops (900px - 1199px)
            lg: "35vw", // Desktops (1200px - 1535px)
            xl: "25vw", // Large screens (1536px+)
          },
          p: { xs: 2, sm: 3 },
          backgroundColor: "#fff",
          // borderLeft: { md: "1px solid #e5e7eb" },
          position: { md: "sticky" },
          top: 0,
          height: { md: "100vh", xs: "auto" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Date Picker Section */}
        <Box
          sx={{
            flexShrink: 0,
            mb: 1,
          }}
        >
          <DatePicker
            sx={{
              width: {
                //  xs: "100%", // Mobile phones (0px - 599px)
                sm: "14vw", // Small tablets (600px - 899px)
                md: "24vw", // Tablets / small laptops (900px - 1199px)
                lg: "17vw", // Desktops (1200px - 1535px)
                xl: "14vw",
              },
            }}
            selected={date}
            onChange={(d) => setDate(d)}
            inline
            minDate={minDate}
            maxDate={maxDate}
            calendarClassName="custom-calendar"
          />
        </Box>

        {/* Doctor Section */}
        <Box
          sx={{
            flex: 1, // Takes remaining height
            overflowY: "auto",
            borderRadius: 2,
            // border: "1px solid #e5e7eb",
            // p: 1,
            mt: 1,
            backgroundColor: "#fafafa",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#cfcfcf",
              borderRadius: "4px",
            },
          }}
        >
          <DoctorsSection filteredDoctors={filteredDoctors || doctors} />
        </Box>
      </Box>

      {/* Add Booking Modal */}
      <AddOrEditBooking open={isBookingOpen} setOpen={setIsBookingOpen} />

      {/* Check-in Dialog */}
      <Dialog
        maxWidth={false} // 👈 disables MUI's fixed maxWidth ("sm", "md", etc.)
        fullWidth={false} // 👈 so width is fully controlled by sx
        open={isCheckinOpen}
        onClose={() => {
          setIsCheckinOpen(false);
          onResetAlert();
        }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "95%", md: "80vw" },
              borderRadius: 2,
              p: 2,
            },
          },
        }}
      >
        <DialogTitle fontWeight={600} color="#115E59">
          Check-In Booking Details
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setIsCheckinOpen(false)}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <AppointmentsTable
            tabName="Scheduled"
            refetchDashBoard={queryGetDashboard.refetch}
            setIsCheckinOpen={setIsCheckinOpen}
          />
        </DialogContent>
      </Dialog>


      {/* Alerts & Loader */}
      <AlertSnackbar
        message={showAlert.message}
        showAlert={showAlert.show}
        severity={showAlert.status}
        onClose={() => setShowAlert(INITIAL_SHOW_ALERT)}
      />
      <PageLoader show={showLoader} />
    </Box>
  );
}

export default DashboardPage;



