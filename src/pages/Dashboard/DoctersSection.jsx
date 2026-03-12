import {
  Box,
  IconButton,
  Stack,
  Typography,
  Radio,
  useTheme,
  useMediaQuery,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  // RestartAlt,
} from "lucide-react";
import { useState } from "react";
import { useDashboardStore } from "@/stores/dashboardStore";
import SearchTextInput from "@components/inputs/SearchTextInput";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

function DoctorsSection({ filteredDoctors = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    setdoctor_id,
    doctor_id: doctorId,
    doctorSearch,
    setDoctorSearch,
  } = useDashboardStore();


  const handleReset = () => {
    setDoctorSearch("");
    setdoctor_id("");
  };

  return (
    <Box
      sx={{
        width: "100%",
        transition: "width 0.35s ease-in-out",
        backgroundColor: "#fff",
        // borderLeft: "1px solid #e5e7eb",
        // borderRadius: expanded ? "0" : "8px 0 0 8px",
        height: "100%",
        display: "flex",
        // width: "90vw",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Expand/Collapse Toggle */}
      {/* <Tooltip title={expanded ? "Collapse" : "Expand"} placement="left">
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{
            position: "absolute",
            left: expanded ? -20 : "auto",
            right: expanded ? "auto" : -20,
            top: 10,
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            "&:hover": { backgroundColor: theme.palette.primary.dark },
            transition: "all 0.3s ease",
            zIndex: 2,
          }}
          size="small"
        >
          {expanded ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </IconButton>
      </Tooltip> */}

      {/* Collapsible Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          p: 1,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          textAlign="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          {/* Search Box */}
            <SearchTextInput
              name="doctorSearch"
              placeholder="Search doctors..."
              value={doctorSearch}
              onChange={(val) => setDoctorSearch(val)}
              sx={{ width: "78%" }}
            />
          <Tooltip title="Reset Filter">
            <IconButton
              size="small"
              onClick={handleReset}
              sx={{
                color: theme.palette.grey[700],
                "&:hover": { backgroundColor: theme.palette.action.hover },
              }}
            >
              <RestartAltIcon  />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Doctor List */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 0.5,
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#ccc",
              borderRadius: "6px",
            },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#999" },
          }}
        >
          {filteredDoctors.length === 0 ? (
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              No doctors found
            </Typography>
          ) : (
            filteredDoctors.map(
              (
                {
                  doctor_id,
                  name,
                  specialization,
                  total_slots,
                  available_slots,
                  status,
                },
                index
              ) => (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="flex-start"
                  sx={{
                    pr: 1.2,
                    mb: 1,
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    backgroundColor:
                      doctorId === doctor_id
                        ? theme.palette.primary.light
                        : "transparent",
                    "&:hover": { backgroundColor: theme.palette.action.hover },
                  }}
                  onClick={() => setdoctor_id(doctor_id)}
                >
                  {/* Doctor Info */}
                  <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                    <Radio
                      checked={doctorId === doctor_id}
                      onChange={() => setdoctor_id(doctor_id)}
                      size={isMobile ? "small" : "medium"}
                      sx={{ mt: 0.5 }}
                    />
                    <Stack spacing={0.3} sx={{ flex: 1, minWidth: 0 }}>
                      {/* Name + Status on same row */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          }}
                        >
                          {name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            flexShrink: 0,
                            color:
                              status === "On Duty"
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {status}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {specialization || "—"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        Total Slots: {total_slots ?? 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        Available: {available_slots ?? 0}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              )
            )
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default DoctorsSection;
