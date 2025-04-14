// import React from 'react';
// import { X } from 'lucide-react';

// const PatientHistoryModal = ({ isOpen, onClose, patientData }) => {
//   if (!isOpen) return null;

//   // Sample patient visit history data
//   const visitHistory = [
//     {
//       date: '12/3/25',
//       timeSlot: '9-10 am',
//       doctor: 'Dr.Ranjith',
//       diagnosis: '',
//       prescription: '',
//     },
//     {
//       date: '11/1/25',
//       timeSlot: '9-10 am',
//       doctor: 'Dr.Ranjith',
//       diagnosis: '',
//       prescription: '',
//     },
//     {
//       date: '15/12/24',
//       timeSlot: '9-10 am',
//       doctor: 'Dr.Ranjith',
//       diagnosis: '',
//       prescription: '',
//     },
//     {
//       date: '15/10/24',
//       timeSlot: '9-10 am',
//       doctor: 'Dr.Ranjith',
//       diagnosis: '',
//       prescription: '',
//     }
//   ];

//   // Use patient data from props or fallback to sample data
//   const patient = patientData || {
//     name: 'First Name Last Name',
//     id: '123',
//     totalVisits: 4
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 mx-4">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold text-center w-full">Patient History</h2>
//           <button 
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         <div className="mb-6 flex justify-between">
//           <div className="flex-1">
//             <p className="font-semibold">Patient Name: {patient.name}</p>
//           </div>
//           <div className="flex-1 text-center">
//             <p className="font-semibold">Patient Id: {patient.id}</p>
//           </div>
//           <div className="flex-1 text-right">
//             <p className="font-semibold">Total visits: {patient.totalVisits}</p>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr>
//                 <th className="bg-teal-600 text-white p-3">Date</th>
//                 <th className="bg-teal-600 text-white p-3">Time Slot</th>
//                 <th className="bg-teal-600 text-white p-3">Doctor</th>
//                 <th className="bg-teal-600 text-white p-3">Diagnosis</th>
//                 <th className="bg-teal-600 text-white p-3">Prescription</th>
//                 <th className="bg-teal-600 text-white p-3">Lab Reports</th>
//               </tr>
//             </thead>
//             <tbody>
//               {visitHistory.map((visit, index) => (
//                 <tr key={index} className="border-b">
//                   <td className="p-3 text-center">{visit.date}</td>
//                   <td className="p-3 text-center">{visit.timeSlot}</td>
//                   <td className="p-3 text-center">{visit.doctor}</td>
//                   <td className="p-3 text-center">{visit.diagnosis}</td>
//                   <td className="p-3 text-center">{visit.prescription}</td>
//                   <td className="p-3 text-center">
//                     <button 
//                       className="bg-white border border-gray-300 rounded-lg px-4 py-1 hover:bg-gray-100"
//                     >
//                       Reports
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               <tr className="border-b">
//                 <td className="p-3"></td>
//                 <td className="p-3"></td>
//                 <td className="p-3"></td>
//                 <td className="p-3"></td>
//                 <td className="p-3"></td>
//                 <td className="p-3"></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PatientHistoryModal;







import React from 'react';
import { X } from 'lucide-react';

const PatientHistoryModal = ({ isOpen, onClose, patient }) => {
  if (!isOpen || !patient) return null;

  // Sample visit history data - in a real implementation, this would be fetched based on patient id
  const visitHistory = [
    {
      date: '12/3/25',
      timeSlot: '9-10 am',
      doctor: 'Dr.Ranjith',
      diagnosis: '',
      prescription: '',
    },
    {
      date: '11/1/25',
      timeSlot: '9-10 am',
      doctor: 'Dr.Ranjith',
      diagnosis: '',
      prescription: '',
    },
    {
      date: '15/12/24',
      timeSlot: '9-10 am',
      doctor: 'Dr.Ranjith',
      diagnosis: '',
      prescription: '',
    },
    {
      date: '15/10/24',
      timeSlot: '9-10 am',
      doctor: 'Dr.Ranjith',
      diagnosis: '',
      prescription: '',
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 shadow-lg w-[800px] max-h-screen overflow-y-auto flex flex-col rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Patient History</h2>
        
        <div className="flex justify-between mb-4">
          <div>Patient Name: {patient.name}</div>
          <div>Patient Id: {patient.id}</div>
          <div>Total visits: 4</div>
        </div>

        <table className="w-full border">
          <thead>
            <tr>
              <th className="p-3 text-center bg-teal-600 text-white border">Date</th>
              <th className="p-3 text-center bg-teal-600 text-white border">Time Slot</th>
              <th className="p-3 text-center bg-teal-600 text-white border">Doctor</th>
              <th className="p-3 text-center bg-teal-600 text-white border">Diagnosis</th>
              <th className="p-3 text-center bg-teal-600 text-white border">Prescription</th>
              <th className="p-3 text-center bg-teal-600 text-white border">Lab Reports</th>
            </tr>
          </thead>
          <tbody>
            {visitHistory.map((visit, index) => (
              <tr key={index} className="border">
                <td className="p-3 border">{visit.date}</td>
                <td className="p-3 border">{visit.timeSlot}</td>
                <td className="p-3 border">{visit.doctor}</td>
                <td className="p-3 border">{visit.diagnosis}</td>
                <td className="p-3 border">{visit.prescription}</td>
                <td className="p-3 border text-center">
                  <button className="bg-gray-200 px-2 py-1 rounded">Reports</button>
                </td>
              </tr>
            ))}
            <tr className="border">
              <td className="p-3 border"></td>
              <td className="p-3 border"></td>
              <td className="p-3 border"></td>
              <td className="p-3 border"></td>
              <td className="p-3 border"></td>
              <td className="p-3 border"></td>
            </tr>
          </tbody>
        </table>

        {/* Close Button */}
        <div className="flex justify-center mt-4">
          <button
            className="bg-teal-600 text-white px-6 py-2 rounded-lg"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryModal;