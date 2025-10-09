import { Box, Stack } from "@mui/material";
// import LoginImage from "@assets/images/loginImage.png";
import LoginImage from "@assets/images/loginPage.png";
// import LogoImage from "@assets/images/lloginImage.pngogo_with_title_purple.svg";

function SideIllustrationPanel() {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      position="relative"
      height="100%"
      width="90%"
      margin="0 auto"
    >
      <Box
        component="img"
        sx={{
          position: "relative",
          top: { xs: "5%", sm: "-10%" },
          left: { xs: "0%", sm: "15%" },
          height: "90px",
          alignSelf: "flex-start",
        }}
        alt="IntuiSmart Solutions Logo"
        src="https://intuismartsolutions.com/wp-content/uploads/2021/07/IntuiSmart_logo-1.png"
      />

      <Box
        component="img"
        sx={{
          width: "70%",
          height: "auto",
          display: { xs: "none", sm: "initial" },
        }}
        // alt="hms Dashboard Illustration"
        src={LoginImage}
      />
    </Stack>
  );
}

export default SideIllustrationPanel;
