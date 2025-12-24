import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PreviousAppointments from "./PreviousAppointments";
import Attachments from "./Attachments";

const COLLAPSED_WIDTH = 56;

const DiagnosisRightSidebar = ({ isOpen, onToggle, patientId }) => {
  return (
    <Box
      sx={{
        width: isOpen
          ? {
              xs: "90vw",
              sm: "80vw",
              md: "50vw",
              lg: "45vw",
              xl: "40vw",
            }
          : `${COLLAPSED_WIDTH}px`,
        transition: "width 0.3s ease",
        backgroundColor: "#fff",
        borderLeft: "1px solid #e5e7eb",
        // make sidebar stick to viewport when scrolling
        position: "sticky",
        top: "64px",
        height: "auto",
        maxHeight: "calc(100vh - 80px)",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
      }}
    >
      {isOpen ? (
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderBottom: "1px solid #e5e7eb" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FavoriteIcon sx={{ color: "#115E59" }} />
              <Typography sx={{ fontWeight: 700, fontSize: "1.0rem" }}>Additional Information</Typography>
            </Box>
            <Tooltip title="Collapse" arrow>
              <IconButton onClick={onToggle} size="small">
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
            <PreviousAppointments patientId={patientId} />
            <Attachments patientId={patientId} />
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
            <FavoriteIcon sx={{ color: "#115E59" }} />
          </Box>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Tooltip title="Expand" arrow>
              <IconButton onClick={onToggle} size="small">
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DiagnosisRightSidebar;
