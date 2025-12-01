import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dayjs } from "@/utils/dateUtils";
import { getAppointmentsAndBookings, getPatientDiagnosis } from "@/serviceApis";

const PreviousAppointments = ({ patientId }) => {
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
      if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== "") return obj[k];
    }
    return undefined;
  };

  const [enrichedRows, setEnrichedRows] = useState([]);
  const [enriching, setEnriching] = useState(false);

  useEffect(() => {
    let mounted = true;
    const rows = Array.isArray(data) ? data : [];
    if (!patientId || rows.length === 0) {
      setEnrichedRows([]);
      return () => { mounted = false; };
    }

    const run = async () => {
      setEnriching(true);
      try {
        const full = await Promise.all(
          rows.map(async (row) => {
            let chief = getField(row, [
              "chief_complaint",
              "chiefComplaint",
              "diagnosis_chief_complaint",
            ]);
            if (!chief && row?.diagnosis_id && row?.doctor_id) {
              try {
                const resp = await getPatientDiagnosis({
                  patient_id: patientId,
                  doctor_id: row?.doctor_id,
                  diagnosis_id: row?.diagnosis_id,
                  facility_id: row?.facility_id || 1,
                });
                const diag = Array.isArray(resp) ? resp[0] : undefined;
                chief = diag?.chief_complaint || diag?.chiefComplaint || chief;
              } catch (e) {
                // ignore
              }
            }
            return { ...row, _chief: chief ?? "-" };
          })
        );
        if (mounted) setEnrichedRows(full);
      } finally {
        if (mounted) setEnriching(false);
      }
    };

    run();
    return () => { mounted = false; };
  }, [data, patientId]);

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
      <Typography sx={{ fontWeight: 700, fontSize: "1.0rem", mb: 1 }}>
        Previous Appointments
      </Typography>
      <Paper variant="outlined" sx={{ width: "100%" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Chief Complaint</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading || enriching ? (
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography variant="body2">Loading…</Typography>
                </TableCell>
              </TableRow>
            ) : Array.isArray(enrichedRows) && enrichedRows.length > 0 ? (
              enrichedRows.map((row) => {
                const rawDate = getField(row, ["date", "appointment_date"]);
                const dateStr = rawDate ? dayjs(rawDate).format("DD-MM-YYYY") : "-";
                const chief = row?._chief ?? "-";
                return (
                  <TableRow key={row.appointment_id || row.id || `${dateStr}-${chief}`}>
                    <TableCell>{dateStr}</TableCell>
                    <TableCell>{chief}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography variant="body2">No previous appointments</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default PreviousAppointments;
