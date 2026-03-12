import { create } from "zustand";
import dayjs from "dayjs";

export const useDashboardStore = create((set) => ({
  date: dayjs().format("YYYY-MM-DD"),
  setDate: (date) => set({ date: dayjs(date).format("YYYY-MM-DD") }),
  doctor_id: "",
  setDoctorSearch: (search) => set({ doctorSearch: search }),
  doctorSearch: "",
  setdoctor_id: (id) => set({ doctor_id: id }),
  userRole: "admin", // Default role
  setUserRole: (role) => set({ userRole: role }),
  isSidebarOpen: false,
  setIsSidebarOpen: (val) => set({ isSidebarOpen: val }),
}));
