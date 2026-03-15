/* eslint-disable spellcheck/spell-checker */
/* eslint-disable camelcase */
import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import {
  Box,
  Stack,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { postLogin } from "@/serviceApis";
import { userLoginDetails } from "@/stores/LoginStore";
import AlertSnackbar from "@components/AlertSnackbar";
import TextInputWithLabel from "@components/inputs/TextInputWithLabel";
import StyledButton from "@components/StyledButton";
import PageLoader from "@pages/PageLoader";
import { INITIAL_SHOW_ALERT } from "@data/staticData";

const MESSAGES = {
  InvalidCredentials: "Please enter valid User ID & Password",
  MissingCredentials: "Please enter all the details",
  ForbiddenAccess: "Sorry, you don't have permission to access this portal",
  InternalServerError: "Oh no! Something went wrong. Please try again later",
};

function LoginCardPanel() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const userStore = userLoginDetails();
  const [showAlert, setShowAlert] = useState(INITIAL_SHOW_ALERT);
  const [loginObj, setLoginObj] = useState({ user_id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const mutateLogin = useMutation({
    mutationFn: () => postLogin(loginObj),
    onSuccess: (res) => {
      if (res) {
        userStore.setUserDetails(res);
        navigate("/dashboard");
      }
    },
    onError: (error) => {
      setShowAlert({
        show: true,
        message:
          error?.response?.data?.detail ||
          MESSAGES.InvalidCredentials ||
          "Login failed",
        status: "error",
      });
    },
  });

  const handleLogin = () => {
    if (!loginObj.user_id || !loginObj.password) {
      setShowAlert({
        show: true,
        message: MESSAGES.MissingCredentials,
        status: "warning",
      });
      return;
    }
    mutateLogin.mutate();
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setLoginObj((prev) => ({ ...prev, [name]: value }));
  };

  const showLoader = mutateLogin.isPending;

  return (
    <>
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          width: "100%",
          height: "100%",
          px: { xs: 2, sm: 4 },
          py: { xs: 4, sm: 5 },
        }}
      >
        <Stack
          alignItems="center"
          justifyContent="center"
          width="100%"
          maxWidth={isTablet ? "80vw" : 420}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: { xs: theme.shadows[2], sm: theme.shadows[2] },
            p: { xs: 3, sm: 4, md: 5 },
          }}
        >
          {/* Heading */}
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary.main"
            textAlign="center"
            sx={{
              mb: 3,
              width: "100%",
              fontSize: {
                xs: "1.6rem",
                sm: "1.8rem",
                md: "2rem",
              },
            }}
          >
            Welcome to HFlow
          </Typography>

          {/* Login Form */}
          <Box component="form" noValidate autoComplete="off" width="100%">
            <Stack spacing={{ xs: 2, sm: 2.5 }}>
              {/* User ID */}
              <TextInputWithLabel
                type="text"
                name="user_id"
                label="User ID"
                placeholder="Enter User ID"
                onChange={handleOnChange}
                value={loginObj.user_id}
                LabelSxProps={{
                  fontWeight: 600,
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                }}
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    height: { xs: 38, sm: 44 },
                  },
                }}
                fullWidth
              />

              {/* Password */}
              <TextInputWithLabel
                type={showPassword ? "text" : "password"}
                name="password"
                label="Password"
                placeholder="Enter Password"
                onChange={handleOnChange}
                value={loginObj.password}
                LabelSxProps={{
                  fontWeight: 600,
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                }}
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    height: { xs: 38, sm: 44 },
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />

              {/* Login Button */}
              <StyledButton
                fullWidth
                variant="contained"
                disabled={!loginObj.user_id || !loginObj.password || showLoader}
                onClick={handleLogin}
                sx={{
                  borderRadius: "28px",
                  py: { xs: 1, sm: 1.2 },
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  textTransform: "none",
                }}
              >
                {showLoader ? "Logging in..." : "Login"}
              </StyledButton>
            </Stack>
          </Box>

          {/* Footer */}
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{
              mt: { xs: 2, sm: 3 },
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
            }}
          >
            Having trouble logging in? Contact your administrator.
          </Typography>
        </Stack>
      </Stack>

      {/* Loader */}
      <PageLoader show={showLoader} />

      {/* Snackbar */}
      <AlertSnackbar
        message={showAlert.message}
        showAlert={showAlert.show}
        severity={showAlert.status || "error"}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setShowAlert(INITIAL_SHOW_ALERT)}
      />
    </>
  );
}

LoginCardPanel.propTypes = {
  redirectTo: PropTypes.shape({
    path: PropTypes.string,
    search: PropTypes.string,
  }),
};

LoginCardPanel.defaultProps = {
  redirectTo: { path: "", search: "" },
};

export default LoginCardPanel;
