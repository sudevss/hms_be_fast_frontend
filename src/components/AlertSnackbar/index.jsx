import { Alert, Slide, Snackbar } from "@mui/material";
import { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";

function TransitionUp(props) {
  return <Slide {...props} direction="up" />;
}

function AlertSnackbar({
  showAlert,
  message,
  severity,
  anchorOrigin,
  onClose,
  rootStyles,
}) {
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    setShowSnackbar(showAlert);

    return () => {
      setShowSnackbar(false);
    };
  }, [showAlert]);

  const handleClose = useCallback((e, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSnackbar(false);
    onClose();
  }, []);

  return (
    <Snackbar
      open={showSnackbar}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
      sx={{
        "&.MuiSnackbar-root": {
          maxWidth: {
            md: "480px",
            lg: "550px",
          },
          boxShadow: (theme) => `0 0 6px ${theme.palette.primary.main}`,
          borderRadius: "8px",
          ...rootStyles,
        },
      }}
      TransitionComponent={TransitionUp}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        sx={{
          width: "100%",
          color: "hms.main",
          fontSize: "18px",
          fontWeight: "400",
          "&.MuiAlert-root": {
            background: "white",
            alignItems: "center",
          },
        }}
        variant="standard"
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default AlertSnackbar;

AlertSnackbar.propTypes = {
  showAlert: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(["error", "info", "success", "warning"]),
  anchorOrigin: PropTypes.shape({
    vertical: PropTypes.string,
    horizontal: PropTypes.string,
  }),
  onClose: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  rootStyles: PropTypes.object,
};

AlertSnackbar.defaultProps = {
  severity: "info",
  anchorOrigin: { vertical: "bottom", horizontal: "center" },
  onClose: () => null,
  rootStyles: {},
};
