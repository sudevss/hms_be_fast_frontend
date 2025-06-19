import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PatientHistoryModal from '../components/PatientHistoryModal';

const PatientManagement = () => {
  // State for search and patient selection
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  // Modal visibility states
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);
  
  // Mock patient data - Replace with API call in production
  const [patients, setPatients] = useState([
    { 
      id: 123, 
      name: "Sujith M T", 
      phone: "6467473789", 
      age: 42, 
      place: "Calicut", 
      adharId: "341543", 
      gender: "M", 
      lastVisited: "20/02/2025", 
      doctorVisited: "Dr.Ranjith" 
    }
  ]);

  // Filter patients based on search term (name or phone)
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.phone.includes(searchTerm)
  );

  // Event Handlers
  const handleAddPatient = () => {
    setShowAddPatient(true);
  };

  const handleNewBooking = () => {
    console.log("New booking initiated");
    // TODO: Implement booking functionality
  };

  const handleViewHistory = () => {
    if (selectedPatientId) {
      const patient = patients.find(p => p.id === selectedPatientId);
      setSelectedPatientForHistory(patient);
      setShowHistoryModal(true);
    } else {
      alert("Please select a patient first");
    }
  };

  const handleEdit = () => {
    if (!selectedPatientId) {
      alert("Please select a patient to edit");
      return;
    }
    console.log("Editing patient");
    // TODO: Implement edit functionality
  };

  const handleSelectPatient = (id) => {
    // Toggle selection if clicking the same patient
    if (selectedPatientId === id) {
      setSelectedPatientId(null);
    } else {
      setSelectedPatientId(id);
    }
  };

  return (
    <>
      {/* Main Layout */}
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 ml-56 p-6">
          <h1 className="text-2xl font-bold mb-4">Patient Management</h1>
          
          {/* Search and Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="flex items-center bg-white rounded-lg p-2 flex-1 mr-4 border border-gray-300">
              <Search className="text-gray-500 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search Patient"
                className="outline-none w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
                onClick={handleAddPatient}
              >
                Add Patient
              </button>
              <button
                className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
                onClick={handleNewBooking}
              >
                New Booking
              </button>
              <button
                className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
                onClick={handleViewHistory}
              >
                History
              </button>
              <button
                className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
                onClick={handleEdit}
              >
                Edit
              </button>
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-3 text-left bg-teal-600 text-white">Select</th>
                  <th className="p-3 text-left bg-teal-600 text-white">Patient id</th>
                  <th className="p-3 text-left bg-teal-600 text-white">Name</th>
                  <th className="p-3 text-left bg-teal-600 text-white">Phone Number</th>
                  <th className="p-3 text-left bg-teal-600 text-white">Age</th>
                  <th className="p-3 text-left bg-teal-600 text-white">Place</th>
                  <th className="p-3 text-left bg-teal-600 text-white">Adhar ID</th>
                  <th className="p-3 text-left bg-teal-600 text-white">Gender</th>
                  <th className="p-3 text-left bg-teal-600 text-white">Last Visited</th>
                  <th className="p-3 text-left bg-teal-600 text-white">Doctor Visited</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={selectedPatientId === patient.id}
                        onChange={() => handleSelectPatient(patient.id)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="p-3">{patient.id}</td>
                    <td className="p-3">{patient.name}</td>
                    <td className="p-3">{patient.phone}</td>
                    <td className="p-3">{patient.age}</td>
                    <td className="p-3">{patient.place}</td>
                    <td className="p-3">{patient.adharId}</td>
                    <td className="p-3">{patient.gender}</td>
                    <td className="p-3">{patient.lastVisited}</td>
                    <td className="p-3">{patient.doctorVisited}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 shadow-lg w-[500px] max-h-screen overflow-y-auto flex flex-col rounded-lg relative">
            <button 
              onClick={() => setShowAddPatient(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-bold mb-4 text-center">Add Patient</h2>

            {/* Patient Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">First Name</label>
                <input type="text" className="border p-2 rounded-lg w-full" />
              </div>

              <div>
                <label className="block mb-1 font-medium">Last Name</label>
                <input type="text" className="border p-2 rounded-lg w-full" />
              </div>

              <div>
                <label className="block mb-1 font-medium">Age</label>
                <input type="number" className="border p-2 rounded-lg w-full" />
              </div>

              <div>
                <label className="block mb-1 font-medium">Gender</label>
                <select className="border p-2 rounded-lg w-full">
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input type="tel" className="border p-2 rounded-lg w-full" />
              </div>

              <div>
                <label className="block mb-1 font-medium">Adhar ID</label>
                <input type="text" className="border p-2 rounded-lg w-full" />
              </div>

              <div>
                <label className="block mb-1 font-medium">Place</label>
                <input type="text" className="border p-2 rounded-lg w-full" />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-center mt-6">
              <button
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
                onClick={() => setShowAddPatient(false)}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient History Modal */}
      <PatientHistoryModal 
        isOpen={showHistoryModal} 
        onClose={() => setShowHistoryModal(false)} 
        patient={selectedPatientForHistory}
      />
    </>
  );
};

export default PatientManagement;