import { useState, useMemo, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { sortQualifications } from "@data/staticData";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAllDoctorsDetails,
  getDoctorSheduleDetails,
} from "@/serviceApis";

import MuiReactTableComponent from "@components/Table/MuiReactTableComponent";
import StyledButton from "@components/StyledButton";
import AddDoctor from "./AddDoctor";
import SheduleDoctors from "./SheduleDoctors";
import PageLoader from "@pages/PageLoader";
import { useDoctor, useSheduleDoctor } from "@/stores/doctorStore";
import DoctorDetailsDialog from "@/ReusableComponents/DoctorDetailsDialog";

function DoctorsPage() {
  const [openAddDoctor, setOpenAddDoctor] = useState(false);
  const [openSheduleDoctor, setOpenSheduleDoctor] = useState(false);
  const [doctorId, setDoctorId] = useState("");

  const { setDoctorData } = useDoctor();
  const { setDoctorSheduleData } = useSheduleDoctor();

  const [openViewDoctor, setOpenViewDoctor] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 🔹 Fetch all doctors
  const { data: doctorsData = [], isLoading } = useQuery({
    queryKey: ["queryGetAllDoctorsDetails"],
    queryFn: () => getAllDoctorsDetails({ facility_id: 1 }),
  });

  useEffect(() => {
    if (!selectedDoctor?.id || !Array.isArray(doctorsData)) return;
    const updated = doctorsData.find((d) => d.id === selectedDoctor.id);
    if (updated) setSelectedDoctor(updated);
  }, [doctorsData]);

  // 🔹 Fetch schedule for a specific doctor
  const mutationByDoctorId = useMutation({
    mutationFn: (id) =>
      getDoctorSheduleDetails({
        facility_id: "1",
        doctor_id: id,
      }),
    onSuccess: (data) => {
      const source = data?.payload || data;
      const updatedData = (source?.weekDaysList || []).map((_obj) => {
        const normalizedSlotWeeksRaw = (_obj?.slotWeeks || [])
          .filter((s) => (s.startTime && s.endTime) || s.window || s.window_num || s.windowNum)
          .map((slot, j) => ({
            ...slot,
            windowNum: slot.windowNum || slot.window_num || slot.window || j + 1,
          }));
        const duration = Number((_obj?.slotWeeks || [])[0]?.slotDurationMinutes) || 15;
        const normalizedSlotWeeks =
          normalizedSlotWeeksRaw.length > 0
            ? normalizedSlotWeeksRaw
            : [{ startTime: "", endTime: "", totalSlots: "", slotDurationMinutes: duration, windowNum: "" }];
        return {
          ..._obj,
          slotWeeks: normalizedSlotWeeks,
          isChecked: normalizedSlotWeeks.some((s) => s.windowNum),
        };
      });
      if (updatedData) {
        setDoctorSheduleData({ ...source, weekDaysList: [...updatedData] });
        setOpenSheduleDoctor(true);
      }
    },
    onError: () => {
      setOpenSheduleDoctor(true);
      setDoctorSheduleData({ doctor_id: doctorId });
    },
  });

  const handleOnEditDoctorShedule = (_id) => {
    setDoctorId(_id);
    mutationByDoctorId.mutate(_id);
  };

  // 🔹 Table columns
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID", size: 70 },
      { accessorKey: "doctor_name", header: "Name" },
      { accessorKey: "phone_number", header: "Mobile Number" },
      { accessorKey: "specialization", header: "Specialization" },
      {
        accessorKey: "consultation_fee",
        header: "Consultation Fee",
        size: 150,
      },
      {
        accessorKey: "registration_number",
        header: "Reg. No.",
        size: 130,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val ? (
            <Typography variant="body2">{val}</Typography>
          ) : (
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              Enter details
            </Typography>
          );
        },
      },
      {
        accessorKey: "qualification",
        header: "Qualification",
        size: 160,
        Cell: ({ cell }) => {
          const val = sortQualifications(cell.getValue());
          return val ? (
            <Typography variant="body2">{val}</Typography>
          ) : (
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              Enter details
            </Typography>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 140,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
        {/* View Doctor Button */}
        <Tooltip title="View Doctor" arrow>
          <IconButton
              onClick={() => {
              setSelectedDoctor(row.original);
              setOpenViewDoctor(true);
            }}
          >
            <VisibilityIcon sx={{ color: "#115E59" }} />
          </IconButton>
        </Tooltip>
            {/* <Tooltip title="Toggle Status" arrow>
              <IconButton
                onClick={() => alert("Toggle status for " + row.original.id)}
              >
                <ToggleOffOutlinedIcon sx={{ color: "#115E59" }} />
              </IconButton>
            </Tooltip> */}
            <Tooltip title="Edit Doctor" arrow>
              <IconButton
                onClick={() => {
                  setDoctorData(row.original);
                  setOpenAddDoctor(true);
                }}
              >
                <ModeEditOutlineOutlinedIcon sx={{ color: "#115E59" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Schedule Doctor" arrow>
              <IconButton
                onClick={() => handleOnEditDoctorShedule(row.original?.id)}
              >
                <WorkHistoryOutlinedIcon sx={{ color: "#115E59" }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );

  // 🔹 Default table state
  const initialState = {
    showGlobalFilter: true,
    showColumnFilters: true,
    columnPinning: { right: ["actions"], left: ["id"] },
    columnOrder: [
      "id",
      "doctor_name",
      "phone_number",
      "specialization",
      "consultation_fee",
      "registration_number",
      "qualification",
      "actions",
    ],
  };

  return (
    <Box
      // sx={{
      //   minHeight: "100vh",
      //   // width: "100%",
      //   backgroundColor: "#f9fafb",
      //   display: "flex",
      //   flexDirection: "column",
      //   alignItems: "center",
      //   p: { xs: 2, sm: 3, md: 4 },
      // }}
    >
      {/* Container with responsive width */}
      <Box
        sx={{
          width: {
            xs: "95vw", // Mobile
            sm: "90vw", // Tablet
            md: "75vw", // Laptop
            lg: "80vw", // Desktop
            xl: "85vw", // Large screens
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
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "flex-end",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            px: { xs: 2, sm: 3, md: 4 },
            py: 2.5,
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#fafafa",
          }}
        >
          

          <StyledButton
            variant="outlined"
            onClick={() => setOpenAddDoctor(true)}
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: { xs: 0.8, sm: 1 },
              borderRadius: "28px",
              fontSize: { xs: "0.85rem", sm: "1rem" },
              textTransform: "none",
            }}
          >
            Add Doctor
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
            data={doctorsData}
            columns={columns}
            isDate={false}
            tableProps={initialState}
          />

          {/* Empty State */}
          {doctorsData?.length === 0 && !isLoading && (
            <Box textAlign="center" mt={5} color="gray">
              No doctors found. Please add a doctor.
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialogs */}
      <AddDoctor open={openAddDoctor} setOpen={setOpenAddDoctor} />
      {openSheduleDoctor && (
        <SheduleDoctors
          open={openSheduleDoctor}
          setOpen={setOpenSheduleDoctor}
        />
      )}

      <DoctorDetailsDialog
        open={openViewDoctor}
        onClose={() => setOpenViewDoctor(false)}
        doctor={selectedDoctor}
        onEdit={(doc) => {
          setDoctorData(doc);
          setOpenAddDoctor(true);
        }}
        onEditSchedule={(doc) => {
          if (!doc?.id) return;
          setDoctorId(doc.id);
          mutationByDoctorId.mutate(doc.id);
        }}
      />

      <PageLoader show={isLoading || mutationByDoctorId?.isPending} />
    </Box>
  );
}

export default DoctorsPage;
