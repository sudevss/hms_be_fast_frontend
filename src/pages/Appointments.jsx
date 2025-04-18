import React, { useState } from 'react';
import { Search, Calendar, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("bookingId"); // bookingId, patientName, doctorName
  const [selectedBookingId, setSelectedBookingId] = useState("001");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddBooking, setShowAddBooking] = useState(false);
  
  // Doctor filter states
  const [selectedDoctors, setSelectedDoctors] = useState({
    "Dr.Ranjith": true,
    "Dr.Suneer": false,
    "Dr.Nithin": false,
    "Dr.Jamsheed": false,
    "Dr.Rajnith": false
  });

  const doctors = ["Dr.Ranjith", "Dr.Suneer", "Dr.Nithin", "Dr.Jamsheed", "Dr.Rajnith"];
  
  const [appointments, setAppointments] = useState([
    { 
      id: "001", 
      name: "Sujith M T", 
      phone: "6467473789", 
      doctor: "Dr.Ranjith", 
      bookingDate: "15/03/2025", 
      timeSlot: "9-10 am", 
      paid: true, 
      consultationFee: "Rs.150" 
    },
    { 
      id: "002", 
      name: "Sanju P", 
      phone: "9866357206", 
      doctor: "Dr.Nithin", 
      bookingDate: "15/03/2025", 
      timeSlot: "9-10 am", 
      paid: false, 
      consultationFee: "Rs.150" 
    },
  ]);

  const handleDoctorFilter = (doctor) => {
    setSelectedDoctors({
      ...selectedDoctors,
      [doctor]: !selectedDoctors[doctor]
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Filter by search term based on selected search type
    if (searchTerm) {
      if (searchType === "bookingId" && !appointment.id.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (searchType === "patientName" && !appointment.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (searchType === "doctorName" && !appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by selected doctors
    if (!selectedDoctors[appointment.doctor]) {
      return false;
    }
    
    return true;
  });

  const handleSelectBooking = (id) => {
    setSelectedBookingId(id === selectedBookingId ? null : id);
  };

  const handleCheckIn = () => {
    if (!selectedBookingId) return;
    console.log("Check in for booking ID:", selectedBookingId);
  };

  const handleEdit = () => {
    if (!selectedBookingId) return;
    console.log("Edit booking ID:", selectedBookingId);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // You would typically fetch appointments for this date
    console.log("Selected date:", date);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setSearchTerm(""); // Clear search term when changing type
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-56 p-6">
          <h1 className="text-2xl font-bold mb-4">Appointments</h1>
          
          <div className="flex items-center justify-between mb-6">
            {/* Enhanced Search with Dropdown */}
            <div className="flex items-center bg-white rounded-lg p-2 border border-gray-300 w-96">
              <div className="relative inline-block text-left mr-2">
                <select
                  value={searchType}
                  onChange={(e) => handleSearchTypeChange(e.target.value)}
                  className="appearance-none bg-gray-100 px-3 py-1 rounded text-sm font-medium outline-none"
                >
                  <option value="bookingId">Booking ID</option>
                  <option value="patientName">Patient Name</option>
                  <option value="doctorName">Doctor Name</option>
                </select>
              </div>
              <input
                type="text"
                placeholder={searchType === "bookingId" ? "Search by Booking ID" : 
                            searchType === "patientName" ? "Search by Patient Name" : 
                            "Search by Doctor Name"}
                className="outline-none w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="text-gray-500 ml-2" size={20} />
            </div>

            {/* Date Picker */}
            <div className="flex items-center">
              <button className="bg-white p-2 rounded-lg border border-gray-300">
                <Calendar size={20} />
              </button>
            </div>

            {/* Total Booking */}
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-300">
              Total booking: {filteredAppointments.length}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                className="bg-white px-4 py-2 rounded-lg border border-gray-300"
                onClick={handleCheckIn}
              >
                Check In
              </button>
              <button
                className="bg-white px-4 py-2 rounded-lg border border-gray-300"
                onClick={handleEdit}
              >
                Edit
              </button>
              <button
                className="bg-teal-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowAddBooking(true)}
              >
                New Booking
              </button>
            </div>
          </div>

          {/* Doctor Filter Buttons */}
          <div className="flex gap-2 mb-6">
            {doctors.map((doctor) => (
              <button
                key={doctor}
                className={`px-4 py-2 rounded-lg ${
                  selectedDoctors[doctor] ? "bg-teal-600 text-white" : "bg-white border border-gray-300"
                }`}
                onClick={() => handleDoctorFilter(doctor)}
              >
                {doctor}
              </button>
            ))}
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-3 text-center bg-teal-600 text-white">Select</th>
                  <th className="p-3 text-center bg-teal-600 text-white">Booking Id</th>
                  <th className="p-3 text-center bg-teal-600 text-white">Name</th>
                  <th className="p-3 text-center bg-teal-600 text-white">Phone Number</th>
                  <th className="p-3 text-center bg-teal-600 text-white">Doctor</th>
                  <th className="p-3 text-center bg-teal-600 text-white">Booking Date</th>
                  <th className="p-3 text-center bg-teal-600 text-white">Time Slot</th>
                  <th className="p-3 text-center bg-teal-600 text-white">Paid</th>
                  <th className="p-3 text-center bg-teal-600 text-white">Consultation fee</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b">
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <input 
                          type="checkbox" 
                          checked={selectedBookingId === appointment.id}
                          onChange={() => handleSelectBooking(appointment.id)}
                          className="form-checkbox"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-center">{appointment.id}</td>
                    <td className="p-3">{appointment.name}</td>
                    <td className="p-3">{appointment.phone}</td>
                    <td className="p-3">{appointment.doctor}</td>
                    <td className="p-3">{appointment.bookingDate}</td>
                    <td className="p-3">{appointment.timeSlot}</td>
                    <td className="p-3 text-center">
                      {appointment.paid && (
                        <div className="flex justify-center">
                          <Check className="text-green-500" size={20} />
                        </div>
                      )}
                    </td>
                    <td className="p-3">{appointment.consultationFee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Booking Modal */}
      {showAddBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 shadow-lg w-96 max-h-screen overflow-y-auto flex flex-col rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-center">New Booking</h2>

            {/* Form fields would go here */}
            
            {/* Modal Action Buttons */}
            <div className="flex justify-between mt-6">
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg"
                onClick={() => setShowAddBooking(false)}
              >
                Cancel
              </button>
              <button
                className="bg-teal-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowAddBooking(false)}
              >
                Create Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Appointments;