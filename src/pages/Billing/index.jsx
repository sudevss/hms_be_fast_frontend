import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import LabBilling from "./LabBilling";
import PharmacyBilling from "./PharmacyBilling";
import ProcedureBilling from "./ProcedureBilling";

const BillingPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="billing tabs">
          <Tab label="Lab" />
          <Tab label="Pharmacy" />
          <Tab label="Procedure" />
        </Tabs>
      </Box>
      <Box sx={{ p: 2 }}>
        {tabValue === 0 && <LabBilling />}
        {tabValue === 1 && <PharmacyBilling />}
        {tabValue === 2 && <ProcedureBilling />}
      </Box>
    </Box>
  );
};

export default BillingPage;
