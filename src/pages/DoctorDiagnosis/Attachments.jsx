import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Link } from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { dayjs } from "@/utils/dateUtils";
import { getPatientReports, getPatientReportFileDownload } from "@/serviceApis";

const pick = (obj, keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== "") return obj[k];
  }
  return undefined;
};

const deriveCategory = (report) => {
  const byField = pick(report, ["category", "report_category", "report_type"]);
  if (byField) return byField;
  const name = (report?.filename || "").toLowerCase();
  if (name.includes("xray") || name.includes("xr")) return "X-Ray";
  if (name.includes("lab") || name.includes("test")) return "Lab Results";
  if (name.endsWith(".dcm")) return "X-Ray";
  if (name.endsWith(".pdf")) return "Document";
  if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg")) return "Image";
  return "Attachment";
};

const Attachments = ({ patientId }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["queryGetPatientReports", patientId],
    queryFn: () => getPatientReports({ patient_id: patientId, facility_id: "1" }),
    enabled: Boolean(patientId),
  });

  const mutationFileView = useMutation({
    mutationFn: (payload) => getPatientReportFileDownload({ ...payload }),
    onSuccess: (res, variables) => {
      const extension = (variables.filename || "").split('.').pop().toLowerCase();
      let mimeType = 'application/octet-stream';
      if (extension === 'pdf') {
        mimeType = 'application/pdf';
      } else if (extension === 'jpg' || extension === 'jpeg') {
        mimeType = 'image/jpeg';
      } else if (extension === 'png') {
        mimeType = 'image/png';
      } // Add more if needed

      const url = URL.createObjectURL(new Blob([res], { type: mimeType }));
      window.open(url, '_blank');
    },
    onError: (error) => {
      console.error("View error:", error);
      // Optionally show an alert or handle error
    },
  });

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "1.0rem", mb: 1 }}>
        Attachments
      </Typography>
      <Paper variant="outlined" sx={{ width: "100%" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Attachment Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Attachment Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="body2">Loading…</Typography>
                </TableCell>
              </TableRow>
            ) : Array.isArray(data) && data.length > 0 ? (
              data.map((rep) => {
                const dateStr = pick(rep, ["date", "report_date"]) ? dayjs(pick(rep, ["date", "report_date"])).format("DD-MM-YYYY") : "-";
                const category = deriveCategory(rep);
                const name = rep?.filename || rep?.name || "-";
                const { filename, ...payload } = rep;
                return (
                  <TableRow key={rep.upload_id || `${name}-${dateStr}`}>
                    <TableCell>{dateStr}</TableCell>
                    <TableCell>{category}</TableCell>
                    <TableCell>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => mutationFileView.mutate({ ...payload, filename })}
                        sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        {name}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="body2">No attachments found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default Attachments;