import React, { useState } from 'react';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would validate credentials here
    if (username && password && role) {
      onLogin({ username, role });
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Background image - medical professional working on computer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://img.freepik.com/free-photo/close-up-hands-typing-keyboard_23-2148868183.jpg?ga=GA1.1.932750057.1724345502&semt=ais_hybrid&w=740"
            alt="Medical professional at computer" 
            className="w-full h-full object-cover transform scale-110"
            style={{ filter: 'blur(5px)' }} // Blur effect for background image
          />
        </div>
        
        {/* Overlay to darken the image slightly */}
        <div className="absolute inset-0 bg-black bg-opacity-10 z-10"></div>
        
        <div className="relative z-20 flex flex-col items-center justify-center p-8 min-h-[600px]">
          {/* Medical logo */}
          <div className="mb-6">
            <svg viewBox="0 0 100 100" className="w-20 h-20 text-teal-600">
              <path 
                fill="currentColor" 
                d="M50,10 C40,10 30,15 30,35 L30,45 L15,45 L15,65 L30,65 L30,90 L70,90 L70,65 L85,65 L85,45 L70,45 L70,35 C70,15 60,10 50,10 Z M50,20 C55,20 60,22 60,35 L60,45 L40,45 L40,35 C40,22 45,20 50,20 Z" 
              />
              <path 
                fill="currentColor" 
                d="M50,30 C45,30 45,35 50,35 C55,35 55,30 50,30 Z" 
              />
              <path 
                fill="currentColor" 
                d="M40,55 L60,55 M50,45 L50,65" 
                stroke="currentColor"
                strokeWidth="5"
              />
            </svg>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold mb-10 text-center">MediVerse Health Care</h1>
          
          {/* Login form */}
          <div className="bg-white p-8 rounded-lg shadow-md w-96">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="User Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="mb-6">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="" disabled>Role</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="admin">Admin</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-teal-700 text-white py-2 px-4 rounded-md hover:bg-teal-800 transition duration-300"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;