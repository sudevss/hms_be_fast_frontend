import { userLoginDetails } from "@/stores/LoginStore";
import axios from "axios";
// import { userLoginDetails } from "@/stores/LoginStore";
const API_BASE_URL = `http://150.241.245.172:8000`;

// Create Axios instance
const api = axios.create({
  baseURL: `http://150.241.245.172:8000`, // your API base URL
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
