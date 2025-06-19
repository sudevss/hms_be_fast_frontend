// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import Doctor from "./pages/doctor";             //Import the doctors
// import PatientManagement from "./pages/patient"; // Import the Patients
// import Appointments from './pages/Appointments'; // Import the Appointments component


// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/doctors" element={<Doctor />} />
//         <Route path="/patients" element={<PatientManagement />} />
//         <Route path="/appointments" element={<Appointments />} /> 

//       </Routes>
//     </Router>
//   );
// }

// export default App;



import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from './components/LoginScreen';
import Dashboard from "./pages/Dashboard";
import Doctor from "./pages/doctor";
import PatientManagement from "./pages/patient";
import Appointments from './pages/Appointments';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <Router>
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Routes>
          <Route path="/" element={
            <ProtectedRoute userRole={user.role} allowedRoles={['admin', 'receptionist']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctors" element={
            <ProtectedRoute userRole={user.role} allowedRoles={['admin', 'doctor']}>
              <Doctor />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute userRole={user.role} allowedRoles={['admin', 'doctor', 'nurse']}>
              <PatientManagement />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute userRole={user.role} allowedRoles={['admin', 'receptionist']}>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;