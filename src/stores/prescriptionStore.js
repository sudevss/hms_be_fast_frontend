import { create } from "zustand";

const initialState = {
  prescriptions: [], // Array of { medicine_id, morning_dosage, afternoon_dosage, night_dosage, food_timing, duration_days }
};

export const usePrescriptionStore = create((set) => ({
  ...initialState,
  setPrescriptions: (prescriptions) => set({ prescriptions }),
  addPrescription: (prescription) =>
    set((state) => ({
      prescriptions: [...state.prescriptions, prescription],
    })),
  updatePrescription: (index, prescription) =>
    set((state) => ({
      prescriptions: state.prescriptions.map((p, i) => (i === index ? prescription : p)),
    })),
  removePrescription: (index) =>
    set((state) => ({
      prescriptions: state.prescriptions.filter((_, i) => i !== index),
    })),
  reset: () => set(initialState),
}));
