import React, { useEffect, useState, useRef } from "react";
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
  Chip,
  TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import StyledButton from "@components/StyledButton";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import PrintIcon from "@mui/icons-material/Print";
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
import DialogMessage from "@components/DialogMessage";

const PatientReports = ({
  open,
  setOpen,
  patientReportsObj,
  setPatientReportObj,
}) => {
  const queryClient = useQueryClient();
  const printIframeRef = useRef(null);

  const { showAlert, setShowAlert, onResetAlert } = useShowAlert();
  const [downloadFileObj, setDownloadFileObj] = useState("");

  const [files, setFiles] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedName, setEditedName] = useState("");
  const blobCacheRef = useRef(new Map());

  const queryGetPatientReports = useQuery({
    queryKey: ["queryGetPatientReports", { ...patientReportsObj }],
    queryFn: () => getPatientReports({ ...patientReportsObj }),
    enabled: patientReportsObj?.patient_id ? true : false,
  });

  console.log(patientReportsObj)

  const getFileExtension = (filename) => {
    const extension = filename.split('.').pop().toUpperCase();
    return extension;
  };

  const getFileName = (filename) => {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
  };

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

  const handlePrint = (response, filename) => {
    if (!response) return;

    const extension = getFileExtension(filename).toLowerCase();
    let mimeType = 'application/octet-stream';
    if (extension === 'pdf') {
      mimeType = 'application/pdf';
    } else if (extension === 'jpg' || extension === 'jpeg') {
      mimeType = 'image/jpeg';
    } else if (extension === 'png') {
      mimeType = 'image/png';
    } // Add more if needed

    const url = URL.createObjectURL(new Blob([response], { type: mimeType }));
    const iframe = printIframeRef.current;
    if (iframe) {
      iframe.src = url;
      iframe.onload = () => {
        try {
          iframe.contentWindow.print();
        } catch (error) {
          console.error("Print failed:", error);
          setShowAlert({
            show: true,
            message: `Print failed. Please try downloading the file and printing manually.`,
            status: "error",
          });
        }
      };
    }
  };

  const mutationFileDownload = useMutation({
    mutationFn: (payload) => getPatientReportFileDownload({ ...payload }),
    onSuccess: (res) => {
      handleDownload(res);
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

  const mutationFilePrint = useMutation({
    mutationFn: (payload) => getPatientReportFileDownload({ ...payload }),
    onSuccess: (res, variables) => {
      handlePrint(res, variables.filename);
    },
    onError: (error) => {
      console.error("Print error:", error);
      setShowAlert({
        show: true,
        message: `Print failed!!`,
        status: "error",
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

  const handleEditStart = (index, currentName) => {
    setEditingIndex(index);
    setEditedName(getFileName(currentName));
  };

  const handleEditSave = (index) => {
    if (editedName.trim()) {
      setFiles((prev) => prev.map((file, i) => {
        if (i === index) {
          const extension = getFileExtension(file.name);
          const newFileName = `${editedName.trim()}.${extension.toLowerCase()}`;
          return new File([file], newFileName, { type: file.type });
        }
        return file;
      }));
    }
    setEditingIndex(null);
    setEditedName("");
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditedName("");
  };

  useEffect(() => {
    onResetAlert();
  }, [open]);

  const reportsData = queryGetPatientReports?.data || [];

  useEffect(() => {
    if (!open) {
      blobCacheRef.current.forEach((v) => {
        try { URL.revokeObjectURL(v?.url); } catch (e) {}
      });
      blobCacheRef.current.clear();
      return;
    }
    if (Array.isArray(reportsData) && reportsData.length > 0) {
      const subset = reportsData.slice(0, 5);
      subset.forEach(({ filename, upload_id }) => {
        if (!blobCacheRef.current.has(upload_id)) {
          getPatientReportFileDownload({
            patient_id: patientReportsObj?.patient_id,
            facility_id: patientReportsObj?.facility_id || "1",
            upload_id,
          }).then((res) => {
            const ext = getFileExtension(filename).toLowerCase();
            let mime = "application/octet-stream";
            if (ext === "pdf") mime = "application/pdf";
            else if (ext === "jpg" || ext === "jpeg") mime = "image/jpeg";
            else if (ext === "png") mime = "image/png";
            const url = URL.createObjectURL(new Blob([res], { type: mime }));
            blobCacheRef.current.set(upload_id, { blob: res, url, mime, filename });
          }).catch(() => {});
        }
      });
    }
  }, [open, reportsData, patientReportsObj]);

  if (!patientReportsObj?.diagnosis_id && patientReportsObj?.appointment_id) {
    return (
      <DialogMessage
        messageType={open ? "Warning" : ""}
        message="You can upload reports only after adding a diagnosis. Please add a diagnosis first."
        setMessageType={() => setOpen(false)}
        handleOnClose={() => {
          setOpen(false);
          onResetAlert();
          setPatientReportObj("");
        }}
      />
    );
  }

  return (
    <>
      <iframe
        ref={printIframeRef}
        style={{ display: 'none' }}
        title="Print Frame"
      />
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
            alignItems: "flex-start",
          },
          "& .MuiPaper-root": {
            mt: 10,
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
              <Box display="flex" alignItems="center" gap={1}>
                <InsertDriveFileIcon sx={{ mr: 1 }} color="action" />
                <Box display="flex" flexDirection="column">
                  <Typography variant="body2" fontWeight="500">
                    {getFileName(filename)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Chip 
                      label={getFileExtension(filename)} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {date} • {(file_size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box>
                <Tooltip title="Download">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      const cached = blobCacheRef.current.get(reportObj?.upload_id);
                      setDownloadFileObj({ ...reportObj, filename });
                      if (cached?.blob) {
                        handleDownload(cached.blob);
                      } else {
                        mutationFileDownload.mutate(reportObj);
                      }
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      const cached = blobCacheRef.current.get(reportObj?.upload_id);
                      if (cached?.blob) {
                        handlePrint(cached.blob, filename);
                      } else {
                        mutationFilePrint.mutate({ ...reportObj, filename });
                      }
                    }}
                  >
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                {!reportObj?.upload_id && (
                  <Tooltip title="Remove">
                    <IconButton color="error" onClick={handleRemove}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
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
                <input type="file" hidden multiple accept="image/png,image/jpeg,application/pdf" onChange={handleFileChange} />
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
                    <Box display="flex" alignItems="center" gap={1} flex={1}>
                      <InsertDriveFileIcon sx={{ mr: 1 }} color="action" />
                      <Box display="flex" flexDirection="column" flex={1}>
                        {editingIndex === index ? (
                          <TextField
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            size="small"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleEditSave(index);
                              }
                            }}
                            sx={{ mb: 0.5 }}
                          />
                        ) : (
                          <Typography variant="body2" fontWeight="500">
                            {getFileName(file.name)}
                          </Typography>
                        )}
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Chip 
                            label={getFileExtension(file.name)} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024).toFixed(2)} KB
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box display="flex">
                      {editingIndex === index ? (
                        <>
                          <Tooltip title="Save">
                            <IconButton
                              color="success"
                              onClick={() => handleEditSave(index)}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton
                              color="default"
                              onClick={handleEditCancel}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Edit Name">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditStart(index, file.name)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton
                              color="error"
                              onClick={() => handleRemove(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
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
            </StyledButton>
          )}
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
    </>
  );
};

PatientReports.displayName = 'PatientReports';

export default PatientReports;
