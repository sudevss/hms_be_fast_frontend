import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { userLoginDetails } from "@/stores/LoginStore";

const SIDEBAR_WIDTH = "14rem"; // sidebar width (desktop)

const Footer = ({ isSidebarCollapsed = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const userObj = userLoginDetails.getState();
  const { access_token } = userObj || {};

  // Dynamically adjust left and width based on sidebar state
  const sidebarOffset = access_token
    ? isSidebarCollapsed
      ? "4rem" // collapsed sidebar width
      : SIDEBAR_WIDTH
    : 0;

  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: { xs: 0, md: sidebarOffset },
        width: {
          xs: "100%",
          md: access_token ? `calc(100% - ${sidebarOffset})` : "100%",
        },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 1, sm: 1.5 },
        borderTop: "1px solid #E0E0E0",
        backgroundColor: "#ffffff",
        boxShadow: "0px -1px 4px rgba(0,0,0,0.05)",
        height: { xs: 48, sm: 56 },
        zIndex: 1200,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Left Section — Text */}
      {!isMobile && (
        <Typography
          variant="body2"
          sx={{
            color: "#555",
            fontSize: { xs: "12px", sm: "14px" },
            fontWeight: 400,
          }}
        >
          © {new Date().getFullYear()}{" "}
          <strong style={{ color: "#115E59" }}>IntuiSmart Solutions</strong> — All rights reserved.
        </Typography>
      )}

      {/* Right Section — Logo */}
      <Box
        component="img"
        src="https://intuismartsolutions.com/wp-content/uploads/2021/07/IntuiSmart_logo-1.png"
        alt="IntuiSmart Solutions Logo"
        sx={{
          height: { xs: 22, sm: 28 },
          width: "auto",
          objectFit: "contain",
          ml: "auto",
        }}
      />
    </Box>
  );
};

export default Footer;
