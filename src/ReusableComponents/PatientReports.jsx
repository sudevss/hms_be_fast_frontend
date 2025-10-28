import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  IconButton,
  Divider,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import StyledButton from "@components/StyledButton";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getPatientReportFileDownload,
  getPatientReports,
  uploadPatientReportFiles,
} from "@/serviceApis";
import PageLoader from "@pages/PageLoader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import AlertSnackbar from "@components/AlertSnackbar";
import { INITIAL_SHOW_ALERT } from "@data/staticData";
import { useShowAlert } from "@/stores/showAlertStore";

const PatientReports = ({
  open,
  setOpen,
  patientReportsObj,
  setPatientReportObj,
}) => {
  const queryClient = useQueryClient();

  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();
  const [downloadFileObj, setDownloadFileObj] = useState("");

  const [files, setFiles] = useState([]);

  const queryGetPatientReports = useQuery({
    queryKey: ["queryGetPatientReports", { ...patientReportsObj }],
    queryFn: () => getPatientReports({ ...patientReportsObj }),
    enabled: patientReportsObj?.patient_id ? true : false,
  });

  const handleDownload = (response) => {
    if (!response) return;

    const url = URL.createObjectURL(new Blob([response]));
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadFileObj.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const mutationFileDownload = useMutation({
    mutationFn: (payload) => getPatientReportFileDownload({ ...payload }),
    onSuccess: (res) => {
      setDownloadFileObj("");
      handleDownload(res);
      setShowAlert({
        show: true,
        message: `Files uploaded successfully!`,
        status: "success",
      });
      setOpen(false);
      setPatientReportObj("");
      queryClient.invalidateQueries({
        queryKey: ["queryGetPatientReports"],
        exact: false,
        refetchActive: true,
        refetchInactive: false,
      });
      setFiles([]);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      setShowAlert({
        show: true,
        message: `Files Upload failed!!`,
        status: "erro",
      });
    },
  });

  const mutationFileUpload = useMutation({
    mutationFn: () => uploadPatientReportFiles({ files, ...patientReportsObj }),
    onSuccess: (data) => {
      console.log("Upload success:", data);
      setShowAlert({
        show: true,
        message: `Files uploaded successfully!`,
        status: "success",
      });
      setOpen(false);
      setPatientReportObj("");
      queryClient.invalidateQueries({
        queryKey: ["queryGetPatientReports"],
        exact: false,
        refetchActive: true,
        refetchInactive: false,
      });
      setFiles([]);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      setShowAlert({
        show: true,
        message: `Files Upload failed!!`,
        status: "erro",
      });
    },
  });

  const handleUpload = () => {
    if (files.length > 0) {
      mutationFileUpload.mutate();
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    onResetAlert();
  }, [open]);

  const reportsData = queryGetPatientReports?.data || [];


  return (
    <Dialog
      fullWidth
      open={open || false}
      onClose={() => {
        setOpen(false);
        onResetAlert();
        setPatientReportObj("");
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        maxHeight: "calc(100% - 100px)",
        "& .MuiDialog-container": {
          alignItems: "flex-start", // Align to top
        },
        "& .MuiPaper-root": {
          mt: 10, // Add top margin
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          fontSize: "18px",
          fontWeight: "600",
          justifyContent: "center",
          display: "flex",
        }}
        id="customized-dialog-title"
      >
        Reports
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => {
          setOpen(false);
          onResetAlert();
          setPatientReportObj("");
        }}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          //   color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h5" gutterBottom>
          Existing Reports
        </Typography>
        {reportsData?.map(({ filename, date, file_size, ...reportObj }) => (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              backgroundColor: "#f5f5f5",
              p: 2,
              borderRadius: 2,
              border: "1px solid #ddd",
            }}
          >
            <Box display="flex" alignItems="center">
              <InsertDriveFileIcon sx={{ mr: 1 }} color="action" />
              <Typography variant="body2">
                {filename} {date} ({(file_size / 1024).toFixed(2)} KB)
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Download">
                <IconButton
                  color="primary"
                  onClick={() => {
                    setDownloadFileObj({ ...reportObj, filename });
                    mutationFileDownload.mutate(reportObj);
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton color="error" onClick={handleRemove}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          {patientReportsObj?.diagnosis_id && (
            <Button
              sx={{ width: "40%" }}
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Select Files
              <input type="file" hidden multiple onChange={handleFileChange} />
            </Button>
          )}
          {files.length > 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                New Reports
              </Typography>
              {files.map((file, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    backgroundColor: "#f5f5f5",
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid #ddd",
                    mb: 1,
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <InsertDriveFileIcon sx={{ mr: 1 }} color="action" />
                    <Typography variant="body2">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </Typography>
                  </Box>
                  <Tooltip title="Remove">
                    <IconButton
                      color="error"
                      onClick={() => handleRemove(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
        {patientReportsObj?.diagnosis_id && (
        <StyledButton
          variant="contained"
          disabled={mutationFileUpload.isPending || !files.length > 0}
          onClick={handleUpload}
        >
          Upload All
        </StyledButton>)}
      </DialogActions>
      <AlertSnackbar
        message={showAlert.message}
        showAlert={showAlert.show}
        severity={showAlert.status}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setShowAlert(INITIAL_SHOW_ALERT)}
      />
      <PageLoader
        show={queryGetPatientReports?.isPending || mutationFileUpload.isPending}
      />
    </Dialog>
  );
};

export default PatientReports;
