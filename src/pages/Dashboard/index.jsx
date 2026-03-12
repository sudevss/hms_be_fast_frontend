import { useState, useMemo } from "react";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashBoardDetails,
  postUpdateAppointmentStatus,
} from "@/serviceApis";
import { INITIAL_SHOW_ALERT } from "@data/staticData";

import { useDashboardStore } from "@/stores/dashboardStore";
import { useShowAlert } from "@/stores/showAlertStore";

import DoctorsSection from "./DoctersSection";
import EnhancedPieChart from "@components/charts/EnhancedPieChart";
import EnhancedStackedBarChart from "@components/charts/EnhancedStackedBarChart";
import StyledButton from "@components/StyledButton";
import AppointmentsTable from "@/ReusableComponents/AppointmentsTable";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { date, setDate, doctor_id, doctorSearch } = useDashboardStore();

  const queryGetDashboard = useQuery({
    queryKey: ["dashboard", doctor_id, date],
    queryFn: () => getDashBoardDetails({ date, facility_id: 1, doctor_id }),
    enabled: true,
    refetchInterval: 60000,
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

  const appointmentSummary = useMemo(
    () => [
      { name: "Total Appointments", value: summary?.total_appointments || 0 },
      { name: "Total Check-ins", value: summary?.total_checkin || 0 },
      { name: "Available Slots", value: summary?.available_slots || 0 },
      { name: "Walk-in Patients", value: summary?.total_walkin_patients || 0 },
    ],
    [summary]
  );

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
    queryGetDashboard?.isLoading || mutationAppoinmentStatusUpdate?.isPending;
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
        overflow: "hidden",
      }}
    >
      {/* Left Section */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          p: { xs: 2, sm: 3 },
          overflowY: "auto",
          transition: "all 0.3s ease",
        }}
      >
        {/* Top Actions */}
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

        {/* Charts */}
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

      {/* Sidebar Toggle Button */}
      <Tooltip title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}>
        <IconButton
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          sx={{
            position: "absolute",
            top: 80,
            right: isSidebarOpen ? { md: "35%", lg: "32%", xl: "28%" } : 0,
            zIndex: 10,
            backgroundColor: "#fff",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            "&:hover": { backgroundColor: "#f0f0f0" },
            transition: "right 0.3s ease",
          }}
        >
          {isSidebarOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Tooltip>

      {/* Right Sidebar */}
      <Box
        sx={{
          flex: {
            xs: "0 0 100%",
            sm: "0 0 100%",
            md: isSidebarOpen ? "0 0 35%" : "0 0 0%",
            lg: isSidebarOpen ? "0 0 32%" : "0 0 0%",
            xl: isSidebarOpen ? "0 0 28%" : "0 0 0%",
          },
          minWidth: 0,
          transition: "flex 0.3s ease",
          backgroundColor: "#fff",
          overflow: "hidden",
          p: isSidebarOpen ? { xs: 2, sm: 3 } : 0,
        }}
      >
        {isSidebarOpen && (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                inline
                minDate={minDate}
                maxDate={maxDate}
                calendarClassName="custom-calendar"
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                borderRadius: 2,
                mt: 1,
                backgroundColor: "#fafafa",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  background: "#cfcfcf",
                  borderRadius: "4px",
                },
              }}
            >
              <DoctorsSection filteredDoctors={filteredDoctors || doctors} />
            </Box>
          </>
        )}
      </Box>

      {/* Modals */}
      <AddOrEditBooking open={isBookingOpen} setOpen={setIsBookingOpen} />

      <Dialog
      fullWidth
      maxWidth="xl"
        open={isCheckinOpen}
        // onClose={() => {
        //   setIsCheckinOpen(false);
        //   onResetAlert();
        // }}
        slotProps={{
          paper: {
            sx: { width: { xs: "95%", md: "80vw", }, borderRadius: 2, p: 2 },
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
