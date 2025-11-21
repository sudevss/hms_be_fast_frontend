import { create } from "zustand";
import dayjs from "dayjs";

export const patientRequiredFileds = [
  "firstname",
  "lastname",
  "age",
  "contact_number",
  "gender",
];

export const calculateAge = (dobString) => {
  const dob = dayjs(dobString, "YYYY-MM-DD");
  const today = dayjs();
  return today.diff(dob, "year");
};

const initialState = {
  id: "",
  firstname: "",
  lastname: "",
  age: "",
  dob: "",
  contact_number: "",
  address: "",
  gender: "",
  email_id: "",
  ABDM_ABHA_id: "",
};

const initialStatePatientDiagnosis = {
  appointment_id: "",
  assessment_notes: "",
  chief_complaint: "",
  diagnosis_date: dayjs().format("YYYY-MM-DD"),
  doctor_id: "",
  facility_id: "",
  followup_date: "",
  patient_id: "",
  recomm_tests: "",
  treatment_plan: "",
  vital_bp: "",
  vital_hr: "",
  vital_spo2: "",
  vital_temp: "",
  assessment_notes: "",
  height: "",
  weight: "",
};

export const usePatient = create((set) => ({
  ...initialState,
  onReset: () => set(() => initialState),
  setPatientData: (obj) => set((state) => ({ ...state, ...obj })),
  onChangePatient: (name, value) =>
    set((state) => ({ ...state, [name]: value })),
}));

export const usePatientDiagnosis = create((set) => ({
  ...initialStatePatientDiagnosis,
  onReset: () => set(() => initialStatePatientDiagnosis),
  setPatientDiagnosis: (obj) => set((state) => ({ ...state, ...obj })),
  onChangePatientDiagnosis: (name, value) =>
    set((state) => ({ ...state, [name]: value })),
}));
