/* eslint-disable react/prop-types */
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

export default function ConfirmationDialog({
  show,
  title,
  content,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  color,
}) {
  const [open, setOpen] = useState(Boolean(show));
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (open !== show) setOpen(show);
  }, [show]);

  const handleClose = () => {
    setOpen(false);
    onCancel();
  };
  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  const dialogId = `dialog-title-${title}`;

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby={dialogId}
    >
      <DialogTitle
        id={dialogId}
        color="hms.main"
        fontSize="18px"
        fontWeight={500}
      >
        {title}
      </DialogTitle>
      <DialogContent color="hms.main" fontSize="16px">
        {typeof content === "string" ? (
          <DialogContentText color="hms.main">{content}</DialogContentText>
        ) : (
          content
        )}
      </DialogContent>
      <DialogActions sx={{ mr: 2, mb: 1 }}>
        <Button
          autoFocus
          onClick={handleClose}
          sx={{ borderRadius: "28px", py: 1, mr: 1 }}
          variant="outlined"
        >
          {cancelLabel}
        </Button>
        {typeof onConfirm === "function" && (
          <Button
            color={color}
            onClick={handleConfirm}
            autoFocus
            variant="contained"
            sx={{ borderRadius: "28px", py: 1 }}
          >
            {confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
ConfirmationDialog.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  show: PropTypes.bool.isRequired,
  color: PropTypes.string,
};

ConfirmationDialog.defaultProps = {
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  onConfirm: null,
};
