import { create } from "zustand";
import { useDiagnosisStore } from "./diagnosisStore";
import { usePrescriptionStore } from "./prescriptionStore";
import { useProcedureStore } from "./procedureStore";
import { useLabTestStore } from "./labTestStore";
import dayjs from "dayjs";

const initialState = {
  diagnosis_id: null,
  patient_id: null,
  doctor_id: null,
  facility_id: null,
  appointment_id: null,
  chief_complaint: "",
  diagnosis_date: dayjs().format("YYYY-MM-DD"),
  followup_date: "",
  vital_bp: "",
  vital_hr: "",
  vital_spo2: "",
  vital_temp: "",
  height: "",
  weight: "",
  template_id: null,
};

export const useDoctorDiagnosisStore = create((set, get) => ({
  ...initialState,
  
  // Update individual fields
  setField: (field, value) => set({ [field]: value }),
  
  // Set all diagnosis data (from API)
  setDiagnosisData: (data) => {
    set({
      diagnosis_id: data.diagnosis_id ?? null,
      patient_id: data.patient_id ?? null,
      doctor_id: data.doctor_id ?? null,
      facility_id: data.facility_id ?? null,
      appointment_id: data.appointment_id ?? null,
      chief_complaint: data.chief_complaint ?? "",
      diagnosis_date: data.diagnosis_date ?? dayjs().format("YYYY-MM-DD"),
      followup_date: data.followup_date ?? "",
      vital_bp: data.vital_bp ?? "",
      vital_hr: data.vital_hr ?? "",
      vital_spo2: data.vital_spo2 ?? "",
      vital_temp: data.vital_temp ?? "",
      height: data.height ?? "",
      weight: data.weight ?? "",
      template_id: data.template_id ?? null,
    });
    
    // Also update the individual stores
    try {
      const diagnosisStore = useDiagnosisStore.getState();
      const prescriptionStore = usePrescriptionStore.getState();
      const procedureStore = useProcedureStore.getState();
      const labTestStore = useLabTestStore.getState();
      
      if (data.symptoms && Array.isArray(data.symptoms)) {
        diagnosisStore.setSymptoms(data.symptoms);
      }
      if (data.prescriptions && Array.isArray(data.prescriptions)) {
        prescriptionStore.setPrescriptions(data.prescriptions);
      }
      if (data.procedures && Array.isArray(data.procedures)) {
        procedureStore.setProcedures(
          data.procedures.map((proc) => ({
            procedure_id: proc.procedure_id || null,
            procedure_text: proc.procedure_name || proc.free_text_procedure || "",
            price: proc.price || 0,
          }))
        );
      }
      if (data.lab_tests && Array.isArray(data.lab_tests)) {
        labTestStore.setLabTests(data.lab_tests);
      }
    } catch (error) {
      console.error("Error updating individual stores:", error);
    }
  },
  
  // Get all data for API submission
  getSubmissionData: () => {
    try {
      const state = get();
      const diagnosisStore = useDiagnosisStore.getState();
      const prescriptionStore = usePrescriptionStore.getState();
      const procedureStore = useProcedureStore.getState();
      const labTestStore = useLabTestStore.getState();
      
      const submissionData = {
      chief_complaint: state.chief_complaint || "",
      diagnosis_date: state.diagnosis_date || dayjs().format("YYYY-MM-DD"),
      doctor_id: state.doctor_id || 0,
      facility_id: state.facility_id || 0,
      followup_date: state.followup_date || "",
      height: state.height || "",
      lab_tests: labTestStore.labTests
        .filter((lt) => lt.test_id) // Only include valid test_ids
        .map((lt) => ({
          prerequisite_text: lt.prerequisite_text || "",
          test_id: lt.test_id || 0,
        })),

      patient_id: state.patient_id || 0,
      prescriptions: prescriptionStore.prescriptions
        .filter((p) => p.medicine_id) // Only include valid medicine_ids
        .map((p) => ({
          afternoon_dosage: p.afternoon_dosage || "0",
          duration_days: p.duration_days || 0,
          food_timing: p.food_timing || "",
          medicine_id: p.medicine_id || 0,
          morning_dosage: p.morning_dosage || "0",
          night_dosage: p.night_dosage || "0",
          special_instructions: p.special_instructions || "",
        })),
      procedures: procedureStore.procedures
        .filter((p) => p.procedure_id || (p.procedure_text && String(p.procedure_text || "").trim().length >= 5))
        .map((p) => {
          if (p.procedure_id) {
            const item = { procedure_id: p.procedure_id };
            if (p.price) item.price = parseFloat(p.price);
            return item;
          }
          return {
            free_text_procedure: p.procedure_text,
            price: parseFloat(p.price) || 0,
          };
        }),
      symptoms: diagnosisStore.symptoms
        .filter((s) => s.symptom_id || s.symptom_name) // Include both predefined and custom symptoms
        .map((s) => {
          const symptom = {
            duration_days: Number(s.duration_days) || 0,
            remarks: s.remarks || "",
          };
          
          if (s.symptom_id) {
            symptom.symptom_id = s.symptom_id;
          } else if (s.symptom_name) {
            symptom.free_text_symptom = s.symptom_name;
          }
          
          return symptom;
        }),
      template_id: state.template_id || 0,
      vital_bp: state.vital_bp || "",
      vital_hr: state.vital_hr || "",
      vital_spo2: state.vital_spo2 || "",
      vital_temp: state.vital_temp || "",
      weight: state.weight || "",
    };
    
      // Include diagnosis_id if it exists (for updates)
      if (state.diagnosis_id) {
        submissionData.diagnosis_id = state.diagnosis_id;
      }

      // Include appointment_id when available so backend doesn't null it
      if (state.appointment_id || state.appointment_id === 0) {
        // Only include when explicitly set (allow 0 only if that is a valid id in your system)
        submissionData.appointment_id = state.appointment_id;
      }

      // Avoid sending empty followup_date (backend rejects empty date string)
      if (!submissionData.followup_date || String(submissionData.followup_date).trim() === "") {
        delete submissionData.followup_date;
      }
      
      return submissionData;
    } catch (error) {
      console.error("Error getting submission data:", error);
      // Return minimal valid structure
      const state = get();
      return {
        chief_complaint: state.chief_complaint || "",
        diagnosis_date: state.diagnosis_date || dayjs().format("YYYY-MM-DD"),
        doctor_id: state.doctor_id || 0,
        facility_id: state.facility_id || 0,
        followup_date: state.followup_date || "",
        height: state.height || "",
        lab_tests: [],
        patient_id: state.patient_id || 0,
        prescriptions: [],
        procedures: [],
        symptoms: [],
        template_id: state.template_id || 0,
        vital_bp: state.vital_bp || "",
        vital_hr: state.vital_hr || "",
        vital_spo2: state.vital_spo2 || "",
        vital_temp: state.vital_temp || "",
        weight: state.weight || "",
      };
    }
  },
  
  // Reset all stores
  reset: () => {
    set(initialState);
    useDiagnosisStore.getState().reset();
    usePrescriptionStore.getState().reset();
    useProcedureStore.getState().reset();
    useLabTestStore.getState().reset();
  },
}));
