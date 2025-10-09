import { create } from "zustand";

const initialState = {
  show: false,
  message: "",
  status: "",
};

export const useShowAlert = create((set) => ({
  showAlert: { ...initialState },
  onResetAlert: () => set(() => ({ showAlert: initialState })),
  setShowAlert: (showAlert) => set((state) => ({ showAlert })),
}));
