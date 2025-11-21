import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AppointmentsTable from "@/ReusableComponents/AppointmentsTable";
import { usePatient } from "@/stores/patientStore";

const PatientHistoryTable = ({ open, setOpen }) => {
  const { id, onReset } = usePatient();

  const handleClose = () => {
    setOpen(false);
    onReset();
  };

  return (
    <Dialog
      open={open || false}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="patient-history-title"
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
        },
        "& .MuiPaper-root": {
          mt: 10,
          borderRadius: 2,
          width: "95%",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Close Icon */}
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Title */}
      <DialogTitle
        id="patient-history-title"
        sx={{
          m: 0,
          p: 2,
          fontSize: "18px",
          fontWeight: 600,
          textAlign: "center",
          borderBottom: "1px solid #E0E0E0",
        }}
      >
        Patient Appointment History
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {id ? (
          <AppointmentsTable tabName="Completed" patient_id={id} />
        ) : (
          <Box
            sx={{
              textAlign: "center",
              color: "gray",
              mt: 10,
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            No patient selected.
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PatientHistoryTable;
