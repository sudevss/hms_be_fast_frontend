import { userLoginDetails } from "@/stores/LoginStore";
import axios from "axios";
// import { userLoginDetails } from "@/stores/LoginStore";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000";

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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
