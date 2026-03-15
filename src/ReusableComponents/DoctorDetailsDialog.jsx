import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Grid, Box, IconButton, Accordion, AccordionSummary, AccordionDetails, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StyledButton from "@/components/StyledButton";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useQuery } from "@tanstack/react-query";
import { getDoctorSheduleDetails } from "@/serviceApis";
import { sortQualifications } from "@data/staticData";

const labelSx = { color: "#6b7280", fontWeight: 600, textTransform: "uppercase", textAlign: "center", fontSize: "0.95rem" };
const valueSx = { color: "#111827", fontWeight: 600, textAlign: "center", fontSize: "1.05rem" };

const Field = ({ label, value, isEmpty }) => (
  <Box>
    <Typography variant="caption" sx={labelSx}>{label}</Typography>
    <Box sx={{ height: 6 }} />
    <Typography
      variant="body1"
      sx={isEmpty ? { ...valueSx, color: "text.disabled" } : valueSx}
    >
      {value ?? "-"}
    </Typography>
  </Box>
);

const DoctorDetailsDialog = ({ open, onClose, doctor, onEdit, onEditSchedule }) => {
  if (!doctor) return null;

  const { data: schedule = {}, isLoading: isScheduleLoading } = useQuery({
    queryKey: ["queryGetDoctorSheduleDetails", doctor?.id],
    queryFn: () => getDoctorSheduleDetails({ facility_id: "1", doctor_id: doctor.id }),
    enabled: open && Boolean(doctor?.id),
  });

  return (
    <Dialog open={open} fullWidth maxWidth="lg">
      <DialogTitle sx={{ fontWeight: 700, textAlign: "center", fontSize: "1.2rem" }}>
        Doctor Information
      </DialogTitle>

      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: 12, top: 12 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        <Box sx={{ borderRadius: 3, border: "1px solid #e5e7eb", p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Doctor Details
            </Typography>

          <IconButton
            onClick={() => onEdit(doctor)}
            aria-label="Edit Doctor"
            size="small"
          >
            <EditOutlinedIcon sx={{color: "#115E59", fontSize: "1.65rem"}} />
          </IconButton>
        </Box>

          <Grid container spacing={3} textAlign="center">
            <Grid item xs={6} md={3}><Field label="Doctor ID" value={doctor.id} /></Grid>
            <Grid item xs={6} md={3}><Field label="Name" value={doctor.doctor_name} /></Grid>
            <Grid item xs={6} md={3}><Field label="Age" value={doctor.age} /></Grid>
            <Grid item xs={6} md={3}><Field label="Gender" value={doctor.gender} /></Grid>
            <Grid item xs={6} md={3}><Field label="Mobile" value={doctor.phone_number} /></Grid>
            <Grid item xs={6} md={3}><Field label="Email" value={doctor.email} /></Grid>
            <Grid item xs={6} md={3}><Field label="Specialization" value={doctor.specialization} /></Grid>
            <Grid item xs={6} md={3}><Field label="Consultation Fee" value={doctor.consultation_fee} /></Grid>
            <Grid item xs={6} md={3}><Field label="Experience" value={doctor.experience} /></Grid>
            <Grid item xs={6} md={3}><Field label="ABDM_NHPR_id" value={doctor.ABDM_NHPR_id} /></Grid>
            <Grid item xs={6} md={3}>
              <Field
                label="Reg. No."
                value={doctor.registration_number || "Enter details"}
                isEmpty={!doctor.registration_number}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Field
                label="Qualification"
                value={sortQualifications(doctor.qualification) || "Enter details"}
                isEmpty={!sortQualifications(doctor.qualification)}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Accordion defaultExpanded sx={{ borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, flexGrow: 1, fontSize: "1.1rem" }}>
                Doctor Schedule
              </Typography>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSchedule && onEditSchedule(doctor);
                }}  
                onFocus={(e) => e.stopPropagation()}
                aria-label="Edit Doctor Schedule"
              >
                <EditOutlinedIcon sx={{color: "#115E59", fontSize: "1.65rem"}} />
              </IconButton>
            </AccordionSummary>

            <AccordionDetails>
              {isScheduleLoading ? (
                <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>Loading schedule…</Typography>
              ) : schedule?.weekDaysList && schedule.weekDaysList.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {schedule.weekDaysList.map((day) => (
                    <Accordion key={day.weekDay} sx={{ borderRadius: 1, border: "1px solid #e5e7eb", boxShadow: "none" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}> 
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{day.weekDay}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {(() => {
                          const filledSlots = (day.slotWeeks || []).filter(
                            (slot) => Boolean(slot?.windowNum || (slot?.startTime && slot?.endTime))
                          );
                          return filledSlots.length > 0 ? (
                            <Grid container spacing={1}>
                              {filledSlots.map((slot, idx) => (
                              <Grid item key={idx} xs={12} md={6}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1 }}>
                                  <Chip label={`Start: ${slot.startTime}`} size="medium" sx={{ fontSize: "1rem", height: 32 }} />
                                  <Chip label={`End: ${slot.endTime}`} size="medium" sx={{ fontSize: "1rem", height: 32 }} />
                                  <Chip label={`Slots: ${slot.totalSlots}`} size="medium" sx={{ fontSize: "1rem", height: 32 }} />
                                </Box>
                              </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>No slots</Typography>
                          );
                        })()}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "#000000ff", textAlign: "center", fontSize: "1.0rem" }}>No schedule found</Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center" }}>
        <StyledButton variant="outlined" onClick={onClose}>Close</StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorDetailsDialog;
