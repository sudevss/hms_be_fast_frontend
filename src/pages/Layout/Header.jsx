import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Header = ({ onMenuClick }) => {
  return (
    <Box
      component="header"
      className="flex items-center justify-between px-4 bg-white border-b shadow-sm"
      sx={{
        position: "fixed",
        top: 0,
        left: { xs: 0, md: "7rem" }, // same width as sidebar
        right: 0,
        height: { xs: "2rem", sm: "64px", md: "3.5rem" },
        zIndex: 1100,
        borderColor: "#E0E0E0",
      }}
    >
      {/* Left: Menu Button for Mobile */}
      <IconButton
        onClick={onMenuClick}
        sx={{
          display: { xs: "flex", md: "none" },
          color: "#115E59",
        }}
        aria-label="open sidebar"
      >
        <MenuIcon />
      </IconButton>

      {/* Center: Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "18px", sm: "22px", md: "26px" },
          color: "#115E59",
          textAlign: "center",
          flexGrow: 1,
        }}
      >
        Apple Medical Center
      </Typography>

      {/* Right: Placeholder for future buttons (profile, settings, etc.) */}
      <Box
        sx={{
          width: "40px",
          display: { xs: "none", md: "block" },
        }}
      />
    </Box>
  );
};

export default Header;
