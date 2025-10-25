import axios from "axios";
import api from "./apiConfig";

const API_BASE_URL = `https://hms-be-fast-six.vercel.app`;

export const getDashBoardDetails = ({ date, facility_id, doctor_id }) => {
  let url = `${`/dashboard/getDoctorDetails?facility_id=${facility_id}&date=${date}`}`;
  if (doctor_id) {
    url += `&doctor_id=${doctor_id}`;
  }
  return api.get(url).then((response) => response.data);
};

export const getDoctorSheduleDetails = async ({
  facility_id = "1",
  doctor_id,
}) => {
  try {
    const response = await api.get(
      `${`/doctor-schedule/${facility_id}/${doctor_id}`}`
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const postDoctorShedule = (payload) =>
  api
    .post(`/doctor-schedule`, payload)
    .then((response) => response.data);

export const deleteDoctorSheduleSlot = async ({
  facility_id,
  startDate,
  endDate,
  doctor_id,
  windowNum,
}) => {
  api
    .delete(
      `${`/doctor-schedule/${facility_id}/${doctor_id}/${startDate}/${endDate}/${windowNum}`}`
    )
    .then((response) => response);
};

export const postNewDoctor = (payload) =>
  api
    .post(`/doctors`, payload)
    .then((response) => response.data);

export const putUpdateDoctor = (payload) =>
  api
    .put(`/doctors/${payload?.id}`, payload)
    .then((response) => response.data);

export const getAllDoctorsDetails = async ({ facility_id }) => {
  try {
    const response = await api.get(
      `${`/doctors?facility_id=${facility_id}&include_inactive=true`}`
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const deleteAppoinmentBooking = async ({
  appointment_id,
  facility_id,
}) => {
  api
    .delete(
      `${`/appointments/${appointment_id}?facility_id=${facility_id}`}`
    )
    .then((response) => response);
};

export const postCheckinAppoinmentBooking = async ({
  appointment_id,
  facility_id,
}) => {
  api
    .post(
      `${`/appointments/${appointment_id}/checkin?facility_id=${facility_id}`}`
    )
    .then((response) => response);
};

export const postNewAppoinmentBooking = (payload) =>
  api
    .post(`/new_booking/book`, payload)
    .then((response) => response.data);

export const postNewAppoinmentBookingWithExistingPatient = (payload) =>
  api
    .post(`/new_booking/book-existing`, payload)
    .then((response) => response.data);

export const getAppointmentsAndBookings = async ({
  facility_id,
  date,
  appointment_status,
  end_date,
  patient_id,
}) => {
  let url = `${`/appointments/?facility_id=${facility_id}&date=${date}&end_date=${end_date}&appointment_status=${appointment_status}`}`;
  if (patient_id) {
    url += `&patient_id=${patient_id}`;
  }
  try {
    const response = await api.get(url);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getPaientDetailsByPhone = async ({
  facility_id,
  contact_number,
}) =>
  await api
    .get(
      `${`/new_booking/lookup?phone_number=${contact_number}&facility_id=${facility_id}`}`
    )
    .then((response) => response.data);

export const getPaientsDetails = async ({ facility_id }) =>
  api
    .get(`${`/patients/?facility_id=${facility_id}`}`)
    .then((response) => response.data);

export const patchUpdatePatient = (payload) =>
  api
    .patch(
      `/patients/${payload.id}?facility_id=${payload.facility_id}`,
      payload
    )
    .then((response) => response.data);

export const postAddNewPatient = (payload) =>
  api
    .post(`/patients`, payload)
    .then((response) => response.data);

export const postCheckinPayment = (payload) =>
  api
    .post(
      `${`/appointments/${payload?.appointment_id}/payment?facility_id=${payload?.facility_id}`}`,
      payload
    )
    .then((response) =>  response.data);
    

export const putAddPatientDiagnosis = (payload) =>
  api
    .put(`${`/patient_diagnosis/`}`, payload)
    .then((response) => response.data);

export const getPatientDiagnosis = ({
  patient_id,
  doctor_id,
  diagnosis_id,
  facility_id = "1",
}) =>
  api
    .get(
      `${`/patient_diagnosis/?facility_id=${facility_id}&patient_id=${patient_id}&doctor_id=${doctor_id}&diagnosis_id=${diagnosis_id}`}`
    )
    .then((response) => response.data);

export const getPatientReports = ({
  patient_id,
  appointment_id,
  facility_id = "1",
}) => {
  let url = `${`/patient_reports?facility_id=${facility_id}&patient_id=${patient_id}`}`;
  if (appointment_id) {
    url += `&appointment_id=${appointment_id}`;
  }
  return api.get(url).then((response) => response.data);
};

export const getPatientReportFileDownload = ({
  patient_id,
  facility_id = "1",
  upload_id,
}) => {
  return api
    .get(
      `${`/patient_reports/file?facility_id=${facility_id}&patient_id=${patient_id}&upload_id=${upload_id}`}`,

      {
        responseType: "blob", // important for binary data
      }
    )
    .then((response) => response.data);
};


export const postUpdatePaymentStatus = ({appointment_id, facility_id, ...payload}) =>  
 api
    .post(`/appointments/${appointment_id}/payment?facility_id=${facility_id}`, payload)
    .then((response) => response.data);
    
export const postUpdateAppointmentStatus = ({appointment_id, facility_id}) =>  
 api
    .post(`/appointments/${appointment_id}/complete?facility_id=${facility_id}`)
    .then((response) => response.data);

  


export const postLogin = (payload) =>
  axios
    .post(`${API_BASE_URL}/login/login`, payload)
    .then((response) => response.data);

// export const postPatientUploadFiles = ({ payload }) => {
//   return api
//     .post(`${`/patient_reports/upload`}`, payload)
//     .then((response) => response);
// };

 


export const uploadPatientReportFiles = async ({
  files,
  facility_id,
  patient_id,
  appointment_id,
  diagnosis_id,
}) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("facility_id", facility_id);
    formData.append("patient_id", patient_id);
    formData.append("report_date", "2025-10-05");
    formData.append("appointment_id", appointment_id);
    formData.append("diagnosis_id", diagnosis_id);
    formData.append("files", file); // Adjust field name as per your API
  });

 return api
    .post(`/patient_reports/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data);
};