import ErrorFallback from "@components/ErrorFallback";
import LoginPage from "@pages/Login";
import PageLoader from "@pages/PageLoader";
import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Routes,
  Route,
  Router,
} from "react-router-dom";

import ErrorAccess from "@components/ErrorAccessFallback/ErrorAccess";
// import Logout from "@components/Logout";
import NotFound from "@pages/NotFound";
import { hasNoAccess } from "./routerHelpers";
import DashboardPage from "./Dashboard";
import DoctorsPage from "./Doctors";
import PatientsPage from "./Patients";
import AppointmentsPage from "./Appointments";
import Layout from "./Layout/Layout";
import { PrivateRoute } from "./Layout/PrivateRoute";

// eslint-disable-next-line react/prop-types
// function SuspenseComponent({ children }) {
//   return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
// }

// function App() {
//   return (
//     <Router>
//       <Layout>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />
//         </Routes>
//       </Layout>
//     </Router>
//   );
// }

// export default App;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route
        path="/login"
        // element={<Navigate to="/" replace />}
        element={<LoginPage />}
      />
      <Route path="/" element={<Navigate to="login" replace />} />
       <Route element={<PrivateRoute />}>
      <Route
        path="/dashboard"
        // element={<Navigate to="/" replace />}
        element={<DashboardPage />}
      />
      <Route
        path="/doctors"
        // element={<Navigate to="/" replace />}
        element={<DoctorsPage />}
      />
      <Route
        path="/appointments"
        // element={<Navigate to="/" replace />}
        element={<AppointmentsPage />}
      />
      <Route
        path="/patients"
        // element={<Navigate to="/" replace />}
        element={<PatientsPage />}
      />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default router;
