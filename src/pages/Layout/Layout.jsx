import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./SideBar";
import { Outlet } from "react-router-dom";
import { userLoginDetails } from "@/stores/LoginStore";
import { useDashboardStore } from "@/stores/dashboardStore";

const Layout = () => {
  const userObj = userLoginDetails.getState();
  const { access_token } = userObj || {};
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isNavCollapsed: isCollapsed } = useDashboardStore();

  const EXPANDED_WIDTH = "220px";
  const COLLAPSED_WIDTH = "60px";

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <>
      <CssBaseline />

      <Box
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#f9fafb",
        }}
      >
        {/* Sidebar */}
        {access_token && (
          <Sidebar
            mobileOpen={mobileOpen}
            onClose={handleDrawerToggle}
          />
        )}

        {/* Main Section */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            width: "100%",
            ml: { 
              xs: 0,
              md: access_token ? (isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH) : 0 
            },
            transition: "all 0.3s ease-in-out",
          }}
        >
          {/* Header */}
          {access_token && <Header onMenuClick={handleDrawerToggle} isSidebarCollapsed={isCollapsed} />}

          {/* Main Content (scrollable area) */}
          <Box
            component="main"
            sx={{
              flex: 1,
              maxHeight: access_token ? "calc(100vh - 3.8 - 60px)" : "100vh",  
              overflowY: "auto",
              p: { xs: 2, sm: 2, md: 2},
              pt: { xs: 3, sm: 3, md: 3},
              pb: 0,
              mt: access_token ? "4rem" : 0, // increased top margin to move content down
              backgroundColor: "#f9fafb",
            }}
          >
            <Outlet />
          </Box>

          {/* Footer */}
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: { 
                xs: 0,
                md: access_token ? (isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH) : 0 
              },
              width: access_token
                ? { 
                    xs: "100%",
                    md: `calc(100% - ${isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH})`
                  }
                : "100%",
              backgroundColor: "#fff",
              borderTop: "1px solid #e5e7eb",
              zIndex: 10,
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
            }}
          >
            <Footer isSidebarCollapsed={isCollapsed} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Layout;
