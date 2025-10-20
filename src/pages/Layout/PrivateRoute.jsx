import { Navigate, Outlet, useLocation } from "react-router-dom";
import { userLoginDetails } from "@/stores/LoginStore";
import Layout from "./Layout";

export function PrivateRoute() {
   const userObj = userLoginDetails.getState();
  const location = useLocation();

//   if()
  if (!userObj?.access_token) {
    // Redirect to login, keep current path in state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout />; // render child routes
}
