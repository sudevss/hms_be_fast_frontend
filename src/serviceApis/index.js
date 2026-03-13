import axios from "axios";
import api from "./apiConfig";
import dayjs from "dayjs";

const API_BASE_URL = `http://150.241.245.172:8000`;

export const getDashBoardDetails = ({ date, facility_id, doctor_id }) => {
  let url = `${`/dashboard/getDoctorDetails?facility_id=${facility_id}&date=${date}`}`;
  if (doctor_id) {
    url += `&doctor_id=${doctor_id}`;
  }
  return api.get(url).then((response) => response.data);
};

export const getDoctorSheduleDetails = async ({
  facility_id,
  doctor_id,
}) => {
  try {
    let url = `/doctor-schedule/${doctor_id}`;
    if (facility_id !== undefined && facility_id !== null) {
      url += `?facility_id=${facility_id}`;
    }
    const response = await api.get(url);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const patchDoctorShedule = (facility_id, doctor_id, payload) =>
  api
    .patch(`/doctor-schedule/${facility_id}/${doctor_id}`, payload)
    .then((response) => response.data);

export const postDoctorShedule = (payload) =>
  api
    .post(`/doctor-schedule`, payload)
    .then((response) => response.data);

export const deleteDoctorSheduleSlot = async ({
  facility_id,
  doctor_id,
  week_day,
  window_num,
}) => {
  let url = `/doctor-schedule/${doctor_id}/${week_day}/${window_num}`;
  if (facility_id !== undefined && facility_id !== null) {
    url += `?facility_id=${facility_id}`;
  }
  return api.delete(url);
};

export const postNewDoctor = (payload) =>
  api
    .post(`/doctors`, payload)
    .then((response) => response.data);

export const putUpdateDoctor = (payload) =>
  api
    .put(`/doctors/${payload?.id}?facility_id=${payload?.facility_id}`, payload)
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

// 🔹 Facility Logo APIs
export const getFacilityLogo = async (facility_id = 1) => {
  return api.get(`/facility/logo?facility_id=${facility_id}`, {
    responseType: "blob"
  }).then(res => res.data);
}

export const getFacilityDetail = async (facility_id = 1) => {
  return api
    .get(`/facility/detail?facility_id=${facility_id}`)
    .then((res) => res.data);
};

export const postFacilityLogo = async (formData, facility_id = 1) => {
    return api.post(`/facility/logo?facility_id=${facility_id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }).then(res => res.data);
}

export const deleteFacilityLogo = async (facility_id = 1) => {
    return api.delete(`/facility/logo?facility_id=${facility_id}`).then(res => res.data);
}

export const putUpdateBooking = (appointment_id, payload) =>
  api
    .put(`/new_booking/update/${appointment_id}`, payload)
    .then((response) => response.data);

export const getAppointmentsAndBookings = async ({
  facility_id,
  date,
  appointment_status,
  end_date,
  patient_id,
  doctor_id,
}) => {
  let url = `${`/appointments/?facility_id=${facility_id}&date=${date}&end_date=${end_date}&appointment_status=${appointment_status}`}`;
  if (patient_id) {
    url += `&patient_id=${patient_id}`;
  }
  if (doctor_id) {
    url += `&doctor_id=${doctor_id}`;
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

export const getPatientDetailsById = async ({ patient_id, facility_id }) => {
  try {
    const response = await api.get(
      `/patients/${patient_id}?facility_id=${facility_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching patient details:", error);
    throw error;
  }
};

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

export const getAppointmentDetailsById = async ({ appointment_id, facility_id }) => {
  try {
    const response = await api.get(
      `/appointments/${appointment_id}?facility_id=${facility_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    throw error;
  }
};
    
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

export const getPatientDiagnosisById = async ({ diagnosis_id }) => {
  try {
    const response = await api.get(`/patient_diagnosis/${diagnosis_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching diagnosis by ID:", error);
    throw error;
  }
};

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
  formData.append("facility_id", facility_id || "1");
  formData.append("patient_id", patient_id);
  formData.append("appointment_id", appointment_id);
  formData.append("diagnosis_id", diagnosis_id);
  formData.append("report_date", dayjs().format("YYYY-MM-DD"));

  files.forEach((file) => {
    // formData.append("facility_id", facility_id);
    // formData.append("patient_id", patient_id);
    // formData.append("report_date", "2025-10-05");
    // formData.append("appointment_id", appointment_id);
    // formData.append("diagnosis_id", diagnosis_id);
    formData.append("files", file);
  });

  return api
    .post(`/patient_reports/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data);

};

// export const postloadtemplate = (payload) =>
//   axios
//     .post(`${API_BASE_URL}/patient_diagnosis/load-template`, payload)
//     .then((response) => response.data);

export const postloadtemplate = (payload) =>  
 api
    .post(`${API_BASE_URL}/patient_diagnosis/load-template`, payload)
    .then((response) => response.data);

export const getTemplateById = async ({ template_id }) =>
  api
    .get(`/templates/${template_id}`)
    .then((response) => response.data);

export const getTemplatesList = async () =>
  api
    .get(`/templates/all/list`)
    .then((response) => response.data);

export const postCreateTemplate = async (payload) =>
  api.post(`/templates`, payload).then((response) => response.data);

export const putUpdateTemplate = async ({ template_id, ...payload }) =>
  api.put(`/templates/${template_id}`, payload).then((response) => response.data);

export const deleteTemplate = async ({ template_id }) =>
  api.delete(`/templates/${template_id}`).then((response) => response.data);

export const getDrugMasterList = async () =>
  api
    .get(`/templates/drug-master`)
    .then((response) => response.data);

export const getLabMasterList = async () =>
  api
  .get(`/templates/lab-master`)
  .then((response) => response.data);
    
export const getSymptomMasterList = async () =>
  api
    .get(`/templates/symptom-master`)
    .then((response) => response.data);

export const postCreateBills = (payload) =>
  api
    .post(`/billing/create-bills`, payload)
    .then((response) => response.data);

export const postRecordPayment = (payload) =>
  api
    .post(`/billing/record-payment`, payload)
    .then((response) => response.data);

export const getPaymentSummary = ({ token_number, token_date }) =>
  api
    .get(`/billing/payment-summary`, {
      params: {
        token_number,
        token_date,
      },
    })
    .then((response) => response.data);

export const getLabBillPrint = ({ token_number, token_date }) =>
  api
    .get(`/billing/lab-print`, {
      params: {
        token_number,
        token_date,
      },
    })
    .then((response) => response.data);

export const getPharmacyBillPrint = ({ token_number, token_date }) =>
  api
    .get(`/billing/pharmacy-print`, {
      params: {
        token_number,
        token_date,
      },
    })
    .then((response) => response.data);

export const getProcedureBillPrint = ({ token_number, token_date }) =>
  api
    .get(`/billing/procedure-print`, {
      params: {
        token_number,
        token_date,
      },
    })
    .then((response) => response.data);

export const getLoadDiagnosis = ({ token_number, token_date }) =>
  api
    .get(`/billing/load-diagnosis`, {
      params: {
        token_number,
        token_date,
      },
    })
    .then((response) => response.data);
