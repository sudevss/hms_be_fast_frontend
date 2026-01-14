import { create } from "zustand";

const initialState = {
  procedures: [], // Array of { procedure_text, price }
};

export const useProcedureStore = create((set) => ({
  ...initialState,
  setProcedures: (procedures) => set({ procedures }),
  addProcedure: (procedure) =>
    set((state) => ({
      procedures: [...state.procedures, procedure],
    })),
  updateProcedure: (index, procedure) =>
    set((state) => ({
      procedures: state.procedures.map((p, i) => (i === index ? procedure : p)),
    })),
  removeProcedure: (index) =>
    set((state) => ({
      procedures: state.procedures.filter((_, i) => i !== index),
    })),
  reset: () => set(initialState),
}));
