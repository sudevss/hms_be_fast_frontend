/* eslint-disable spellcheck/spell-checker */
/* eslint-disable @tanstack/query/exhaustive-deps */
/* eslint-disable camelcase */
import AlertSnackbar from "@components/AlertSnackbar";
import TextInputWithLabel from "@components/Inputs/TextInputWithLabel";
import { INITIAL_SHOW_ALERT } from "@data/staticData";
import { Box, Button, Stack, Typography } from "@mui/material";
import PageLoader from "@pages/PageLoader";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const MESSAGES = {
  InvalidCredentials: "Please enter valid User ID & Password",
  MissingCredentials: "Please enter all the details",
  ForbiddenAccess: "Sorry, you don't have permission to access this portal",
  NoAccessToHms: "Sorry, you don't have permission to hms",
  NoAccessToDart: "Sorry, you don't have permission to Dart",
  InternalServerError: "Oh no! Something went wrong. Please try again later",
};

function LoginCardPanel({}) {
  const [showAlert, setShowAlert] = useState(INITIAL_SHOW_ALERT);
  const [alertMessage, setAlertMessage] = useState("");
  const [showLoader, setShowLoader] = useState(false);

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
                  name="userId"
                  label="User ID"
                  placeholder=""
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
                  // onChange={(event) => {
                  //   setPassword(event.target.value);
                  // }}
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

                <Button
                  variant="contained"
                  type="submit"
                  sx={{ borderRadius: "28px" }}
                  // onClick={login}
                >
                  Login
                </Button>

                {/* )} */}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Stack>
      <PageLoader show={showLoader} />
      <AlertSnackbar
        message={alertMessage}
        showAlert={showAlert}
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
