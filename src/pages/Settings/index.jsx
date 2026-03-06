import React from "react";
import { Box } from "@mui/material";
import TemplatesManager from "./TemplatesManager";

function SettingsPage() {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
      <TemplatesManager />
    </Box>
  );
}

export default SettingsPage;

