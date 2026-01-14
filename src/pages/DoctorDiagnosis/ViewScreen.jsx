import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Toolbar,
  Typography,
  TextField,
} from "@mui/material";
import { useState, useEffect, useRef, useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import { useQuery, useIsFetching, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDiagnosisStore } from "@/stores/diagnosisStore";
import { usePrescriptionStore } from "@/stores/prescriptionStore";
import { useProcedureStore } from "@/stores/procedureStore";
import { useLabTestStore } from "@/stores/labTestStore";
import { dayjs } from "@/utils/dateUtils";
import { getPatientDiagnosis, getPatientDiagnosisById, putAddPatientDiagnosis } from "@/serviceApis";
import DiagnosisSection from "./DiagnosisSection";
import PrescriptionSection from "./PrescriptionSection";
import LabTestSection from "./LabTestSection";
import ProcedureSection from "./ProcedureSection";
import StyledButton from "@components/StyledButton";
import DiagnosisRightSidebar from "./DiagnosisRightSidebar";
import templates from "@/data/templates.json";
import { usePatientDiagnosis } from "@/stores/patientStore";
import { useDoctorDiagnosisStore } from "@/stores/doctorDiagnosisStore";
import PageLoader from "@pages/PageLoader";
import AlertSnackbar from "@components/AlertSnackbar";

const labelSx = {
  color: "#6b7280",
  fontWeight: 600,
  textTransform: "uppercase",
  fontSize: "1.0rem",
};
const valueSx = { color: "#111827", fontWeight: 600, fontSize: "1.0rem" };

const Field = ({ label, value }) => (
  <Box>
    <Typography variant="caption" sx={labelSx}>
      {label}
    </Typography>
    <Box sx={{ height: 6 }} />
    <Typography variant="body1" sx={valueSx}>
      {value ?? "-"}
    </Typography>
  </Box>
);

const ViewScreen = ({ open, onClose, appointment }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, message: "", status: "success" });

  // template UI state
  const [pendingTemplateId, setPendingTemplateId] = useState("");
  const [appliedTemplate, setAppliedTemplate] = useState(null);
  const [applyTick, setApplyTick] = useState(0);

  // Track the last loaded appointment to detect changes
  const lastLoadedAppointmentRef = useRef(null);
  const dataLoadedRef = useRef(false);

  // Combined store for all diagnosis data
  const doctorDiagnosisStore = useDoctorDiagnosisStore();
  const { setDiagnosisData, getSubmissionData, setField, reset: resetDoctorStore } = doctorDiagnosisStore;
  
  // Legacy store for vitals (keeping for compatibility)
  const patientDiagnosisStore = usePatientDiagnosis();
  const {
    chief_complaint,
    vital_bp,
    vital_hr,
    vital_temp,
    height,
    weight,
    vital_spo2,
    diagnosis_id,
    onChangePatientDiagnosis,
    setPatientDiagnosis,
    onReset: resetPatientDiagnosisStore,
  } = patientDiagnosisStore;
  
  const queryClient = useQueryClient();

  // Normalize appointment properties (handle varying API/row shapes)
  const _appt = {
    appointment_id:
      appointment?.appointment_id ??
      appointment?.appointmentId ??
      appointment?.token_id ??
      appointment?.token ??
      appointment?.TokenID ??
      null,
    patient_id:
      appointment?.patient_id ??
      appointment?.PatientID ??
      appointment?.patientId ??
      null,
    doctor_id:
      appointment?.doctor_id ??
      appointment?.doctorId ??
      appointment?.doctor ??
      null,
    facility_id:
      appointment?.facility_id ??
      appointment?.facilityId ??
      1,
    diagnosis_id:
      appointment?.diagnosis_id ??
      appointment?.DiagnosisID ??
      appointment?.diagnosisId ??
      null,
  };

  // Generate a unique key for this appointment using normalized ids
  const appointmentKey = `${_appt.appointment_id ?? 'new'}_${_appt.patient_id ?? 'unknown'}`;

  // Complete reset function
  const performCompleteReset = useCallback(() => {
    console.log('🔄 Performing complete reset');
    
    dataLoadedRef.current = false;
    
    // Reset doctor diagnosis store (includes child stores)
    resetDoctorStore();
    
    // Reset patient diagnosis store
    resetPatientDiagnosisStore();
    
    // Clear template state
    setAppliedTemplate(null);
    setPendingTemplateId("");
    
    // Remove all cached diagnosis queries
    queryClient.removeQueries({
      queryKey: ["queryGetDiagnosisForViewScreen"],
    });
    
    lastLoadedAppointmentRef.current = null;
  }, [resetDoctorStore, resetPatientDiagnosisStore, queryClient]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      console.log('❌ Dialog closed - resetting all stores');
      performCompleteReset();
    }
  }, [open, performCompleteReset]);

  // Reset when appointment changes
  useEffect(() => {
    if (open && appointment) {
      const hasAppointmentChanged = lastLoadedAppointmentRef.current !== appointmentKey;
      
      if (hasAppointmentChanged) {
        console.log('🔄 Appointment changed - resetting stores', {
          old: lastLoadedAppointmentRef.current,
          new: appointmentKey
        });
        performCompleteReset();
      }
    }
  }, [open, appointmentKey, performCompleteReset]);

  const tokenNumber =
    appointment?.token_id ??
    appointment?.token ??
    appointment?.token_number ??
    "-";
  const appointmentId =
    appointment?.appointment_id ??
    appointment?.id ??
    "-";
  const patientName =
    appointment?.patient_name ??
    appointment?.name ??
    appointment?.firstname ??
    "-";
  const visitDateRaw =
    appointment?.date ?? appointment?.appointment_date;
  const visitDate = visitDateRaw ? dayjs(visitDateRaw).format("DD-MM-YYYY") : "-";

  // Initialize appointment fields in store immediately
  useEffect(() => {
    if (!open || !appointment) {
      return;
    }

    // Only initialize if this is a new/different appointment
    if (lastLoadedAppointmentRef.current === appointmentKey && dataLoadedRef.current) {
      return;
    }

    console.log('🔧 Initializing appointment fields for:', appointmentKey);
    
    // Set appointment fields synchronously
    try {
      setField("patient_id", _appt.patient_id);
      setField("doctor_id", _appt.doctor_id);
      setField("facility_id", _appt.facility_id);
      setField("appointment_id", _appt.appointment_id);
      
      console.log('✅ Appointment fields set:', {
        patient_id: _appt.patient_id,
        doctor_id: _appt.doctor_id,
        facility_id: _appt.facility_id,
        appointment_id: _appt.appointment_id
      });
      
    } catch (error) {
      console.error("❌ Error initializing store:", error);
    }
  }, [open, appointment, appointmentKey, setField, _appt.patient_id, _appt.doctor_id, _appt.facility_id, _appt.appointment_id]);

  // Fetch diagnosis - query runs when dialog opens, retries until success or data loaded
  const { 
    data: fetchedDiagnosis, 
    isLoading: isDiagLoading, 
    isFetching: isDiagFetching,
    dataUpdatedAt,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["queryGetDiagnosisForViewScreen", appointmentKey],
    queryFn: async () => {
      console.log('🔍 Fetching diagnosis for:', appointmentKey);
      
      // Get fresh values from store at query time
      const storeState = doctorDiagnosisStore.getState ? doctorDiagnosisStore.getState() : doctorDiagnosisStore;
      const patientId = storeState.patient_id ?? _appt.patient_id;
      const doctorId = storeState.doctor_id ?? _appt.doctor_id;
      const facilityId = storeState.facility_id ?? _appt.facility_id;
      
      console.log('📋 Query params:', {
        patient_id: patientId,
        doctor_id: doctorId,
        facility_id: facilityId,
        diagnosis_id: _appt.diagnosis_id
      });
      
      // If we don't have required params yet, throw error to trigger retry
      if (!_appt.diagnosis_id && (!patientId || !doctorId)) {
        console.log('⏭️ Missing params - will retry...');
        throw new Error('Missing required parameters - retrying...');
      }
      
      try {
        let result = null;

        if (_appt.diagnosis_id) {
          console.log('📋 Fetching by diagnosis_id:', _appt.diagnosis_id);
          result = await getPatientDiagnosisById({ diagnosis_id: _appt.diagnosis_id });
        } else if (patientId && doctorId) {
          console.log('📋 Fetching by patient/doctor');
          
          const response = await getPatientDiagnosis({
            patient_id: patientId,
            doctor_id: doctorId,
            facility_id: facilityId,
          });
          
          result = Array.isArray(response) ? response[0] : response;
        }

        console.log('✅ Diagnosis fetch result:', result);
        return result || null;
      } catch (error) {
        console.error("❌ Error fetching diagnosis:", error);
        if (error.response) {
          console.error("❌ Error response:", {
            status: error.response.status,
            data: error.response.data
          });
        }
        // Throw error to trigger retry mechanism
        throw error;
      }
    },
    enabled: open && !!appointment,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Keep retrying if data hasn't been loaded yet
      if (!dataLoadedRef.current && failureCount < 10) {
        console.log(`🔄 Retry attempt ${failureCount + 1}/10`);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => {
      // Start with short delays, increase gradually
      return Math.min(500 * Math.pow(1.5, attemptIndex), 3000);
    },
  });

  // Show error notification when API fails after all retries
  useEffect(() => {
    if (isError && error && open && !isDiagFetching) {
      console.error('❌ Query error after retries:', error);
      setShowAlert({
        show: true,
        message: "Failed to load existing diagnosis data. You can still enter new data.",
        status: "warning",
      });
    }
  }, [isError, error, open, isDiagFetching]);

  // Sync fetched diagnosis to stores
  useEffect(() => {
    if (!open) {
      console.log('⏸️ Skipping sync - dialog closed');
      return;
    }
    
    // Wait for query to complete
    if (isDiagLoading || isDiagFetching) {
      console.log('⏳ Still loading diagnosis data...');
      return;
    }

    // If no data and no error, it might be a new diagnosis
    if (!fetchedDiagnosis && !isError) {
      console.log('📝 No existing diagnosis found - ready for new entry');
      lastLoadedAppointmentRef.current = appointmentKey;
      dataLoadedRef.current = true;
      return;
    }

    // If we have data, sync it
    if (fetchedDiagnosis) {
      // Verify this diagnosis belongs to the current appointment
      const diagnosisAppointmentId = fetchedDiagnosis.appointment_id;
      const currentAppId = _appt.appointment_id;
      
      const shouldSync = 
        !diagnosisAppointmentId || 
        !currentAppId || 
        String(diagnosisAppointmentId) === String(currentAppId);

      if (!shouldSync) {
        console.warn('⚠️ Diagnosis appointment mismatch, skipping sync', {
          diagnosisAppointmentId,
          currentAppId
        });
        return;
      }

      console.log('📥 Syncing diagnosis to stores:', {
        diagnosis_id: fetchedDiagnosis.diagnosis_id,
        appointment_id: fetchedDiagnosis.appointment_id,
        has_vitals: !!(fetchedDiagnosis.vital_bp || fetchedDiagnosis.vital_hr)
      });

      try {
        // Update patient store (vitals and basic info)
        setPatientDiagnosis(fetchedDiagnosis);
        
        // Update doctor diagnosis store (full diagnosis data including child stores)
        setDiagnosisData(fetchedDiagnosis);
        
        // Mark this appointment as loaded and data received
        lastLoadedAppointmentRef.current = appointmentKey;
        dataLoadedRef.current = true;
        
        console.log('✅ Diagnosis synced successfully - data loaded');
      } catch (error) {
        console.error("❌ Error syncing diagnosis data:", error);
      }
    }
  }, [
    fetchedDiagnosis, 
    open,
    appointmentKey, 
    isDiagLoading, 
    isDiagFetching,
    isError,
    _appt.appointment_id,
    setPatientDiagnosis, 
    setDiagnosisData, 
    dataUpdatedAt
  ]);
  
  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (payload) => {
      console.log('💾 Submitting diagnosis:', payload);
      return putAddPatientDiagnosis(payload);
    },
    onSuccess: (res) => {
      console.log('✅ Diagnosis saved successfully:', res);
      
      setShowAlert({
        show: true,
        message: "Diagnosis saved successfully",
        status: "success",
      });

      try {
        if (res && typeof res === "object") {
          const payload = res.data ?? res;
          if (payload) {
            // Update stores with saved data
            setDiagnosisData(payload);
            setPatientDiagnosis(payload);
          }
        }
      } catch (e) {
        console.warn("⚠️ Failed to sync stores with response:", e);
      }

      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["queryGetDiagnosisForViewScreen"],
      });
      queryClient.invalidateQueries({
        queryKey: ["queryGetAppointmentsAndBookings"],
      });
    },
    onError: (error) => {
      console.error("❌ Diagnosis save error:", error);
      setShowAlert({
        show: true,
        message: "Failed to save diagnosis",
        status: "error",
      });
    },
  });
  
  const handleSubmit = async () => {
    const submissionData = getSubmissionData();

    if (!submissionData.appointment_id && appointment?.appointment_id) {
      submissionData.appointment_id = appointment.appointment_id;
    }

    if (!submissionData.diagnosis_id && fetchedDiagnosis?.diagnosis_id) {
      submissionData.diagnosis_id = fetchedDiagnosis.diagnosis_id;
    }

    if (!submissionData.followup_date || String(submissionData.followup_date).trim() === "") {
      delete submissionData.followup_date;
    }

    const invalidProcedures = (submissionData.procedures || []).filter(
      (p) => String(p.procedure_text || "").trim().length < 5
    );
    if (invalidProcedures.length > 0) {
      setShowAlert({
        show: true,
        message: "Procedure text must have at least 5 characters",
        status: "error",
      });
      return;
    }

    try {
      if (!submissionData.diagnosis_id && submissionData.appointment_id) {
        const existing = await getPatientDiagnosis({
          patient_id: submissionData.patient_id,
          doctor_id: submissionData.doctor_id,
          facility_id: submissionData.facility_id,
        });
        if (Array.isArray(existing)) {
          const found = existing.find((d) => String(d.appointment_id) === String(submissionData.appointment_id));
          if (found && found.diagnosis_id) {
            submissionData.diagnosis_id = found.diagnosis_id;
          }
        }
      }
    } catch (e) {
      console.warn("⚠️ Could not pre-check existing diagnosis:", e);
    }

    submitMutation.mutate(submissionData);
  };

  const handlePrint = () => {
    // Build HTML for each section that mirrors the section-wise print tables
    const escape = (s) => (s === null || s === undefined || s === "") ? "-" : String(s);

    const vitalsHtml = `
      <div class="section-title">Vitals</div>
      <div class="vitals-grid">
        <div><div class="field-label">Blood Pressure</div><div class="field-value">${escape(vital_bp)}</div></div>
        <div><div class="field-label">Heart Rate</div><div class="field-value">${escape(vital_hr)}</div></div>
        <div><div class="field-label">Temperature</div><div class="field-value">${escape(vital_temp)}</div></div>
        <div><div class="field-label">Height</div><div class="field-value">${escape(height)}</div></div>
        <div><div class="field-label">Weight</div><div class="field-value">${escape(weight)}</div></div>
        <div><div class="field-label">SPO2</div><div class="field-value">${escape(vital_spo2)}</div></div>
      </div>
    `;

    const complaintsHtml = `
      <div class="section-title">Chief Complaints</div>
      <div class="field-value">${escape(chief_complaint)}</div>
    `;

    const diagRows = diagnosisData.length === 0 ? `
      <tr><td colspan="4" style="text-align:center">No diagnosis entries added</td></tr>
    ` : diagnosisData.map((row) => {
      const rawDate = row.diagnosis_date || row.date || doctorDiagnosisStore.diagnosis_date || '';
      const formattedDate = rawDate ? dayjs(rawDate).format('DD-MM-YYYY') : '';
      return `
      <tr>
        <td>${escape(formattedDate)}</td>
        <td>${escape(row.symptom_name || row.diagnosis_name || '')}</td>
        <td>${escape(row.duration_days)}</td>
        <td>${escape(row.remarks || row.description || '')}</td>
      </tr>
    `;
    }).join('');

    const diagHtml = `
      <table>
        <thead>
          <tr><th>Diagnosis Date</th><th>Symptom</th><th>Duration (Days)</th><th>Remarks</th></tr>
        </thead>
        <tbody>${diagRows}</tbody>
      </table>
    `;

    const presRows = prescriptionData.length === 0 ? `
      <tr><td colspan="7" style="text-align:center">No prescription entries added</td></tr>
    ` : prescriptionData.map((p) => `
      <tr>
        <td>${escape(p.medicine_name || p.drug_name || p.medicine || '')}</td>
        <td>${escape(p.generic_name || '')}</td>
        <td>${escape(p.strength || '')}</td>
        <td>${escape(p.dosage || (p.morning_dosage || p.afternoon_dosage || p.night_dosage ? `${p.morning_dosage||"0"}-${p.afternoon_dosage||"0"}-${p.night_dosage||"0"}` : ''))}</td>
        <td>${escape(p.food_timing || p.frequency || '')}</td>
        <td>${escape(p.duration_days ?? p.duration ?? '')}</td>
        <td>${escape(p.special_instructions || p.instructions || '')}</td>
      </tr>
    `).join('');

    const presHtml = `
      <table>
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Generic Name</th>
            <th>Strength</th>
            <th>Dosage</th>
            <th>Food Timing</th>
            <th>Duration (Days)</th>
            <th>Special Instructions</th>
          </tr>
        </thead>
        <tbody>${presRows}</tbody>
      </table>
    `;

    const labRows = labTestData.length === 0 ? `
      <tr><td colspan="2" style="text-align:center">No lab tests added</td></tr>
    ` : labTestData.map((lt) => `
      <tr>
        <td>${escape(lt.test_name || '')}</td>
        <td>${escape(lt.prerequisite_text || '')}</td>
      </tr>
    `).join('');

    const labHtml = `
      <table>
        <thead><tr><th>Lab Test Name</th><th>Prerequisite</th></tr></thead>
        <tbody>${labRows}</tbody>
      </table>
    `;

    const procRows = procedureData.length === 0 ? `
      <tr><td colspan="2" style="text-align:center">No procedures added</td></tr>
    ` : procedureData.map((pr) => `
      <tr>
        <td>${escape(pr.procedure_text || pr.procedure_name || '')}</td>
        <td>${escape(pr.price ?? '')}</td>
      </tr>
    `).join('');

    const procHtml = `
      <table>
        <thead><tr><th>Procedure</th><th>Price</th></tr></thead>
        <tbody>${procRows}</tbody>
      </table>
    `;

    const fullContent = `${vitalsHtml}${complaintsHtml}<div class="section-title">Diagnosis</div>${diagHtml}<div class="section-title">Prescriptions</div>${presHtml}<div class="section-title">Lab Tests</div>${labHtml}<div class="section-title">Procedures</div>${procHtml}`;

    const win = window.open('', '_blank', 'width=900,height=650');
    win.document.write(`
      <html>
        <head>
          <title>Diagnosis Print</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111827; }
            .center-heading { text-align:center; color: #115E59; font-size:1.5rem; font-weight:700; margin-bottom:10px; }
            .patient-header { font-size:1.1rem; margin-bottom:20px; line-height:1.6; }
            table { width:100%; border-collapse: collapse; margin-top:10px; }
            table th { background-color:#115E59; color:white; padding:8px; border:1px solid #ccc; text-align:left; }
            table td { padding:8px; border:1px solid #ccc; }
            .section-title { font-weight:700; font-size:1.1rem; margin-top:20px; margin-bottom:10px; color:#115E59; }
            .field-label { color:#6b7280; font-weight:600; text-transform:uppercase; font-size:0.875rem; }
            .field-value { color:#111827; font-weight:600; font-size:1rem; margin-bottom:15px; }
            .vitals-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:15px; margin-bottom:20px; }
            @media print { body{ padding:10px; } .center-heading{ font-size:1.3rem; } }
          </style>
        </head>
        <body>
          <div class="center-heading">Apple Medical Center</div>
          <div class="patient-header">
            <strong>Patient ID:</strong> ${_appt.patient_id ?? appointment?.patient_id ?? '-'} <br/>
            <strong>Token No:</strong> ${tokenNumber ?? '-'} <br/>
            <strong>Appointment No:</strong> ${_appt.appointment_id ?? appointmentId ?? '-'} <br/>
            <strong>Name:</strong> ${patientName || '-'} <br/>
            <strong>Date of Visit:</strong> ${visitDate || '-'}
          </div>
          ${fullContent}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const fetchingCount = useIsFetching({
    predicate: (query) => {
      const key0 = Array.isArray(query.queryKey)
        ? query.queryKey[0]
        : query.queryKey;
      return [
        "queryGetDiagnosisForViewScreen",
        "queryGetTemplatesList",
        "queryGetSymptomMaster",
        "queryGetDrugMaster",
        "queryGetPatientReports",
        "queryGetAppointmentsAndBookings",
      ].includes(key0);
    },
  });
  const showPageLoader = fetchingCount > 0;
  
  const handleTemplateChange = (templateId) => {
    setPendingTemplateId(templateId);
    if (!templateId) return;
    const found = templates.find(
      (template) => String(template.template_id) === String(templateId)
    );
    if (found) {
      setAppliedTemplate(found);
      setApplyTick(Date.now());
      setPendingTemplateId("");
    }
  };

  const handleClose = () => {
    console.log('🚪 Closing dialog');
    performCompleteReset();
    onClose();
  };

  // Simplified loading state - show loading until data is loaded or confirmed as not existing
  const showLoadingMessage = (isDiagLoading || isDiagFetching) && !dataLoadedRef.current;
  const showErrorMessage = isError && !isDiagLoading && !isDiagFetching && !dataLoadedRef.current;
  const showNoDataMessage = dataLoadedRef.current && !fetchedDiagnosis && !isError;
  const showData = dataLoadedRef.current && (fetchedDiagnosis || !isDiagLoading);

  // Child stores (use these for constructing the full-page print to match section prints)
  const diagnosisStore = useDiagnosisStore();
  const prescriptionStore = usePrescriptionStore();
  const labTestStore = useLabTestStore();
  const procedureStore = useProcedureStore();

  const diagnosisData = diagnosisStore.symptoms || [];
  const prescriptionData = prescriptionStore.prescriptions || [];
  const labTestData = labTestStore.labTests || [];
  const procedureData = procedureStore.procedures || []; 

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <PageLoader show={showPageLoader} />
      <AppBar
        sx={{
          position: "fixed",
          bgcolor: "#115E59",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>

          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Doctor Diagnosis
          </Typography>

          <StyledButton
            variant="outlined"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            sx={{ mr: 2, color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff' } }}
          >
            Print
          </StyledButton>

          <StyledButton
            variant="contained"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            startIcon={<SaveIcon />}
            sx={{
              mr: 2,
              bgcolor: "#16a34a",
              color: "#fff",
              '&:hover': { bgcolor: '#15803d' },
              '&.Mui-disabled': { bgcolor: '#9ca3af', color: '#ffffff' },
            }}
          >
            {submitMutation.isPending ? "Saving..." : "Submit"}
          </StyledButton>
        </Toolbar>
      </AppBar>
      <Toolbar />

      <Box sx={{ width: "100%", p: 0, display: "flex", gap: 2 }}>
        <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <Box sx={{ flex: "1 1 33%", textAlign: "left", width: "100%" }}>
                <Field label="Token Number" value={tokenNumber} />
              </Box>

              <Box sx={{ flex: "1 1 34%", textAlign: "center", width: "100%" }}>
                <Field label="Patient Name" value={patientName} />
              </Box>

              <Box sx={{ flex: "1 1 33%", textAlign: "right", width: "100%" }}>
                <Field label="Date of Visit" value={visitDate} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ borderRadius: 2, border: "1px solid #e5e7eb", p: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, fontSize: "1.0rem", mb: 2 }}
            >
              Vitals
            </Typography>

            {showLoadingMessage ? (
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  textAlign: "center",
                  fontSize: "1.0rem",
                  py: 2,
                }}
              >
                Loading Diagnosis...
              </Typography>
            ) : showErrorMessage ? (
              <Typography
                variant="body2"
                sx={{
                  color: "#dc2626",
                  textAlign: "center",
                  fontSize: "1.0rem",
                  py: 2,
                }}
              >
                Failed to load existing diagnosis. You can still enter new data below.
              </Typography>
            ) : showNoDataMessage ? (
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  textAlign: "center",
                  fontSize: "1.0rem",
                  py: 2,
                }}
              >
                No Previous Diagnosis Found - Ready for New Entry
              </Typography>
            ) : showData ? (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  width: "100%",
                  flexWrap: "wrap",
                  alignItems: "stretch",
                }}
              >
                <Box
                  sx={{
                    flex: "1 1 0",
                    minWidth: { xs: "45%", md: 0 },
                    textAlign: "center",
                  }}
                >
                  <Field label="Blood Pressure" value={vital_bp} />
                </Box>
                <Box
                  sx={{
                    flex: "1 1 0",
                    minWidth: { xs: "45%", md: 0 },
                    textAlign: "center",
                  }}
                >
                  <Field label="Heart Rate" value={vital_hr} />
                </Box>
                <Box
                  sx={{
                    flex: "1 1 0",
                    minWidth: { xs: "45%", md: 0 },
                    textAlign: "center",
                  }}
                >
                  <Field label="Temperature" value={vital_temp} />
                </Box>
                <Box
                  sx={{
                    flex: "1 1 0",
                    minWidth: { xs: "45%", md: 0 },
                    textAlign: "center",
                  }}
                >
                  <Field label="Height" value={height} />
                </Box>
                <Box
                  sx={{
                    flex: "1 1 0",
                    minWidth: { xs: "45%", md: 0 },
                    textAlign: "center",
                  }}
                >
                  <Field label="Weight" value={weight} />
                </Box>
                <Box
                  sx={{
                    flex: "1 1 0",
                    minWidth: { xs: "45%", md: 0 },
                    textAlign: "center",
                  }}
                >
                  <Field label="SPO2" value={vital_spo2} />
                </Box>
              </Box>
            ) : null}
          </Box>

          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              p: 2,
              mt: 3,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, fontSize: "1.0rem", mb: 2 }}
            >
              Chief Complaints
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={3}
              value={chief_complaint ?? ""}
              onChange={(e) => {
                onChangePatientDiagnosis("chief_complaint", e.target.value);
                setField("chief_complaint", e.target.value);
              }}
              placeholder="Enter chief complaints"
              disabled={showLoadingMessage}
            />
          </Box>

          <DiagnosisSection
            templates={templates}
            selectedTemplateId={pendingTemplateId}
            appliedTemplate={appliedTemplate}
            applyTick={applyTick}
            onTemplateChange={handleTemplateChange}
            patientId={appointment?.patient_id ?? appointment?.PatientID ?? appointment?.patientId}
            patientName={patientName}
            tokenNumber={tokenNumber}
            appointmentDate={visitDate}
            appointmentId={appointmentId}
          />

          <PrescriptionSection
            patientId={appointment?.patient_id}
            patientName={patientName}
            tokenNumber={tokenNumber}
            appointmentDate={visitDate}
            appointmentId={appointmentId}
          />

          <LabTestSection
            patientId={appointment?.patient_id ?? appointment?.PatientID ?? appointment?.patientId}
            patientName={patientName}
            tokenNumber={tokenNumber}
            appointmentDate={visitDate}
            appointmentId={appointmentId}
          />
          <ProcedureSection 
            patientId={appointment?.patient_id ?? appointment?.PatientID ?? appointment?.patientId}
            patientName={patientName}
            tokenNumber={tokenNumber}
            appointmentDate={visitDate}
            appointmentId={appointmentId}
          />
        </Box>

        <DiagnosisRightSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          patientId={appointment?.patient_id}
        />
      </Box>
      
      <AlertSnackbar
        showAlert={showAlert.show}
        message={showAlert.message}
        severity={showAlert.status}
        onClose={() => setShowAlert({ show: false, message: "", status: "success" })}
      />
    </Dialog>
  );
};

export default ViewScreen;
