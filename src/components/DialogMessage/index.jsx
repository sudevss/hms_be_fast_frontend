import {
  Dialog,
  DialogTitle,
  Alert,
  AlertTitle,
  DialogActions,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";

function DialogMessage({
  messageType,
  message,
  setMessageType,
  handleOnClose,
}) {
  return (
    messageType && (
      <Dialog
        open={messageType || false}
        onClose={() => setMessageType("")}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Alert severity={messageType?.toLowerCase()}>
            <AlertTitle>{messageType}</AlertTitle>
            {message}
          </Alert>
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={() => {
              setMessageType("");
              handleOnClose();
            }}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    )
  );
}
export default DialogMessage;

DialogMessage.propTypes = {
  message: PropTypes.string.isRequired,
  messageType: PropTypes.string.isRequired,
  setMessageType: PropTypes.func,
  handleOnClose: PropTypes.func,
};

DialogMessage.defaultProps = {
  setMessageType: () => null,
  handleOnClose: PropTypes.func,
};
