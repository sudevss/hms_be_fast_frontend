import { WEEK_DAYS } from "@data/staticData";
import { create } from "zustand";

export const timeSlotObj = {
  startTime: "",
  endTime: "",
  totalSlots: "",
};

const initialStateDoctor = {
  firstname: "",
  lastname: "",
  specialization: "",
  phone_number: "",
  email: "",
  consultation_fee: "",
  ABDM_NHPR_id: "",
  facility_id: "1",
  gender: "",
  age: "",
  experience: "",
  is_active: true,
  doctor_id: "",
};
const initialStateDoctorShedule = {
  startDate: "",
  facility_id: 1,
  doctor_id: "",
  endDate: "",
  leaveStartDate: "",
  leaveEndDate: "",
  weekDaysList: WEEK_DAYS.map(({ value }) => ({
    weekDay: value,
    isChecked: false,
    slotWeeks: [timeSlotObj],
  })),
};

export const useDoctor = create((set) => ({
  ...initialStateDoctor,

  onReset: () => set(() => initialStateDoctor),

  setDoctorData: (obj) => set(() => ({ ...obj })),

  onChangeDoctor: (name, value) =>
    set((state) => ({ ...state, [name]: value })),
}));

export const useSheduleDoctor = create((set) => ({
  ...initialStateDoctorShedule,
  onReset: () => set(() => initialStateDoctorShedule),
  setDoctorSheduleSlots: (weekDaysList) =>
    set((state) => ({ ...state, weekDaysList })),
  onChangeSheduleDoctor: (obj) => set((state) => ({ ...state, ...obj })),
  setDoctorSheduleData: (obj) =>
    set(() => ({
      ...initialStateDoctorShedule,
      ...obj,
    })),
}));

export const doctorRequiredFileds = [
  "firstname",
  "lastname",
  "specialization",
  "phone_number",
  "consultation_fee",
  "ABDM_NHPR_id",
  "facility_id",
  "gender",
  "age",
  "experience",
];

const data = {
  startDate: "",
  endDate: "",
  doctor_id: "",
  facilty: "",
  leaveStartDate: "",
  leaveEndDate: "",

  weekdaysSlots: [
    {
      weekDay: "tusDay",
      slotsWeeks: [
        {
          startTime: "9Am",
          endTime: "11AM",
          totalSlots: "10",
        },
        {
          startTime: "12pm",
          endTime: "2pmAM",
          totalSlots: "10",
        },
        {
          startTime: "5pm",
          endTime: "6pmpmAM",
          totalSlots: "10",
        },
        {
          startTime: "8pm",
          endTime: "9pm",
          totalSlots: "10",
        },
      ],
    },

    {
      weekDay: "modany",
      slotsWeeks: [
        {
          startTime: "9Am",
          endTime: "11AM",
          totalSlots: "10",
        },
        {
          startTime: "12pm",
          endTime: "2pmAM",
          totalSlots: "10",
        },
        {
          startTime: "5pm",
          endTime: "6pmpmAM",
          totalSlots: "10",
        },
        {
          startTime: "8pm",
          endTime: "9pm",
          totalSlots: "10",
        },
      ],
    },

    {
      weekDay: "wed",
      slotsWeeks: [
        {
          startTime: "9Am",
          endTime: "11AM",
          totalSlots: "10",
        },
        {
          startTime: "12pm",
          endTime: "2pmAM",
          totalSlots: "10",
        },
        {
          startTime: "5pm",
          endTime: "6pmpmAM",
          totalSlots: "10",
        },
        {
          startTime: "8pm",
          endTime: "9pm",
          totalSlots: "10",
        },
      ],
    },
  ],
};
