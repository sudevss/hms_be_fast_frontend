import axios from "axios";

const API_BASE_URL = `https://hms-be-fast-six.vercel.app`;

export const getDashBoardDetails = ({ date, facility_id, doctor_id }) => {
  let url = `${API_BASE_URL}${`/dashboard/getDoctorDetails?facility_id=${facility_id}&date=${date}`}`;
  if (doctor_id) {
    url += `&doctor_id=${doctor_id}`;
  }
  return axios.get(url).then((response) => response.data);
};

export const getDoctorSheduleDetails = async ({
  facility_id = "1",
  doctor_id,
}) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${`/doctor-schedule/${facility_id}/${doctor_id}`}`
    );
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const postDoctorShedule = (payload) =>
  axios
    .post(`${API_BASE_URL}/doctor-schedule`, payload)
    .then((response) => response.data);

export const deleteDoctorSheduleSlot = async ({
  facility_id,
  startDate,
  endDate,
  doctor_id,
  windowNum,
}) => {
  axios
    .delete(
      `${API_BASE_URL}${`/doctor-schedule/${facility_id}/${doctor_id}/${startDate}/${endDate}/${windowNum}`}`
    )
    .then((response) => response);
};

export const postNewDoctor = (payload) =>
  axios
    .post(`${API_BASE_URL}/doctors`, payload)
    .then((response) => response.data);

export const putUpdateDoctor = (payload) =>
  axios
    .put(`${API_BASE_URL}/doctors/${payload?.id}`, payload)
    .then((response) => response.data);

export const getAllDoctorsDetails = async ({ facility_id }) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}${`/doctors?facility_id=${facility_id}&include_inactive=true`}`
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
  axios
    .delete(
      `${API_BASE_URL}${`/appointments/${appointment_id}?facility_id=${facility_id}`}`
    )
    .then((response) => response);
};

export const postCheckinAppoinmentBooking = async ({
  appointment_id,
  facility_id,
}) => {
  axios
    .post(
      `${API_BASE_URL}${`/appointments/${appointment_id}/checkin?facility_id=${facility_id}`}`
    )
    .then((response) => response);
};

export const postNewAppoinmentBooking = (payload) =>
  axios
    .post(`${API_BASE_URL}/new_booking/book`, payload)
    .then((response) => response.data);

export const postNewAppoinmentBookingWithExistingPatient = (payload) =>
  axios
    .post(`${API_BASE_URL}/new_booking/book-existing`, payload)
    .then((response) => response.data);

export const getAppointmentsAndBookings = async ({
  facility_id,
  date,
  appointment_status,
  end_date,
  patient_id,
}) => {
  let url = `${API_BASE_URL}${`/appointments/?facility_id=${facility_id}&date=${date}&end_date=${end_date}&appointment_status=${appointment_status}`}`;
  if (patient_id) {
    url += `&patient_id=${patient_id}`;
  }
  try {
    const response = await axios.get(url);
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
  await axios
    .get(
      `${API_BASE_URL}${`/new_booking/lookup?phone_number=${contact_number}&facility_id=${facility_id}`}`
    )
    .then((response) => response.data);

export const getPaientsDetails = async ({ facility_id }) =>
  axios
    .get(`${API_BASE_URL}${`/patients/?facility_id=${facility_id}`}`)
    .then((response) => response.data);

export const patchUpdatePatient = (payload) =>
  axios
    .patch(
      `${API_BASE_URL}/patients/${payload.id}?facility_id=${payload.facility_id}`,
      payload
    )
    .then((response) => response.data);

export const postAddNewPatient = (payload) =>
  axios
    .post(`${API_BASE_URL}/patients`, payload)
    .then((response) => response.data);

export const postCheckinPayment = (payload) =>
  axios
    .post(
      `${API_BASE_URL}${`/appointments/${payload?.appointment_id}/payment?facility_id=${payload?.facility_id}`}`,
      payload
    )
    .then((response) => {
      console.log(response.data);
      return response.data;
    });

export const putAddPatientDiagnosis = (payload) =>
  axios
    .put(`${API_BASE_URL}${`/patient_diagnosis/`}`, payload)
    .then((response) => response.data);

export const getPatientDiagnosis = ({
  patient_id,
  doctor_id,
  diagnosis_id,
  facility_id = "1",
}) =>
  axios
    .get(
      `${API_BASE_URL}${`/patient_diagnosis/?facility_id=${facility_id}&patient_id=${patient_id}&doctor_id=${doctor_id}&diagnosis_id=${diagnosis_id}`}`
    )
    .then((response) => response.data);

export const getPatientReports = ({
  patient_id,
  appointment_id,
  facility_id = "1",
}) => {
  let url = `${API_BASE_URL}${`/patient_reports?facility_id=${facility_id}&patient_id=${patient_id}`}`;
  if (appointment_id) {
    url += `&appointment_id=${appointment_id}`;
  }
  return axios.get(url).then((response) => response.data);
};

export const getPatientReportFileDownload = ({
  patient_id,
  facility_id = "1",
  upload_id,
}) => {
  return axios
    .get(
      `${API_BASE_URL}${`/patient_reports/file?facility_id=${facility_id}&patient_id=${patient_id}&upload_id=${upload_id}`}`,

      {
        responseType: "blob", // important for binary data
      }
    )
    .then((response) => response.data);
};

// export const postPatientUploadFiles = ({ payload }) => {
//   return axios
//     .post(`${API_BASE_URL}${`/patient_reports/upload`}`, payload)
//     .then((response) => response);
// };
