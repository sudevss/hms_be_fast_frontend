import { create } from "zustand";

const initialState = {
  symptoms: [], // Array of { symptom_id, duration_days, remarks }
};

export const useDiagnosisStore = create((set) => ({
  ...initialState,
  setSymptoms: (symptoms) => set({ symptoms }),
  addSymptom: (symptom) =>
    set((state) => ({
      symptoms: [...state.symptoms, symptom],
    })),
  updateSymptom: (index, symptom) =>
    set((state) => ({
      symptoms: state.symptoms.map((s, i) => (i === index ? symptom : s)),
    })),
  removeSymptom: (index) =>
    set((state) => ({
      symptoms: state.symptoms.filter((_, i) => i !== index),
    })),
  reset: () => set(initialState),
}));
