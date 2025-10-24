import { Grid, Box, useTheme, useMediaQuery } from "@mui/material";
import SideIllustrationPanel from "@components/SideIllustrationPanel";
import LoginCardPanel from "./LoginCardPanel";
import { useEffect } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { logOut, userLoginDetails } from "@/stores/LoginStore";
import { useQueryClient } from "@tanstack/react-query";

function Login() {

  const queryClient = useQueryClient();
  const userObj = userLoginDetails();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isTabletUp = useMediaQuery(theme.breakpoints.up("md")); // ≥900px

    const handleLogout = () => {
      userObj?.onReset();
      logOut();
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    };
  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <Grid
      container
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* Left Illustration Section */}
      {isTabletUp && (
        <Grid
          item
          md={6}
          sx={{
            maxWidth:  "45vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.light",
            height: "100%",
          }}
        >
          <SideIllustrationPanel />
        </Grid>
      )}

      {/* Right Login Section */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
            maxWidth: isTabletUp ? "45vw": "100vw",

          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          bgcolor: "background.paper",
        }}
      >
        
          <Box
            sx={{
              bgcolor: "background.paper",
              // boxShadow: { xs: "none", sm: 3 },
              borderRadius: 2,
              p: { xs: 2, sm: 4 },
            }}
          >
            <LoginCardPanel />
          </Box>
      </Grid>
    </Grid>
  );
}

export default Login;
