import { Box } from "@mui/material";
import React from "react";

const Footer = () => {
  return (
    <Box className="h-[4%] flex justify-end">
      <Box
        component="img"
        sx={{
          // background: "#fff",
          position: "relative",
          height: "100%",
          mx: "2%",
          alignSelf: "flex-start",
        }}
        alt="IntuiSmart Solutions Logo"
        src="http://intuismartsolutions.com/wp-content/uploads/2021/07/IntuiSmart_logo-1.png"
      />
    </Box>
  );
};

export default Footer;
