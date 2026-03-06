import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";

import ErrorFallback from "@components/ErrorFallback";
import ErrorAccess from "@components/ErrorAccessFallback/ErrorAccess";
import LoginPage from "@pages/Login";
import LandingPage from "@pages/LandingPage";
import PageLoader from "@pages/PageLoader";
import NotFound from "@pages/NotFound";

import Layout from "./Layout/Layout";
import PrivateRoute from "./Layout/PrivateRoute";

import DashboardPage from "./Dashboard";
import DoctorsPage from "./Doctors";
import PatientsPage from "./Patients";
import AppointmentsPage from "./Appointments";
import BillingPage from "./Billing";
import SettingsPage from "./Settings";

// Optional wrapper for lazy loading fallback
function SuspenseWrapper({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ErrorFallback />}>
      {/* Landing Page Route */}
      <Route index element={<LandingPage />} />

      {/* Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Layout */}
      <Route element={<Layout />}>
        {/* Redirect root path to /dashboard if logged in */}
        {/* <Route index element={<Navigate to="/login" replace />} /> */}

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route
            path="/dashboard"
            element={
              <SuspenseWrapper>
                <DashboardPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/doctors"
            element={
              <SuspenseWrapper>
                <DoctorsPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/appointments"
            element={
              <SuspenseWrapper>
                <AppointmentsPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/patients"
            element={
              <SuspenseWrapper>
                <PatientsPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/billing"
            element={
              <SuspenseWrapper>
                <BillingPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/settings"
            element={
              <SuspenseWrapper>
                <SettingsPage />
              </SuspenseWrapper>
            }
          />
        </Route>
      </Route>

      {/* Access denied / fallback pages */}
      <Route path="/no-access" element={<ErrorAccess />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default router;
