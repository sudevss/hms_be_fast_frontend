// import { datadogRum } from "@datadog/browser-rum";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import { AuthContextProvider } from "./contexts/AuthContext";
import "./index.scss";
import "./skeleton.scss";

const {
  BASE_URL,
  DEV,
  MODE,
  PROD,
  SSR,
  VITE_API_BASE_URL,
  APP_VERSION,
  APP_BUILD_TIMESTAMP,
} = import.meta.env;

console.log("Deployment configuration:", {
  BASE_URL,
  DEV,
  MODE,
  PROD,
  SSR,
  VITE_API_BASE_URL,
  APP_VERSION,
  APP_BUILD_TIMESTAMP,
});
axios.defaults.timeout = 60000;
// if (MODE === "development") axios.defaults.baseURL = VITE_API_BASE_URL;

// if (MODE === "production" || MODE === "uat") {
//   datadogRum.init({
//     applicationId: import.meta.env.VITE_DATADOG_APPLICATION_ID,
//     clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
//     site: "datadoghq.com",
//     service: "hms",
//     env: import.meta.env.VITE_DATADOG_ENV,
//     // version: '1.0.0',  // Specify a version number to identify the deployed version of your application in Datadog
//     sessionSampleRate: 100,
//     sessionReplaySampleRate: 20,
//     trackUserInteractions: true,
//     trackResources: true,
//     trackLongTasks: true,
//   });
// }
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 5 * 1000,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <AuthContextProvider> */}
      <App />
      {/* </AuthContextProvider> */}
    </QueryClientProvider>
  </React.StrictMode>
);
