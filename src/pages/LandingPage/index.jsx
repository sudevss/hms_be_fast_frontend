import React from "react";
import { Box } from "@mui/material";
import LandingNavbar from "./LandingNavbar";
import LandingHero from "./LandingHero";
import LandingSolutions from "./LandingSolutions";
import LandingDemo from "./LandingDemo";
import LandingFooter from "./LandingFooter";

const LandingPage = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <LandingNavbar />
      <LandingHero />
      <LandingSolutions />
      <LandingDemo />
      <LandingFooter />
    </Box>
  );
};

export default LandingPage;
