import { userLoginDetails } from "@/stores/LoginStore";
import axios from "axios";
// import { userLoginDetails } from "@/stores/LoginStore";
const API_BASE_URL = `https://hms-be-fast-six.vercel.app`;

// Create Axios instance
const api = axios.create({
  baseURL: `https://hms-be-fast-six.vercel.app`, // your API base URL
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const userObj = userLoginDetails.getState();
    const { access_token, token_type } = userObj || {};
    if (access_token) {
      config.headers.Authorization = `${token_type} ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
