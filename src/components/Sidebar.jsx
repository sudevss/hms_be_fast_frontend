import React from 'react';
import { Heart, LayoutGrid, Calendar, Users, Stethoscope, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 h-screen w-56 bg-black text-white p-3 rounded-r-2xl flex flex-col">
      <div className="flex items-center gap-2 mb-12">
        <Heart className="text-white" />
        <span className="text-lg font-bold">MediFlow</span>
      </div>
      <nav className="space-y-3 flex-1">
        <div className="flex items-center gap-2 hover:bg-teal-600 p-2 rounded-lg">
          <LayoutGrid size={18} />
          <Link to="/" className="text-sm text-white">
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-teal-600  transition-colors">
          <Calendar size={18} />
          <Link to="/appointments" className="text-sm text-white">
            Appointments
          </Link>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-teal-600  transition-colors">
          <Users size={18} />
          <Link to="/patients" className="text-sm text-white">
            Patients
          </Link>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-teal-600  transition-colors">
          <Stethoscope size={18} />
          <Link to="/doctors" className="text-sm text-white">
            Doctors
          </Link>
        </div>
      </nav>
      <div className="space-y-">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-teal-600  transition-colors">
          <Settings size={18} />
          <Link to="/settings" className="text-sm text-white">
            Settings
          </Link>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-teal-600  transition-colors">
          <LogOut size={18} />
          <span className="text-sm">Log out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;