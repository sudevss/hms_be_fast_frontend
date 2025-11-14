// src/pages/Layout/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { userLoginDetails } from "@/stores/LoginStore";
//import Layout from "./Layout";

export function PrivateRoute() {
  const location = useLocation();
  const userObj = userLoginDetails.getState();
  const { access_token } = userObj || {};

  // If no token → redirect to login and preserve intended path
  if (!access_token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If logged in → just render the nested routes
  return <Outlet />;

  //return (
    //<Layout>
     // <Outlet />
   // </Layout>
  //);

}

export default PrivateRoute;
