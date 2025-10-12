import { useState } from "react";

import Sidebar from "@/pages/Layout/SideBar";
import MuiReactTableComponent from "@/components/Table/MuiReactTableComponent";
// import AddBoking from "../../AppReusbleComponents/AddBoking";
import { useQuery } from "@tanstack/react-query";
import { getAllDoctorsDetails, getPaientsDetails } from "../../serviceApis";
import { useMemo } from "react";

import { Box, Dialog, IconButton, Tooltip } from "@mui/material";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";

import StyledButton from "@components/StyledButton";
import { usePatient } from "@/stores/patientStore";
import AddOrEditPatient from "./AddOrEditPatient";
import PageLoader from "@pages/PageLoader";
import { BiSolidReport } from "react-icons/bi";
import PatientHistoryTable from "./PatientHistoryTable";
import PatientReports from "@/ReusableComponents/PatientReports";

function PatientsPage() {
  const [openPatient, setOpenPatient] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  const { setPatientData, onReset } = usePatient();
  const patientData = usePatient();

  const queryGetPaientsDetails = useQuery({
    queryKey: ["queryGetPaientsDetails"],
    queryFn: () => getPaientsDetails({ facility_id: 1 }),
    enabled: true,
  });
  const { data: paientsDetailsData = [], isLoading = false } =
    queryGetPaientsDetails;

  const columns = useMemo(
    () => [
      {
        accessorKey: "id", //access nested data with dot notation
        header: "ID",
        size: 100,
      },
      {
        accessorKey: "name",
        header: "Name",
        // size: 150,
      },
      {
        accessorKey: "contact_number", //normal accessorKey
        header: "Mobile Number",
        // size: 30,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "age",
        header: "Age",
        size: 60,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "gender",
        header: "Gender",
        size: 70,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "address",
        header: "Place",
        // size: 50,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "doctor_visited",
        header: "Doctor Visited",
        // size: 50,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "last_visited_date",
        header: "Last Visited",
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
            {/* <IconButton
              backgroundColor="#115E59"
              onClick={() =>
                alert("Edit action for " + row.getValue("name.firstName"))
              }
            >
              <ToggleOffOutlinedIcon color="#115E59" />
            </IconButton> */}
            <Tooltip
              placement="top"
              title="Edit Patient"
              arrow
              enterDelay={100}
            >
              <IconButton
                backgroundColor="#115E59"
                onClick={() => {
                  setOpenPatient(true);
                  setOpenHistory(false);
                  setOpenReports(false);
                  setPatientData(row?.original);
                }}
              >
                <ModeEditOutlineOutlinedIcon color="#115E59" />
              </IconButton>
            </Tooltip>
            <Tooltip placement="top" title="History" arrow enterDelay={100}>
              <IconButton
                backgroundColor="#115E59"
                onClick={() => {
                  setOpenHistory(true);
                  setOpenPatient(false);
                  setOpenReports(false);
                  setPatientData(row?.original);
                }}
              >
                <WorkHistoryOutlinedIcon color="#115E59" />
              </IconButton>
            </Tooltip>
            <Tooltip placement="top" title="Reports" arrow enterDelay={100}>
              <IconButton
                backgroundColor="#115E59"
                onClick={() => {
                  setOpenReports(true);
                  setOpenHistory(false);
                  setOpenPatient(false);
                  setPatientData(row?.original);
                }}
              >
                <BiSolidReport color="#115E59" />
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
      <div className="flex-1  p-5  overflow-y-auto ">
        <div className="flex justify-between items-center mb-6">
          <div className="flex justify-end w-full gap-5">
            <StyledButton
              variant="outlined"
              onClick={() => {
                setOpenPatient(true);
                setPatientData({});
              }}
            >
              Add Patient
            </StyledButton>
          </div>
        </div>
        <MuiReactTableComponent
          data={paientsDetailsData}
          columns={columns}
          isDate={false}
          tableProps={initialState}
        />
      </div>
      <PatientHistoryTable open={openHistory} setOpen={setOpenHistory} />

      <PatientReports
        patientReportsObj={{ ...patientData, patient_id: patientData?.id }}
        setPatientReportObj={onReset}
        open={openReports}
        setOpen={setOpenReports}
      />
      <AddOrEditPatient open={openPatient} setOpen={setOpenPatient} />
      <PageLoader show={isLoading} />
    </div>
  );
}

export default PatientsPage;
