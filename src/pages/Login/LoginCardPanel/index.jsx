/* eslint-disable spellcheck/spell-checker */
/* eslint-disable @tanstack/query/exhaustive-deps */
/* eslint-disable camelcase */
import { postLogin } from "@/serviceApis";
import { userLoginDetails } from "@/stores/LoginStore";
import AlertSnackbar from "@components/AlertSnackbar";
import TextInputWithLabel from "@components/Inputs/TextInputWithLabel";
import StyledButton from "@components/StyledButton";
import { INITIAL_SHOW_ALERT } from "@data/staticData";
import { Box, Button, Stack, Typography } from "@mui/material";
import PageLoader from "@pages/PageLoader";
import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MESSAGES = {
  InvalidCredentials: "Please enter valid User ID & Password",
  MissingCredentials: "Please enter all the details",
  ForbiddenAccess: "Sorry, you don't have permission to access this portal",
  NoAccessToHms: "Sorry, you don't have permission to hms",
  NoAccessToDart: "Sorry, you don't have permission to Dart",
  InternalServerError: "Oh no! Something went wrong. Please try again later",
};

function LoginCardPanel({}) {
  const userObj = userLoginDetails();
  

  // const { } = userLoginDetails();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(INITIAL_SHOW_ALERT);
  // const [alertMessage, setAlertMessage] = useState("");
  // const [showLoader, setShowLoader] = useState(false);

  const [loginObj, setLoginObj] = useState({
    user_id: "",
    password: "",
  });

  const mutateLogin = useMutation({
    mutationFn: () => postLogin(loginObj),
    // postLogin(loginObj),
    onSuccess: (res) => {
     
      if (res) {
        userObj.setUserDetails(res);
        navigate("/dashboard");
      }

      // const updatedata = data?.weekDaysList.map((_obj) => ({
      //   ..._obj,
      //   isChecked: _obj?.slotWeeks?.some(({ windowNum }) => windowNum),
      // }));
      // if (updatedata) {
      //   setDoctorSheduleData({ ...data, weekDaysList: [...updatedata] });
      //   setOpenSheduleDoctor(true);
      // }
    },
    onError: (error) => {
      setShowAlert({
        show: true,
        message: error?.response?.data?.detail,
        status: "error",
      });
    },
  });

  const handleLogin = () => {
    mutateLogin.mutate();
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setLoginObj((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  const showLoader = mutateLogin.isPending;
  return (
    <>
      <Stack justifyContent="center" alignItems="center" height="100%">
        <Stack
          alignItems="center"
          justifyContent="center"
          width={{ md: "456px", xs: "90%" }}
          minHeight="410px"
          height="auto"
          sx={{ background: "#a4e3bda8", borderRadius: "16px" }}
          pt="2rem"
          pb="2rem"
        >
          <Typography variant="h2" fontWeight="600" textAlign="center">
            Welcome to HMS
          </Typography>
          <Stack justifyContent="center" alignItems="flex-start" width="70%">
            <Box
              component="form"
              sx={{
                "& > :not(style)": { m: 1 },
                paddingTop: "2rem",
              }}
              noValidate
              autoComplete="off"
              width="100%"
              // onSubmit={}
            >
              <>
                <TextInputWithLabel
                  type="text"
                  name="user_id"
                  label="User ID"
                  placeholder="Enter User ID"
                  onChange={handleOnChange}

                  // onChange={(event) => {
                  //   setUserId(event.target.value);
                  // }}
                  LabelSxProps={{ fontWeight: 600 }}
                />

                <TextInputWithLabel
                  type="text"
                  name="password"
                  label="Password"
                  placeholder="Enter Password"
                  onChange={handleOnChange}
                  LabelSxProps={{ fontWeight: 600 }}
                />
                {/* <TextInputWithLabel
                  type="text"
                  name="email"
                  label="Email ID"
                  placeholder="Enter your Email ID"
                  // onChange={(event) => {
                  //   setPassword(event.target.value);
                  // }}
                  LabelSxProps={{ fontWeight: 600 }}
                />

                <TextInputWithLabel
                  type="text"
                  name="groupName"
                  label="Group Name"
                  placeholder="Group name Eg: SPECT_XXX_XXX_XXX_XXX_UAT"
                  // onChange={(event) => {
                  //   setPassword(event.target.value);
                  // }}
                  LabelSxProps={{ fontWeight: 600 }}
                /> */}
              </>

              <Stack direction="row" justifyContent="center">
                {/* {authState?.isAuthenticated && (
                  <Button
                    variant="contained"
                    type="button"
                    sx={{ borderRadius: "28px" }}
                    onClick={logout}
                  >
                    Logout
                  </Button>
                )} */}
                {/* {!authState?.isAuthenticated && ( */}

                <StyledButton
                  variant="contained"
                  // type="submit"
                  sx={{ borderRadius: "28px" }}
                  disabled={!(loginObj.user_id || loginObj.password)}
                  onClick={handleLogin}
                >
                  Login
                </StyledButton>

                {/* )} */}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Stack>
      <PageLoader show={showLoader} />
      <AlertSnackbar
        message={showAlert.message}
        showAlert={ showAlert.show }
        severity="error"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setShowAlert(INITIAL_SHOW_ALERT)}
      />
    </>
  );
}

export default LoginCardPanel;

LoginCardPanel.propTypes = {
  redirectTo: PropTypes.shape({
    path: PropTypes.string,
    search: PropTypes.string,
  }),
};

LoginCardPanel.defaultProps = {
  redirectTo: { path: "", search: "" },
};
