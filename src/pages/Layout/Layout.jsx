import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { userLoginDetails } from "@/stores/LoginStore";

const Layout = () => {
  const userObj = userLoginDetails.getState();
  const { access_token } = userObj || {};
  const [mobileOpen, setMobileOpen] = useState(false);

  const SIDEBAR_WIDTH = "7rem"; // sidebar width for desktop

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
            sx={{
              width: { md: SIDEBAR_WIDTH, xs: "0" },
              flexShrink: 0,
            }}
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
            ml: { md: access_token ? SIDEBAR_WIDTH : 0 },
            transition: "margin-left 0.3s ease-in-out",
          }}
        >
          {/* Header */}
          {access_token && <Header onMenuClick={handleDrawerToggle} />}

          {/* Main Content (scrollable area) */}
          <Box
            component="main"
            sx={{
              flex: 1,
              maxHeight: access_token ? "calc(100vh - 3.5rem - 60px)" : "100vh",  
              overflowY: "auto",
              p: { xs: 2, sm: 2, md: 1 },
              pt: { xs: 2, sm: 2, md: 2 },
              pb:0,
              mt: access_token ? "0.5rem" : 0, // header height offset
              // mb: "60px", // footer height offset
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
              left: access_token ? { md: SIDEBAR_WIDTH, xs: 0 } : 0,
              width: access_token
                ? { md: `calc(100% - ${SIDEBAR_WIDTH})`, xs: "100%" }
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
            <Footer />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Layout;
