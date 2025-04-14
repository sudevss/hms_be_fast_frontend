// import React, { useState } from 'react';
// import { Search, User } from 'lucide-react';
// import Sidebar from '../components/Sidebar';

// const PatientManagement = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showAddPatient, setShowAddPatient] = useState(false);
//   const [selectedPatientId, setSelectedPatientId] = useState(null);
//   const [patients, setPatients] = useState([
//     { 
//       id: 123, 
//       name: "Sujith M T", 
//       phone: "6467473789", 
//       age: 42, 
//       place: "Calicut", 
//       adharId: "341543", 
//       gender: "M", 
//       lastVisited: "20/02/2025", 
//       doctorVisited: "Dr.Ranjith" 
//     },
//     // You can add more patient records here
//   ]);

//   const filteredPatients = patients.filter(patient => 
//     patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//     patient.phone.includes(searchTerm)
//   );

//   const handleAddPatient = () => {
//     setShowAddPatient(true);
//   };

//   const handleNewBooking = () => {
//     // Handle new booking logic
//     console.log("New booking initiated");
//   };

//   const handleViewHistory = () => {
//     // Handle viewing patient history
//     console.log("Viewing history");
//   };

//   const handleEdit = () => {
//     // Handle editing patient info
//     console.log("Editing patient");
//   };

//   const handleSelectPatient = (id) => {
//     if (selectedPatientId === id) {
//       setSelectedPatientId(null);
//     } else {
//       setSelectedPatientId(id);
//     }
//   };

//   return (
//     <>
//       <div className="flex min-h-screen bg-gray-50">
//         {/* Sidebar */}
//         <Sidebar />

//         {/* Main Content */}
//         <div className="flex-1 ml-56 p-6">
//           <h1 className="text-2xl font-bold mb-4">Patient Management</h1>
//           <div className="flex items-center justify-between mb-6">
//             {/* Search Input */}
//             <div className="flex items-center bg-white rounded-lg p-2 flex-1 mr-4 border border-gray-300">
//               <Search className="text-gray-500 mr-2" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search Patient"
//                 className="outline-none w-full"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-4">
//               <button
//                 className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
//                 onClick={handleAddPatient}
//               >
//                 Add Patient
//               </button>
//               <button
//                 className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
//                 onClick={handleNewBooking}
//               >
//                 New Booking
//               </button>
//               <button
//                 className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
//                 onClick={handleViewHistory}
//               >
//                 History
//               </button>
//               <button
//                 className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
//                 onClick={handleEdit}
//               >
//                 Edit
//               </button>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <table className="w-full">
//               <thead>
//                 <tr>
//                   <th className="p-3 text-left bg-teal-600 text-white">Select</th>
//                   <th className="p-3 text-left bg-teal-600 text-white">Patient id</th>
//                   <th className="p-3 text-left bg-teal-600 text-white">Name</th>
//                   <th className="p-3 text-left bg-teal-600 text-white">Phone Number</th>
//                   <th className="p-3 text-left bg-teal-600 text-white">Age</th>
//                   <th className="p-3 text-left bg-teal-600 text-white">Place</th>
//                   <th className="p-3 text-left bg-teal-600 text-white">Adhar ID</th>
//                   <th className="p-3 text-left bg-teal-600 text-white">Gender</th>
//                   <th className="p-3 text-left bg-teal-600 text-white">Last Visited</th>
//                   <th className="p-3 text-left bg-teal-600 text-white">Doctor Visited</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredPatients.map((patient) => (
//                   <tr key={patient.id} className="border-b">
//                     <td className="p-3">
//                       <input 
//                         type="checkbox" 
//                         checked={selectedPatientId === patient.id}
//                         onChange={() => handleSelectPatient(patient.id)}
//                       />
//                     </td>
//                     <td className="p-3">{patient.id}</td>
//                     <td className="p-3">{patient.name}</td>
//                     <td className="p-3">{patient.phone}</td>
//                     <td className="p-3">{patient.age}</td>
//                     <td className="p-3">{patient.place}</td>
//                     <td className="p-3">{patient.adharId}</td>
//                     <td className="p-3">{patient.gender}</td>
//                     <td className="p-3">{patient.lastVisited}</td>
//                     <td className="p-3">{patient.doctorVisited}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Add Patient Modal */}
//       {showAddPatient && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 shadow-lg w-[500px] max-h-screen overflow-y-auto flex flex-col rounded-lg">
//             <h2 className="text-xl font-bold mb-4 text-center">Add Patient</h2>

//             {/* Patient Details Form */}
//             <div className="mb-4">
//               <label className="block mb-1">First Name</label>
//               <input type="text" className="border p-2 rounded-lg w-full" />
//             </div>

//             <div className="mb-4">
//               <label className="block mb-1">Last Name</label>
//               <input type="text" className="border p-2 rounded-lg w-full" />
//             </div>

//             <div className="mb-4">
//               <label className="block mb-1">Age</label>
//               <input type="number" className="border p-2 rounded-lg w-full" />
//             </div>

//             <div className="mb-4">
//               <label className="block mb-1">Gender</label>
//               <select className="border p-2 rounded-lg w-full">
//                 <option value="">Select Gender</option>
//                 <option value="M">Male</option>
//                 <option value="F">Female</option>
//                 <option value="O">Other</option>
//               </select>
//             </div>

//             <div className="mb-4">
//               <label className="block mb-1">Phone</label>
//               <input type="text" className="border p-2 rounded-lg w-full" />
//             </div>

//             <div className="mb-4">
//               <label className="block mb-1">Adhar ID</label>
//               <input type="text" className="border p-2 rounded-lg w-full" />
//             </div>

//             <div className="mb-4">
//               <label className="block mb-1">Place</label>
//               <input type="text" className="border p-2 rounded-lg w-full" />
//             </div>

//             {/* Submit Button */}
//             <div className="flex justify-center mt-auto">
//               <button
//                 className="bg-teal-600 text-white px-6 py-2 rounded-lg"
//                 onClick={() => setShowAddPatient(false)}
//               >
//                 Add
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Patient History Modal - based on Image 2 */}
//       {selectedPatientId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 shadow-lg w-[800px] max-h-screen overflow-y-auto flex flex-col rounded-lg">
//             <h2 className="text-xl font-bold mb-4 text-center">Patient History</h2>
            
//             <div className="flex justify-between mb-4">
//               <div>Patient Name: {patients.find(p => p.id === selectedPatientId)?.name}</div>
//               <div>Patient id: {selectedPatientId}</div>
//               <div>Total visits: 4</div>
//             </div>

//             <table className="w-full border">
//               <thead>
//                 <tr>
//                   <th className="p-3 text-center bg-teal-600 text-white border">Date</th>
//                   <th className="p-3 text-center bg-teal-600 text-white border">Time Slot</th>
//                   <th className="p-3 text-center bg-teal-600 text-white border">Doctor</th>
//                   <th className="p-3 text-center bg-teal-600 text-white border">Diagnosis</th>
//                   <th className="p-3 text-center bg-teal-600 text-white border">Prescription</th>
//                   <th className="p-3 text-center bg-teal-600 text-white border">Lab Reports</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr className="border">
//                   <td className="p-3 border">12/3/25</td>
//                   <td className="p-3 border">9-10 am</td>
//                   <td className="p-3 border">Dr.Ranjith</td>
//                   <td className="p-3 border"></td>
//                   <td className="p-3 border"></td>
//                   <td className="p-3 border text-center">
//                     <button className="bg-gray-200 px-2 py-1 rounded">Reports</button>
//                   </td>
//                 </tr>
//                 <tr className="border">
//                   <td className="p-3 border">11/1/25</td>
//                   <td className="p-3 border">9-10 am</td>
//                   <td className="p-3 border">Dr.Ranjith</td>
//                   <td className="p-3 border"></td>
//                   <td className="p-3 border"></td>
//                   <td className="p-3 border text-center">
//                     <button className="bg-gray-200 px-2 py-1 rounded">Reports</button>
//                   </td>
//                 </tr>
//                 <tr className="border">
//                   <td className="p-3 border">15/12/24</td>
//                   <td className="p-3 border">9-10 am</td>
//                   <td className="p-3 border">Dr.Ranjith</td>
//                   <td className="p-3 border"></td>
//                   <td className="p-3 border"></td>
//                   <td className="p-3 border text-center">
//                     <button className="bg-gray-200 px-2 py-1 rounded">Reports</button>
//                   </td>
//                 </tr>
//                 <tr className="border">
//                   <td className="p-3 border">15/10/24</td>
//                   <td className="p-3 border">9-10 am</td>
//                   <td className="p-3 border">Dr.Ranjith</td>
//                   <td className="p-3 border"></td>
//                   <td className="p-3 border"></td>
//                   <td className="p-3 border text-center">
//                     <button className="bg-gray-200 px-2 py-1 rounded">Reports</button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>

//             {/* Close Button */}
//             <div className="flex justify-center mt-4">
//               <button
//                 className="bg-teal-600 text-white px-6 py-2 rounded-lg"
//                 onClick={() => setSelectedPatientId(null)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default PatientManagement;









































































// // import React, { useState } from 'react';
// // import { Search, Plus, Printer, FileText, Edit, Trash2 } from 'lucide-react';
// // import Sidebar from '../components/Sidebar';
// // import PatientHistoryModal from '../components/PatientHistoryModal';

// // const PatientManagement = () => {
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [showAddPatient, setShowAddPatient] = useState(false);
// //   const [showHistoryModal, setShowHistoryModal] = useState(false);
// //   const [selectedPatient, setSelectedPatient] = useState(null);

// //   // Sample patient data
// //   const [patients, setPatients] = useState([
// //     { id: 'P001', name: 'John Doe', age: 35, gender: 'Male', phone: '1234567890', address: '123 Main St' },
// //     { id: 'P002', name: 'Jane Smith', age: 28, gender: 'Female', phone: '0987654321', address: '456 Oak Ave' },
// //     { id: 'P003', name: 'Robert Johnson', age: 42, gender: 'Male', phone: '5551234567', address: '789 Pine Rd' },
// //     { id: 'P004', name: 'Sarah Williams', age: 30, gender: 'Female', phone: '5559876543', address: '321 Elm Blvd' },
// //     { id: 'P005', name: 'Michael Brown', age: 50, gender: 'Male', phone: '4447891234', address: '654 Maple Dr' },
// //   ]);

// //   const filteredPatients = patients.filter(patient => 
// //     patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //     patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //     patient.phone.includes(searchQuery)
// //   );

// //   const handleOpenHistory = (patient) => {
// //     setSelectedPatient(patient);
// //     setShowHistoryModal(true);
// //   };

// //   const handleDeletePatient = (id) => {
// //     const updatedPatients = patients.filter(patient => patient.id !== id);
// //     setPatients(updatedPatients);
// //   };

// //   return (
// //     <>
// //       <div className="flex min-h-screen bg-gray-50">
// //         {/* Sidebar */}
// //         <Sidebar />

// //         {/* Main Content */}
// //         <div className="flex-1 ml-56 p-6">
// //           <h1 className="text-2xl font-bold mb-6">Patient Management</h1>
          
// //           <div className="flex items-center justify-between mb-6">
// //             {/* Search */}
// //             <div className="flex items-center bg-white rounded-lg p-2 border border-gray-300 w-96">
// //               <input
// //                 type="text"
// //                 placeholder="Search patients..."
// //                 className="outline-none w-full"
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //               />
// //               <Search className="text-gray-500 ml-2" size={20} />
// //             </div>

// //             {/* Action Buttons */}
// //             <div className="flex gap-4">
// //               <button
// //                 className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg"
// //                 onClick={() => setShowAddPatient(true)}
// //               >
// //                 <Plus size={20} className="mr-2" />
// //                 Add Patient
// //               </button>
// //               <button className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-lg">
// //                 <Printer size={20} className="mr-2" />
// //                 Print
// //               </button>
// //             </div>
// //           </div>

// //           {/* Patients Table */}
// //           <div className="bg-white rounded-lg shadow overflow-hidden">
// //             <table className="w-full">
// //               <thead>
// //                 <tr>
// //                   <th className="p-3 text-left bg-teal-600 text-white">Patient ID</th>
// //                   <th className="p-3 text-left bg-teal-600 text-white">Name</th>
// //                   <th className="p-3 text-left bg-teal-600 text-white">Age</th>
// //                   <th className="p-3 text-left bg-teal-600 text-white">Gender</th>
// //                   <th className="p-3 text-left bg-teal-600 text-white">Phone</th>
// //                   <th className="p-3 text-left bg-teal-600 text-white">Address</th>
// //                   <th className="p-3 text-center bg-teal-600 text-white">Action</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {filteredPatients.map((patient) => (
// //                   <tr key={patient.id} className="border-b">
// //                     <td className="p-3">{patient.id}</td>
// //                     <td className="p-3">{patient.name}</td>
// //                     <td className="p-3">{patient.age}</td>
// //                     <td className="p-3">{patient.gender}</td>
// //                     <td className="p-3">{patient.phone}</td>
// //                     <td className="p-3">{patient.address}</td>
// //                     <td className="p-3">
// //                       <div className="flex justify-center gap-3">
// //                         <button 
// //                           className="text-blue-600 hover:text-blue-800"
// //                           onClick={() => handleOpenHistory(patient)}
// //                         >
// //                           <FileText size={18} />
// //                         </button>
// //                         <button className="text-green-600 hover:text-green-800">
// //                           <Edit size={18} />
// //                         </button>
// //                         <button 
// //                           className="text-red-600 hover:text-red-800"
// //                           onClick={() => handleDeletePatient(patient.id)}
// //                         >
// //                           <Trash2 size={18} />
// //                         </button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Patient History Modal */}
// //       <PatientHistoryModal 
// //         isOpen={showHistoryModal} 
// //         onClose={() => setShowHistoryModal(false)} 
// //         patientData={selectedPatient}
// //       />

// //       {/* Add Patient Modal (would be implemented here) */}
// //       {showAddPatient && (
// //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
// //           <div className="bg-white p-6 shadow-lg w-[500px] max-h-screen overflow-y-auto flex flex-col rounded-lg">
// //             <h2 className="text-xl font-bold mb-4 text-center">Add New Patient</h2>

// //             {/* Form fields would go here */}
            
// //             {/* Submit Button */}
// //             <div className="flex justify-center mt-auto">
// //               <button
// //                 className="bg-teal-600 text-white px-6 py-2 rounded-lg"
// //                 onClick={() => setShowAddPatient(false)}
// //               >
// //                 Add Patient
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // };

// // export default PatientManagement;


















import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PatientHistoryModal from '../components/PatientHistoryModal';

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);
  
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
    },
    // You can add more patient records here
  ]);

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.phone.includes(searchTerm)
  );

  const handleAddPatient = () => {
    setShowAddPatient(true);
  };

  const handleNewBooking = () => {
    // Handle new booking logic
    console.log("New booking initiated");
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
    // Handle editing patient info
    console.log("Editing patient");
  };

  const handleSelectPatient = (id) => {
    if (selectedPatientId === id) {
      setSelectedPatientId(null);
    } else {
      setSelectedPatientId(id);
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-56 p-6">
          <h1 className="text-2xl font-bold mb-4">Patient Management</h1>
          <div className="flex items-center justify-between mb-6">
            {/* Search Input */}
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
                  <tr key={patient.id} className="border-b">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={selectedPatientId === patient.id}
                        onChange={() => handleSelectPatient(patient.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 shadow-lg w-[500px] max-h-screen overflow-y-auto flex flex-col rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Add Patient</h2>

            {/* Patient Details Form */}
            <div className="mb-4">
              <label className="block mb-1">First Name</label>
              <input type="text" className="border p-2 rounded-lg w-full" />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Last Name</label>
              <input type="text" className="border p-2 rounded-lg w-full" />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Age</label>
              <input type="number" className="border p-2 rounded-lg w-full" />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Gender</label>
              <select className="border p-2 rounded-lg w-full">
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1">Phone</label>
              <input type="text" className="border p-2 rounded-lg w-full" />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Adhar ID</label>
              <input type="text" className="border p-2 rounded-lg w-full" />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Place</label>
              <input type="text" className="border p-2 rounded-lg w-full" />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-auto">
              <button
                className="bg-teal-600 text-white px-6 py-2 rounded-lg"
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