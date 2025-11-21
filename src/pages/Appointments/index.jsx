import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashBoardDetails } from "../../serviceApis";
import { useDashboardStore } from "@/stores/dashboardStore";

import StyledButton from "@components/StyledButton";
import AddOrEditBooking from "@/ReusableComponents/AddOrEditBooking";
import AppointmentsTable from "../../ReusableComponents/AppointmentsTable";
import EnhancedTabs from "@components/Tabs/EnhancedTabs";
import { APPOINTMENTS_TABS } from "@data/staticData";
import { Box } from "@mui/material";

function AppointmentsPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { date, setDate, doctor_id, doctorSearch } = useDashboardStore();

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

  const tokenData = queryGetDashboard?.data?.token_data || [];

  return (
    <div>
      {/* Main Content */}
      {/* <div className="flex-1 p-5  overflow-y-auto w-[85vw]"> */}
      <Box
        sx={{
          width: {
            xs: "95vw",
            sm: "90vw",
            md: "80vw",
            lg: "80vw",
            xl: "85vw",
          },
          mx: "auto",
          bgcolor: "#fff",
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <div className="flex-1   overflow-y-auto">
          {/* Top Search Bar */}
          <div className="flex justify-between items-center mb-6 ">
            <div className="w-[50%]">
              <EnhancedTabs
                tabTitles={APPOINTMENTS_TABS}
                tabsGroupTitle="Open Waiting Completed"
                selectedTabIndex={tabIndex}
                showScrollButtons
                tabIndexUpdateHandler={setTabIndex}
                sx={{ justifyContent: "center" }}
                TabComponentProps={{
                  sx: {
                    flexGrow: 1,
                  },
                  a11yTabProps: {
                    "aria-controls": "Open Waiting Completed",
                  },
                }}
                TabsComponentProps={{
                  sx: {
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  },
                }}
              />
            </div>
            <div className="flex justify-end w-full gap-5">
              <StyledButton
                variant="outlined"
                onClick={() => setIsBookingOpen(true)}
              >
                New Booking
              </StyledButton>
            </div>
          </div>

          {/* Appointment Table */}
          <AppointmentsTable
            data={tokenData}
            tabName={APPOINTMENTS_TABS[tabIndex]}
          />
        </div>
        {/* </div> */}
      </Box>
      <AddOrEditBooking open={isBookingOpen} setOpen={setIsBookingOpen} />
    </div>
  );
}

export default AppointmentsPage;
