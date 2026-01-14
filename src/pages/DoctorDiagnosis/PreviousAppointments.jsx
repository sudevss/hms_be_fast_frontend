import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { dayjs } from "@/utils/dateUtils";
import { getAppointmentsAndBookings, getPatientDiagnosisById, getPatientDiagnosis, getAppointmentDetailsById } from "@/serviceApis";

const PreviousAppointments = ({ patientId, currentAppointmentDate }) => {
  const startDate = dayjs().subtract(12, "month").format("YYYY-MM-DD");
  const endDate = dayjs().format("YYYY-MM-DD");

  const { data = [], isLoading } = useQuery({
    queryKey: [
      "queryGetAppointmentsAndBookings",
      startDate,
      endDate,
      patientId,
      "Completed",
    ],
    queryFn: () =>
      getAppointmentsAndBookings({
        date: startDate,
        end_date: endDate,
        appointment_status: "Completed",
        facility_id: 1,
        patient_id: patientId,
      }),
    enabled: Boolean(patientId),
  });

  const getField = (obj, keys) => {
    for (const k of keys) {
      if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== "")
        return obj[k];
    }
    return undefined;
  };
  const extractChief = (src) =>
    getField(src, [
      "chief_complaint",
      "chiefComplaint",
      "diagnosis_chief_complaint",
      "chief_complaints",
      "chiefComplaints",
      "reason",
      "complaint",
    ]);
  const extractSymptomsText = (diag) => {
    try {
      const arr = diag?.symptoms || diag?.diagnosis_symptoms || [];
      if (!Array.isArray(arr) || arr.length === 0) return "";
      const names = arr
        .map((s) => s?.symptom_name || s?.name || "")
        .filter(Boolean);
      return names.length ? names.join(", ") : "";
    } catch {
      return "";
    }
  };

  const [enrichedRows, setEnrichedRows] = useState([]);
  const [enriching, setEnriching] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  /** ---------------------------------------------
   * Load appointments + fetch chief complaint if needed
   * --------------------------------------------- */
  useEffect(() => {
    let mounted = true;
    const rows = Array.isArray(data) ? data : [];

    if (!patientId || rows.length === 0) {
      setEnrichedRows([]);
      return () => {
        mounted = false;
      };
    }

    const run = async () => {
      setEnriching(true);
      try {
        const full = await Promise.all(
          rows.map(async (row) => {
            let chief = (extractChief(row) || "").trim();

            if (!chief && row?.diagnosis_id) {
              try {
                const result = await getPatientDiagnosisById({
                  diagnosis_id: row?.diagnosis_id,
                });
                const diag = Array.isArray(result) ? result[0] : result;
                chief = (extractChief(diag) || extractSymptomsText(diag) || chief || "").trim();
              } catch (e) {
                // ignore
              }
            }

            if (!chief && row?.diagnosis_id && (row?.patient_id || patientId) && row?.doctor_id) {
              try {
                const resp = await getPatientDiagnosis({
                  patient_id: row?.patient_id || patientId,
                  doctor_id: row?.doctor_id,
                  diagnosis_id: row?.diagnosis_id,
                  facility_id: row?.facility_id || 1,
                });
                const diag2 = Array.isArray(resp) ? resp[0] : resp;
                chief = (extractChief(diag2) || extractSymptomsText(diag2) || chief || "").trim();
              } catch (e) {
                // ignore
              }
            }

            if (!chief && row?.appointment_id && row?.facility_id) {
              try {
                const appt = await getAppointmentDetailsById({
                  appointment_id: row.appointment_id,
                  facility_id: row.facility_id,
                });
                const a = Array.isArray(appt) ? appt[0] : appt;
                chief = (extractChief(a) || chief || "").trim();
              } catch (e) {
                // ignore
              }
            }

            return { ...row, _chief: chief || "-" };
          })
        );

        if (mounted) {
          const filtered = currentAppointmentDate
            ? full.filter((row) => {
                const rowDate = getField(row, ["date", "appointment_date"]);
                return (
                  rowDate &&
                  dayjs(rowDate).isBefore(dayjs(currentAppointmentDate, "DD/MM/YY"))
                );
              })
            : full;

          setEnrichedRows(filtered);
        }
      } finally {
        if (mounted) setEnriching(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [data, patientId, currentAppointmentDate]);

  if (!patientId) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          No patient selected
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "1.25rem",
          mb: 2,
          color: "#374151",
        }}
      >
      </Typography>

      {/* ---------------- TABLE ---------------- */}
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Table
          size="small"
          sx={{ "& .MuiTableCell-root": { borderBottom: "none" } }}
        >
          <TableHead sx={{ bgcolor: "#f9fafb" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                Chief Complaint
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                Doctor
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading || enriching ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    Loading…
                  </Typography>
                </TableCell>
              </TableRow>
            ) : enrichedRows.length > 0 ? (
              enrichedRows.map((row) => {
                const rawDate = getField(row, ["date", "appointment_date"]);
                const dateStr = rawDate
                  ? dayjs(rawDate).format("DD-MM-YYYY")
                  : "-";

                const chief = row?._chief ?? "-";
                const doctor =
                  getField(row, ["doctor_name", "doctor"]) ?? "-";
                const status =
                  getField(row, ["appointment_status", "status"]) ?? "-";

                return (
                  <TableRow
                    key={row.appointment_id || row.id || `${dateStr}-${chief}`}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#f3f4f6" },
                    }}
                    hover
                    onClick={() => setSelectedAppointment(row)}
                  >
                    <TableCell>{dateStr}</TableCell>
                    <TableCell>{chief}</TableCell>
                    <TableCell>{doctor}</TableCell>
                    <TableCell>
                      <Chip
                        label={status}
                        size="small"
                        color={
                          status === "Completed" ? "success" : "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    No previous appointments
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* ---------------- POPUP ---------------- */}
      <Dialog
        open={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        fullWidth
        maxWidth="sm"
        sx={{ "& .MuiDialog-paper": { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#e8f5e8",
            position: "relative",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Appointment Details
          </Typography>

          <IconButton
            onClick={() => setSelectedAppointment(null)}
            sx={{ position: "absolute", right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {selectedAppointment && (
            <Box>
              {/* ---------------- SUMMARY TABLE ---------------- */}
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Summary
              </Typography>

              <Table
                size="small"
                sx={{
                  mb: 3,
                  border: "1px solid #e5e7eb",
                  "& .MuiTableCell-root": {
                    border: "1px solid #e5e7eb",
                    textAlign: "center",
                  },
                }}
              >
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f9fafb" }}>
                      Date
                    </TableCell>
                    <TableCell>
                      {getField(selectedAppointment, [
                        "date",
                        "appointment_date",
                      ])
                        ? dayjs(
                            getField(selectedAppointment, [
                              "date",
                              "appointment_date",
                            ])
                          ).format("DD-MM-YYYY")
                        : "-"}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f9fafb" }}>
                      Chief Complaint
                    </TableCell>
                    <TableCell>{selectedAppointment._chief}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f9fafb" }}>
                      Doctor
                    </TableCell>
                    <TableCell>
                      {getField(selectedAppointment, [
                        "doctor_name",
                        "doctor",
                      ])}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f9fafb" }}>
                      Status
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          getField(selectedAppointment, [
                            "appointment_status",
                            "status",
                          ]) ?? "-"
                        }
                        size="small"
                        color={
                          getField(selectedAppointment, [
                            "appointment_status",
                            "status",
                          ]) === "Completed"
                            ? "success"
                            : "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* ---------------- ADDITIONAL DETAILS ---------------- */}
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Additional Details
              </Typography>

              <Table
                size="small"
                sx={{
                  border: "1px solid #e5e7eb",
                  "& .MuiTableCell-root": {
                    border: "1px solid #e5e7eb",
                    textAlign: "center",
                  },
                }}
              >
                <TableBody>
                  {/* Token ID */}
                  {selectedAppointment.token_id && (
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          bgcolor: "#f9fafb",
                          width: "30%",
                        }}
                      >
                        Token ID
                      </TableCell>
                      <TableCell>{selectedAppointment.token_id}</TableCell>
                    </TableRow>
                  )}

                  {/* Name */}
                  {selectedAppointment.name && (
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          bgcolor: "#f9fafb",
                          width: "30%",
                        }}
                      >
                        Name
                      </TableCell>
                      <TableCell>{selectedAppointment.name}</TableCell>
                    </TableRow>
                  )}

                  {/* Doctor ID */}
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        bgcolor: "#f9fafb",
                        width: "30%",
                      }}
                    >
                      Doctor ID
                    </TableCell>
                    <TableCell>
                      {selectedAppointment.doctor_id ?? "-"}
                    </TableCell>
                  </TableRow>

                  {/* Diagnosis ID */}
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        bgcolor: "#f9fafb",
                        width: "30%",
                      }}
                    >
                      Diagnosis ID
                    </TableCell>
                    <TableCell>
                      {selectedAppointment.diagnosis_id ?? "-"}
                    </TableCell>
                  </TableRow>

                  {/* Remaining fields */}
                  {Object.entries(selectedAppointment)
                    .filter(
                      ([key]) =>
                        ![
                          "date",
                          "appointment_date",
                          "_chief",
                          "doctor_name",
                          "doctor",
                          "appointment_status",
                          "status",
                          "token_id",
                          "name",
                          "time_slot",
                          "dcid",
                          "doctor_id",
                          "diagnosis_id",
                          "facility_id",
                          "payment_comments",
                          "is_review"
                        ].includes(key)
                    )
                    .map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            bgcolor: "#f9fafb",
                            width: "30%",
                          }}
                        >
                          {key === "paid"
                            ? "Payment"
                            : key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                          }

                        </TableCell>

                        <TableCell>
                          {key === "checkin_time" && value
                            ? `${dayjs.utc(value).tz("Asia/Kolkata").format("DD-MM-YYYY")}   ${dayjs
                                .utc(value)
                                .tz("Asia/Kolkata")
                                .format("hh:mm A")}`
                            : key === "paid"
                            ? value === true
                              ? "Paid"
                              : "Unpaid"
                            : String(value)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PreviousAppointments;
