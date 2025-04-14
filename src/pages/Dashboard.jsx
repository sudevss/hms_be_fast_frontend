
import React, { useState, useRef, useEffect } from 'react';
import { Heart, Search, Calendar, Users, UserCog, Settings, LogOut, LayoutGrid, Clock, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';


const data = [
  { hour: '9', bookings: 30 },
  { hour: '10', bookings: 45 },
  { hour: '11', bookings: 35 },
  { hour: '12', bookings: 25 },
  { hour: '1', bookings: 40 },
  { hour: '2', bookings: 50 },
  { hour: '3', bookings: 30 },
  { hour: '4', bookings: 35 },
  { hour: '5', bookings: 45 },
  { hour: '6', bookings: 40 },
  { hour: '7', bookings: 25 },
];

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [checkedRows, setCheckedRows] = useState({
    'A1': true,
    'W1': true,
    'A3': true
  });
  const [doctorSearch, setDoctorSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Add state for patient modal
  const [showPatientModal, setShowPatientModal] = useState(false);
  // Add state for booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  // Add state for check-in modal
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  
  // Add state for patient form fields
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    place: '',
    gender: '',
    abhaId: '',
    dob: new Date(), // Added proper date field
  });
  
  // Add state for booking form fields
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    doctor: '',
    date: new Date(),
    time: '',
    tokenType: 'A',
    notes: ''
  });
  
  // Add state for check-in form fields
  const [checkInForm, setCheckInForm] = useState({
    bookingId: '001',
    patientName: 'First Name Last Name',
    phone: '6197553996',
    date: new Date(),
    timeSlot: '9am-10am',
    consultationFee: '',
    paid: false,
    paymentMethod: ''
  });
  
  // Available time slots
  const timeSlots = [
    '9am-10am',
    '10am-11am',
    '11am-12pm',
    '12pm-1pm',
    '1pm-2pm',
    '2pm-3pm',
    '3pm-4pm'
  ];
  
  // Payment methods
  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'UPI',
    'Insurance'
  ];
  
  // Create refs for modals to handle outside clicks
  const patientModalRef = useRef(null);
  const bookingModalRef = useRef(null);
  const checkInModalRef = useRef(null);

  const doctors = [
    { name: 'Dr.Ranjith', role: 'Physician', status: 'On Duty' },
    { name: 'Dr.Suneer', role: 'Physician', status: 'Off Duty' },
    { name: 'Dr.Nithin', role: 'Pediatrician', status: 'On Duty' },
    { name: 'Dr.Jamsheed', role: 'Diabetologist', status: 'On Duty' }
  ];

  const appointmentData = [
    { id: 'A1', token: 'A1', name: 'Sujith', age: 42, time: '8:45 Am', doctor: 'Dr.Jamsheed' },
    { id: 'A2', token: 'A2', name: 'Rejith', age: 42, time: '8:50 Am', doctor: 'Dr.Jamsheed' },
    { id: 'W1', token: 'W1', name: 'Anoop', age: 42, time: '9:00 Am', doctor: 'Dr.Jamsheed' },
    { id: 'A3', token: 'A3', name: 'Shiva', age: 42, time: '9:15 Am', doctor: 'Dr.Jamsheed' },
  ];

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(doctorSearch.toLowerCase())
  );
  
  const filteredAppointments = appointmentData.filter(appointment =>
    appointment.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    appointment.doctor.toLowerCase().includes(globalSearch.toLowerCase()) ||
    appointment.token.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const toggleCheckbox = (id) => {
    setCheckedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle click outside modals to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (patientModalRef.current && !patientModalRef.current.contains(event.target)) {
        setShowPatientModal(false);
      }
      if (bookingModalRef.current && !bookingModalRef.current.contains(event.target)) {
        setShowBookingModal(false);
      }
      if (checkInModalRef.current && !checkInModalRef.current.contains(event.target)) {
        setShowCheckInModal(false);
      }
    }

    // Add event listener when a modal is shown
    if (showPatientModal || showBookingModal || showCheckInModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPatientModal, showBookingModal, showCheckInModal]);

  // Handle input changes in patient form
  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date change in patient form
  const handlePatientDobChange = (date) => {
    setPatientForm(prev => ({
      ...prev,
      dob: date
    }));
  };
  
  // Handle input changes in booking form
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date change in booking form
  const handleBookingDateChange = (date) => {
    setBookingForm(prev => ({
      ...prev,
      date: date
    }));
  };
  
  // Handle input changes in check-in form
  const handleCheckInInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCheckInForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle date change in check-in form
  const handleCheckInDateChange = (date) => {
    setCheckInForm(prev => ({
      ...prev,
      date: date
    }));
  };

  // Handle patient form submission
  const handleAddPatient = () => {
    console.log('Adding patient:', patientForm);
    // Implement your logic to add patient to database/state
    setShowPatientModal(false);
    // Reset form
    setPatientForm({
      firstName: '',
      lastName: '',
      age: '',
      phone: '',
      place: '',
      gender: '',
      abhaId: '',
      dob: new Date(),
    });
  };
  
  // Handle booking form submission
  const handleAddBooking = () => {
    console.log('Adding booking:', bookingForm);
    // Implement your logic to add booking to database/state
    setShowBookingModal(false);
    // Reset form
    setBookingForm({
      patientName: '',
      doctor: '',
      date: new Date(),
      time: '',
      tokenType: 'A',
      notes: ''
    });
  };
  
  // Handle check-in form submission
  const handleCheckIn = () => {
    console.log('Check-in:', checkInForm);
    // Implement your logic for check-in
    setShowCheckInModal(false);
    // Reset form would go here if needed
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      
 {/* Sidebar */}
 <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-56 mr-64 p-6 overflow-auto">
        {/* Top Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-10 pr-3 py-1.5 rounded-lg border border-gray-300 w-72 text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
              onClick={() => setShowPatientModal(true)}
            >
              Add Patient
            </button>
            <button 
              className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
              onClick={() => setShowBookingModal(true)}
            >
              New Booking
            </button>
            <button 
              className="bg-white px-4 py-2 rounded-lg shadow border border-gray-300"
              onClick={() => setShowCheckInModal(true)}
            >
              Check In
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-md shadow flex items-center gap-3">
            <Calendar className="text-gray-600" size={20} />
            <div>
              <div className="text-2xl font-bold">300</div>
              <div className="text-gray-600 text-sm">Appointments</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-md shadow flex items-center gap-3">
            <Users className="text-gray-600" size={20} />
            <div>
              <div className="text-2xl font-bold">100</div>
              <div className="text-gray-600 text-sm">New Patient</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-md shadow flex items-center gap-3">
            <Clock className="text-gray-600" size={20} />
            <div>
              <div className="text-2xl font-bold">115</div>
              <div className="text-gray-600 text-sm">Waiting</div>
            </div>
          </div>
        </div>

        {/* Appointment Summary and Chart */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-md shadow">
            <h2 className="text-lg font-bold mb-3">Appointment Summary</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Appointments:</span>
                <span>100</span>
              </div>
              <div className="flex justify-between">
                <span>Total Booking:</span>
                <span>80</span>
              </div>
              <div className="flex justify-between">
                <span>Available slot:</span>
                <span>80</span>
              </div>
              <div className="flex justify-between">
                <span>Total walk-in patients:</span>
                <span>30</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-md shadow">
            <h2 className="text-lg font-bold mb-3">Hourly Booking Chart</h2>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Bar dataKey="bookings" fill="#14B8A6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Table */}
        <div className="bg-white rounded-md shadow overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-teal-700 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Token</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Age</th>
                <th className="px-4 py-2 text-left">Check-in Time</th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50">
                  <td className="px-4 py-2">{row.token}</td>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">{row.age}</td>
                  <td className="px-4 py-2">{row.time}</td>
                  <td className="px-4 py-2">{row.doctor}</td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={checkedRows[row.id] || false}
                      onChange={() => toggleCheckbox(row.id)}
                      className="h-3 w-3 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="fixed top-0 right-0 w-64 h-screen bg-white p-3 border-l overflow-y-auto">
        <div className="mb-4">
          <div className="text-lg font-bold mb-2">Select Date</div>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            inline
          />
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold">Doctors</span>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              className="pl-10 pr-3 py-1.5 w-full rounded-lg border border-gray-300 text-sm"
            />
          </div>
          <div className="space-y-2">
            {filteredDoctors.map((doctor, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                <div>
                  <div className="font-semibold text-sm">{doctor.name}</div>
                  <div className="text-xs text-gray-500">{doctor.role}</div>
                </div>
                <span className={`text-xs ${doctor.status === 'On Duty' ? 'text-green-500' : 'text-red-500'}`}>
                  {doctor.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Modal Overlay */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={patientModalRef}
            className="bg-white rounded-lg w-80 p-4 relative"
            style={{ maxHeight: '80vh'}}
          >
            <h2 className="text-lg font-bold mb-4 text-center">Patient Details</h2>
            
            <div className="space-y-2.5">
              <div>
                <label className="block mb-1 font-medium text-sm">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={patientForm.firstName}
                  onChange={handlePatientInputChange}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={patientForm.lastName}
                  onChange={handlePatientInputChange}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                />
              </div>
              
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <label className="block mb-1 font-medium text-sm">Age</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="age"
                      value={patientForm.age}
                      onChange={handlePatientInputChange}
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <span className="cursor-pointer leading-none text-xs">▲</span>
                      <span className="cursor-pointer leading-none text-xs">▼</span>
                    </div>
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block mb-1 font-medium text-sm">DOB</label>
                  <div className="flex border border-gray-300 rounded-md">
                    <DatePicker
                      selected={patientForm.dob}
                      onChange={handlePatientDobChange}
                      dateFormat="MM/dd/yyyy"
                      className="flex-1 p-1.5 rounded-l-md border-0 text-sm w-full"
                    />
                    <button className="px-1.5 bg-white border-l border-gray-300">
                      <Calendar size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Phone</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={patientForm.phone}
                  onChange={handlePatientInputChange}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Place</label>
                <input 
                  type="text" 
                  name="place"
                  value={patientForm.place}
                  onChange={handlePatientInputChange}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Gender</label>
                <div className="relative">
                  <select 
                    name="gender"
                    value={patientForm.gender}
                    onChange={handlePatientInputChange}
                    className="w-full border border-gray-300 rounded-md p-1.5 appearance-none text-sm"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="text-xs">▼</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">ABHA ID</label>
                <input 
                  type="text" 
                  name="abhaId"
                  value={patientForm.abhaId}
                  onChange={handlePatientInputChange}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                />
              </div>
              
              <div className="flex justify-center pt-3">
                <button
                  onClick={handleAddPatient}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg"
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Modal Overlay */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={bookingModalRef}
            className="bg-white rounded-lg w-80 p-4 relative"
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
          >
            <h2 className="text-lg font-bold mb-4 text-center">New Booking</h2>
            
            <div className="space-y-2.5">
              <div>
                <label className="block mb-1 font-medium text-sm">Patient Name</label>
                <input 
                  type="text" 
                  name="patientName"
                  value={bookingForm.patientName}
                  onChange={handleBookingInputChange}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                  placeholder="Search patient..."
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Doctor</label>
                <div className="relative">
                  <select 
                    name="doctor"
                    value={bookingForm.doctor}
                    onChange={handleBookingInputChange}
                    className="w-full border border-gray-300 rounded-md p-1.5 appearance-none text-sm"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor, index) => (
                      <option key={index} value={doctor.name}>{doctor.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="text-xs">▼</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Date</label>
                <div className="flex border border-gray-300 rounded-md">
                  <DatePicker
                    selected={bookingForm.date}
                    onChange={handleBookingDateChange}
                    dateFormat="MM/dd/yyyy"
                    className="flex-1 p-1.5 rounded-l-md border-0 text-sm w-full"
                  />
                  <button className="px-1.5 bg-white border-l border-gray-300">
                    <Calendar size={14} />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Time Slot</label>
                <div className="relative">
                  <select 
                    name="time"
                    value={bookingForm.time}
                    onChange={handleBookingInputChange}
                    className="w-full border border-gray-300 rounded-md p-1.5 appearance-none text-sm"
                  >
                    <option value="">Select Time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="9:15 AM">9:15 AM</option>
                    <option value="9:30 AM">9:30 AM</option>
                    <option value="9:45 AM">9:45 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:15 AM">10:15 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="10:45 AM">10:45 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="text-xs">▼</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Token Type</label>
                <div className="flex gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tokenType"
                      value="A"
                      checked={bookingForm.tokenType === 'A'}
                      onChange={handleBookingInputChange}
                      className="mr-1 h-3 w-3"
                    />
                    <span className="text-sm">Appointment</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tokenType"
                      value="W"
                      checked={bookingForm.tokenType === 'W'}
                      onChange={handleBookingInputChange}
                      className="mr-1 h-3 w-3"
                    />
                    <span className="text-sm">Walk-in</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Notes</label>
                <textarea
                  name="notes"
                  value={bookingForm.notes}
                  onChange={handleBookingInputChange}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-center pt-3">
                <button
                  onClick={handleAddBooking}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg"
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Modal Overlay */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={checkInModalRef}
            className="bg-white rounded-lg w-80 p-4 relative"
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
          >
            <h2 className="text-lg font-bold mb-4 text-center">Patient Check-In</h2>
            
            <div className="space-y-2.5">
              <div>
                <label className="block mb-1 font-medium text-sm">Booking ID</label>
                <input 
                  type="text" 
                  name="bookingId"
                  value={checkInForm.bookingId} 
                  onChange={handleCheckInInputChange}
                  disabled
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Patient Name</label>
                <input 
                  type="text"
                  name="patientName" 
                  value={checkInForm.patientName}
                  onChange={handleCheckInInputChange}
                  disabled
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Phone</label>
                <input 
                  type="text"
                  name="phone" 
                  value={checkInForm.phone}
                  onChange={handleCheckInInputChange}
                  disabled
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm bg-gray-50"
                />
              </div>
              
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <label className="block mb-1 font-medium text-sm">Date</label>
                  <div className="flex border border-gray-300 rounded-md bg-gray-50">
                    <DatePicker
                      selected={checkInForm.date}
                      onChange={handleCheckInDateChange}
                      dateFormat="MM/dd/yyyy"
                      disabled
                      className="flex-1 p-1.5 rounded-l-md border-0 text-sm w-full bg-gray-50"
                    />
                    <button className="px-1.5 bg-gray-50 border-l border-gray-300">
                      <Calendar size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="w-1/2">
                  <label className="block mb-1 font-medium text-sm">Time Slot</label>
                  <input 
                    type="text"
                    name="timeSlot" 
                    value={checkInForm.timeSlot}
                    onChange={handleCheckInInputChange}
                    disabled
                    className="w-full border border-gray-300 rounded-md p-1.5 text-sm bg-gray-50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Consultation Fee</label>
                <input 
                  type="text"
                  name="consultationFee" 
                  value={checkInForm.consultationFee}
                  onChange={handleCheckInInputChange}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-sm">Payment Method</label>
                <div className="relative">
                  <select 
                    name="paymentMethod"
                    value={checkInForm.paymentMethod}
                    onChange={handleCheckInInputChange}
                    className="w-full border border-gray-300 rounded-md p-1.5 appearance-none text-sm"
                  >
                    <option value="">Select Payment Method</option>
                    {paymentMethods.map((method, index) => (
                      <option key={index} value={method}>{method}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="text-xs">▼</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="paid"
                    checked={checkInForm.paid}
                    onChange={handleCheckInInputChange}
                    className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="text-sm">Mark as Paid</span>
                </label>
              </div>
              
              <div className="flex justify-center pt-3">
                <button
                  onClick={handleCheckIn}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-1.5 px-8 rounded-full text-sm flex items-center gap-1"
                >
                  <Check size={16} />
                  Check In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;