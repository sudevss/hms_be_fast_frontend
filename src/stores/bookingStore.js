import { create } from "zustand";

export const bookingRequiredFileds = [
  "firstname",
  "lastname",
  "age",
  "contact_number",
  "gender",
  "AppointmentDate",
  "AppointmentTime",
  "AppointmentMode",
];

const initialState = {
  firstname: "",
  lastname: "",
  age: "",
  dob: "",
  contact_number: "",
  address: "",
  gender: "",
  email_id: "",
  disease: "",
  ABDM_ABHA_id: "",
  doctor_id: "",
  facility_id: 1,
  AppointmentDate: "",
  AppointmentTime: "",
  Reason: "",
  AppointmentMode: "",
  // room_id: 1,
  payment_status: 0,
  payment_method: "",
  doctorName: "",
};

export const useBooking = create((set) => ({
  ...initialState,

  onReset: () => set(() => initialState),
  addPatient: (obj) => set((state) => ({ ...initialState, ...obj })),
  setBookingData: (obj) => set((state) => ({ ...state, ...obj })),
  onChangeBooking: (name, value) =>
    set((state) => ({ ...state, [name]: value })),
}));

//     {
//   "patient_info": {
//     "firstname": "",
//     "lastname": "",
//     "age": 0,
//     "dob": "2025-09-10",
//     "contact_number": "",
//     "address": "",
//     "gender": "",
//     "email_id": "",
//     "disease": "",
//     "ABDM_ABHA_id": ""
//   },
//   "doctor_id": 0,
//   "facility_id": 0,
//   "AppointmentDate": "2025-09-10",
//   "AppointmentTime": "11:19:57.143Z",
//   "Reason": "",
//   "AppointmentMode": "A",
//   "room_id": 1,
//   "payment_status": 0,
//   "payment_method": "Cash"
// }
