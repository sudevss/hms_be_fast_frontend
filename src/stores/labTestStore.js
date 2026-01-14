import { create } from "zustand";

const initialState = {
  labTests: [], // Array of { test_id, prerequisite_text }
};

export const useLabTestStore = create((set) => ({
  ...initialState,
  setLabTests: (labTests) => set({ labTests }),
  addLabTest: (labTest) =>
    set((state) => ({
      labTests: [...state.labTests, labTest],
    })),
  updateLabTest: (index, labTest) =>
    set((state) => ({
      labTests: state.labTests.map((lt, i) => (i === index ? labTest : lt)),
    })),
  removeLabTest: (index) =>
    set((state) => ({
      labTests: state.labTests.filter((_, i) => i !== index),
    })),
  reset: () => set(initialState),
}));
