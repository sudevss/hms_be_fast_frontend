import {
  Box,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HistoryIcon from "@mui/icons-material/History";
import AttachFileIcon from "@mui/icons-material/AttachFile";

import PreviousAppointments from "./PreviousAppointments";
import Attachments from "./Attachments";

const COLLAPSED_WIDTH = 64;
const ICON_COLOR = "#14b8a6";

const DiagnosisRightSidebar = ({ isOpen, onToggle, patientId }) => {
  return (
    <Box
      sx={{
        width: isOpen
          ? { xs: "85vw", sm: "75vw", md: "40vw", lg: "35vw", xl: "28vw" }
          : COLLAPSED_WIDTH,
        backgroundColor: "#000",
        transition: "width 0.3s ease",
        color: "#fff",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
        position: "sticky",
        top: "64px",
        maxHeight: "calc(100vh - 80px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isOpen ? (
        /** ---------------- EXPANDED SIDEBAR ---------------- **/
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* HEADER */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FavoriteIcon sx={{ color: ICON_COLOR }} />
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                Additional Information
              </Typography>
            </Box>

            <IconButton onClick={onToggle} sx={{ color: ICON_COLOR }}>
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {/* CONTENT AREA */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {/* Previous Appointments */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <HistoryIcon sx={{ color: ICON_COLOR }} />
              <Typography sx={{ fontWeight: 600 }}>
                Previous Appointments
              </Typography>
            </Box>
            <PreviousAppointments patientId={patientId} />

            {/* Attachments */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 3, mb: 1 }}>
              <AttachFileIcon sx={{ color: ICON_COLOR }} />
              <Typography sx={{ fontWeight: 600 }}>
                Attachments
              </Typography>
            </Box>
            <Attachments patientId={patientId} />
          </Box>
        </Box>
      ) : (
        /** ---------------- COLLAPSED SIDEBAR ---------------- **/
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 2,
          }}
        >
          <Tooltip title="Additional Information">
            <IconButton sx={{ color: ICON_COLOR, mb: 3 }} onClick={onToggle}>
              <FavoriteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Previous Appointments">
            <IconButton sx={{ color: ICON_COLOR, mb: 3 }} onClick={onToggle}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Attachments">
            <IconButton sx={{ color: ICON_COLOR, mb: 3 }} onClick={onToggle}>
              <AttachFileIcon />
            </IconButton>
          </Tooltip>

          {/* Push expand button to bottom */}
          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="Expand">
            <IconButton sx={{ color: ICON_COLOR }} onClick={onToggle}>
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default DiagnosisRightSidebar;
