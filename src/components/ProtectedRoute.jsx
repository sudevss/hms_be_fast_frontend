import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ userRole, allowedRoles, children }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export default ProtectedRoute;