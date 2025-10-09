import {
  Heart,
  Search,
  Calendar,
  Users,
  UserCog,
  Settings,
  LogOut,
  LayoutGrid,
  Clock,
  Check,
} from "lucide-react";
import { Button, IconButton, Radio } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useDashboardStore } from "@/stores/dashboardStore";
import SearchTextInput from "@components/Inputs/SearchTextInput";

function DoctorsSection({ filteredDoctors }) {
  const {
    setdoctor_id,
    doctor_id: doctorId,
    doctorSearch,
    setDoctorSearch,
  } = useDashboardStore();

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold">Doctors</span>
      </div>
      <div className="relative mb-4 w-[100%] flex flex-row ">
        <SearchTextInput
          name="Search"
          label=""
          placeholder="Search..."
          value={doctorSearch}
          onChange={(value) => setDoctorSearch(value)}
          fullWidth
        />
        {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search doctors..."
          value={doctorSearch}
          onChange={(e) => setDoctorSearch(e.target.value)}
          className="pl-10 pr-3 py-1.5 w-full rounded-lg border border-gray-300 text-sm"
        /> */}
        <IconButton
          onClick={() => {
            setDoctorSearch("");
            setdoctor_id("");
          }}
        >
          <RestartAltIcon />
        </IconButton>
      </div>

      <div className="space-y-2">
        {filteredDoctors.map(
          (
            {
              doctor_id,
              name,
              specialization,
              total_slots,
              available_slots,
              status,
            },
            index
          ) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <Radio
                  checked={doctorId === doctor_id}
                  onClick={() => setdoctor_id(doctor_id)}
                  value={doctorId}
                  name="doctor-radio-buttons"
                  // inputProps={{ "aria-label": doctor.name }}
                />
                <div>
                  <div className="font-semibold text-sm">{name}</div>
                  <div className="text-xs text-gray-500">{specialization}</div>
                  <div className="text-xs text-gray-500">
                    Total slots: {total_slots}
                  </div>
                  <div className="text-xs text-gray-500">
                    Available slots: {available_slots}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs ${
                  status === "On Duty" ? "text-green-500" : "text-red-500"
                }`}
              >
                {status}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default DoctorsSection;
