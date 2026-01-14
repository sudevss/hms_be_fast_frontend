import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [previewName, setPreviewName] = useState("");

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
      }

      const url = URL.createObjectURL(new Blob([res], { type: mimeType }));
      setPreviewUrl(url);
      setPreviewType(mimeType);
      setPreviewName(variables.filename || "File");
      setPreviewOpen(true);
    },
    onError: (error) => {
      console.error("View error:", error);
    },
  });

  const handleRowClick = (report) => {
    const { filename, ...payload } = report;
    mutationFileView.mutate({ ...payload, filename });
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewType(null);
    setPreviewName("");
  };

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
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
                
                return (
                  <TableRow 
                    key={rep.upload_id || `${name}-${dateStr}`}
                    onClick={() => handleRowClick(rep)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        backgroundColor: 'rgba(35, 35, 35, 0.08)'
                      }
                    }}
                  >
                    <TableCell>{dateStr}</TableCell>
                    <TableCell>{category}</TableCell>
                    <TableCell>{name}</TableCell>
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

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#f8f6f6ff',
            minHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#000000ff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="h6">{previewName}</Typography>
          <IconButton 
            onClick={handleClosePreview} 
            sx={{ color: '#14b8a6' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {previewUrl && previewType && (
            previewType.startsWith('image/') ? (
              <img 
                src={previewUrl} 
                alt={previewName}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '75vh',
                  objectFit: 'contain'
                }}
              />
            ) : previewType === 'application/pdf' ? (
              <iframe
                src={previewUrl}
                title={previewName}
                style={{
                  width: '100%',
                  height: '75vh',
                  border: 'none'
                }}
              />
            ) : (
              <Typography sx={{ color: '#000000ff', p: 3 }}>
                Preview not available for this file type.
              </Typography>
            )
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Attachments;