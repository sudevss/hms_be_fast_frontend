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



import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from './components/LoginScreen';
import Dashboard from "./pages/Dashboard";
import Doctor from "./pages/doctor";
import PatientManagement from "./pages/patient";
import Appointments from './pages/Appointments';

function App() {
  const [user, setUser] = useState(null);
  
  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/doctors" element={<Doctor />} />
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;