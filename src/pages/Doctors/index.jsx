import { useState } from "react";

import Sidebar from "@/pages/Layout/SideBar";
import MuiReactTableComponent from "@/components/Table/MuiReactTableComponent";
// import AddBoking from "../../AppReusbleComponents/AddBoking";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAllDoctorsDetails,
  getDoctorSheduleDetails,
} from "../../serviceApis";
import { useMemo } from "react";

import { Box, IconButton, Tooltip } from "@mui/material";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";

import AddDoctor from "./AddDoctor";
import StyledButton from "@components/StyledButton";
import SheduleDoctors from "./SheduleDoctors";
import PageLoader from "@pages/PageLoader";
import { useDoctor, useSheduleDoctor } from "@/stores/doctorStore";

function DashboardPage() {
  const [openAddDoctor, setOpenDoctor] = useState(false);
  const [openSheduleDoctor, setOpenSheduleDoctor] = useState(false);
  const { setDoctorData } = useDoctor();
  const { setDoctorSheduleData } = useSheduleDoctor();
  const [doctor_id, setdoctor_id] = useState("");
  // const doctorSheduleData = useSheduleDoctor();

  const queryGetAllDoctorsDetails = useQuery({
    queryKey: ["queryGetAllDoctorsDetails"],
    queryFn: () => getAllDoctorsDetails({ facility_id: 1 }),
    enabled: true,
  });

  const { data: doctorsData = [], isLoading } = queryGetAllDoctorsDetails || {};

  const mutationBydoctor_id = useMutation({
    mutationFn: (id) =>
      getDoctorSheduleDetails({
        facility_id: "1",
        doctor_id: id,
      }),
    onSuccess: (data) => {
      const updatedata = data?.weekDaysList.map((_obj) => ({
        ..._obj,
        isChecked: _obj?.slotWeeks?.some(({ windowNum }) => windowNum),
      }));
      if (updatedata) {
        setDoctorSheduleData({ ...data, weekDaysList: [...updatedata] });
        setOpenSheduleDoctor(true);
      }
    },
    onError: () => {
      setOpenSheduleDoctor(true);
      setDoctorSheduleData({
        doctor_id: doctor_id,
      });
    },
  });

  const handleOnEditDoctorShedule = (_id) => {
    setdoctor_id(_id);
    mutationBydoctor_id.mutate(_id);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id", //access nested data with dot notation
        header: "ID",
        size: 100,
      },
      {
        accessorKey: "doctor_name",
        header: "Name",
        // size: 150,
      },
      {
        accessorKey: "phone_number", //normal accessorKey
        header: "Mobile Number",
        // size: 30,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "specialization",
        header: "Specialization",
        // size: 60,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "consultation_fee",
        header: "Consultation Fee",
        // size: 50,
        enableSorting: false,
        enableColumnFilter: false,
      },

      {
        accessorKey: "actions",
        header: "Actions",
        size: 120, // Desired width in pixels
        minSize: 100, // Minimum width
        maxSize: 200, // Maximum width
        enableResizing: true, // Optional: allows user to resize
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box
            sx={{ display: "flex", width: "100%", justifyContent: "center" }}
          >
            <Tooltip title="Status" arrow>
              <IconButton
                backgroundColor="#115E59"
                onClick={() =>
                  alert("Edit action for " + row.getValue("name.firstName"))
                }
              >
                <ToggleOffOutlinedIcon color="#115E59" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Doctor" arrow>
              <IconButton
                backgroundColor="#115E59"
                onClick={() => {
                  setDoctorData(row.original);
                  setOpenDoctor(true);
                }}
              >
                <ModeEditOutlineOutlinedIcon color="#115E59" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Shedule Doctor" arrow>
              <IconButton
                backgroundColor="#115E59"
                onClick={() => handleOnEditDoctorShedule(row.original?.id)}
                // alert("Edit action for " + row.getValue("name.firstName"))
              >
                <WorkHistoryOutlinedIcon color="#115E59" />
              </IconButton>
            </Tooltip>
            {/* <IconButton color="error" onClick={() => handleDelete(row)}>
              <DeleteForeverIcon />
            </IconButton> */}
          </Box>
        ),
      },
    ],
    []
  );

  const initialState = {
    showGlobalFilter: true,
    showColumnFilters: true,
    columnPinning: {
      right: ["actions"], // built-in ID for actions column
      left: ["id"], // no columns pinned to the left
    },
  };

  return (
    <div className="flex flex-row min-h-screen bg-gray-50 w-full">
      {/* Main Content */}
      <div className="flex-1   p-5  overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex justify-end w-full gap-5">
            <StyledButton
              variant="outlined"
              onClick={() => setOpenDoctor(true)}
            >
              Add Doctor
            </StyledButton>
          </div>
        </div>
        <MuiReactTableComponent
          data={doctorsData}
          columns={columns}
          isDate={false}
          tableProps={initialState}
        />
      </div>
      <AddDoctor open={openAddDoctor} setOpen={setOpenDoctor} />
      {openSheduleDoctor && (
        <SheduleDoctors
          open={openSheduleDoctor}
          setOpen={setOpenSheduleDoctor}
        />
      )}
      <PageLoader show={isLoading || mutationBydoctor_id?.isPending} />
    </div>
  );
}

export default DashboardPage;
