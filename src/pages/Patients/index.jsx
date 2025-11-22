import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import { BiSolidReport } from "react-icons/bi";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PatientDetailsDialog from "@/ReusableComponents/PatientDetailsDialog";

import StyledButton from "@components/StyledButton";
import MuiReactTableComponent from "@components/Table/MuiReactTableComponent";
import PageLoader from "@pages/PageLoader";

import { getPaientsDetails } from "@/serviceApis";
import { usePatient } from "@/stores/patientStore";

import AddOrEditPatient from "./AddOrEditPatient";
import PatientHistoryTable from "./PatientHistoryTable";
import PatientReports from "@/ReusableComponents/PatientReports";

function PatientsPage() {
  const [openPatient, setOpenPatient] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const { setPatientData, onReset } = usePatient();
  const patientData = usePatient();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ Fetch patient list
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["queryGetPaientsDetails"],
    queryFn: () => getPaientsDetails({ facility_id: 1 }),
    enabled: true,
  });

  // ✅ Table Columns
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID", size: 60 },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "contact_number", header: "Mobile #" },
      { accessorKey: "age", header: "Age", size: 60 },
      { accessorKey: "gender", header: "Gender", size: 80 },
      { accessorKey: "address", header: "Address" },
      { accessorKey: "doctor_visited", header: "Doctor Visited" },
      { accessorKey: "last_visited_date", header: "Last Visited" },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 120,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Tooltip title="View" arrow>
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedPatientId(row.original.id);
                  setOpenViewDetails(true);
                }}
              >
                <VisibilityIcon fontSize="small" sx={{ color: "#115E59" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Patient" arrow>
              <IconButton
                size="small"
                onClick={() => {
                  onReset();
                  setPatientData(row.original);
                  setOpenPatient(true);
                  setOpenHistory(false);
                  setOpenReports(false);
                }}
              >
                <ModeEditOutlineOutlinedIcon
                  fontSize="small"
                  sx={{ color: "#115E59" }}
                />
              </IconButton>
            </Tooltip>

            <Tooltip title="View History" arrow>
              <IconButton
                size="small"
                onClick={() => {
                  onReset();
                  setPatientData(row.original);
                  setOpenHistory(true);
                  setOpenPatient(false);
                  setOpenReports(false);
                }}
              >
                <WorkHistoryOutlinedIcon
                  fontSize="small"
                  sx={{ color: "#115E59" }}
                />
              </IconButton>
            </Tooltip>

            <Tooltip title="View Reports" arrow>
              <IconButton
                size="small"
                onClick={() => {
                  onReset();
                  setPatientData(row.original);
                  setOpenReports(true);
                  setOpenHistory(false);
                  setOpenPatient(false);
                }}
              >
                <BiSolidReport size={18} color="#115E59" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );

  // ✅ Default Table Props
  const initialState = {
    showGlobalFilter: true,
    showColumnFilters: true,
    columnPinning: { right: ["actions"], left: ["id"] },
  };

  return (
    <>
      {/* Page Container (Responsive Width) */}
      <Box
        sx={{
          width: {
            xs: "95vw", // Mobile (0-599px)
            sm: "90vw", // Small tablets (600-899px)
            md: "75vw", // Tablets / small laptops (900-1199px)
            lg: "80vw", // Desktops (1200-1535px)
            xl: "85vw", // Large screens (1536px+)
          },
          mx: "auto",
          bgcolor: "#fff",
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: "80vh",
        }}
      >
        {/* Page Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "flex-end",
            gap: 2,
            px: { xs: 2, sm: 3, md: 4 },
            py: 2.5,
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#fafafa",
          }}
        >
          

          <StyledButton
            variant="outlined"
            onClick={() => {
              onReset();
              setPatientData({});
              setOpenPatient(true);
              setOpenHistory(false);
              setOpenReports(false);
            }}
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: { xs: 0.8, sm: 1 },
              borderRadius: "28px",
              fontSize: { xs: "0.85rem", sm: "1rem" },
              textTransform: "none",
            }}
          >
            Add Patient
          </StyledButton>
        </Box>

        {/* Table Section */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <MuiReactTableComponent
            data={patients}
            columns={columns}
            isDate={false}
            tableProps={initialState}
          />
        </Box>
      </Box>

      {/* Dialogs */}
      <AddOrEditPatient open={openPatient} setOpen={setOpenPatient} />
      <PatientHistoryTable open={openHistory} setOpen={setOpenHistory} />
      <PatientReports
        patientReportsObj={{
          ...patientData,
          patient_id: patientData?.id,
        }}
        setPatientReportObj={onReset}
        open={openReports}
        setOpen={setOpenReports}
      />
      <PatientDetailsDialog
        open={openViewDetails}
        onClose={() => setOpenViewDetails(false)}
        patientId={selectedPatientId}
      />

      <PageLoader show={isLoading} />
    </>
  );
}

export default PatientsPage;
