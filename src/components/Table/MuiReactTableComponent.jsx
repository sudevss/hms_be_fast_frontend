import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, IconButton, Stack } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import CustomInputComponent from "@components/Inputs/TextInputWithLabel";
import { Search } from "lucide-react";
import DatePicker from "react-datepicker";
import SearchTextInput from "@components/Inputs/SearchTextInput";
import DatePickerComponent from "@/components/DatePicker";

const MuiReactTableComponent = ({
  data,
  columns,
  tableProps,
  isDate = false,
  date,
  dateLabel = "",
  dateProps,
  setDate,
  maxHeight = "500px",
  CustomRenderTopToolbar = "",
}) => {
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useMaterialReactTable({
    columns,
    enableRowActions: false,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableBottomToolbar: false,
    enableTopToolbar: true,
    positionToolbarDropZone: "none",
    enableColumnActions: false,
    columnFilterModeOptions: null,
    enableSorting: true,
    enableColumnFilters: true,
    columnFilterDisplayMode: "popover",
    enableDensityToggle: false,
    enableHiding: false,
    enableFullScreenToggle: false,
    // muiTopToolbarProps: {
    //   sx: { zIndex: 1000 },
    // },
    initialState: {
      showGlobalFilter: true,
      showColumnFilters: true,
    },
    muiFilterTextFieldProps: {
      sx: {
        m: "0.5rem 0",
        width: "100%",
      },
      variant: "outlined",
    },
    onGlobalFilterChange: setGlobalFilter,
    state: { globalFilter },

    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: isDate ? "space-between" : "flex-end",
        }}
      >
        <Stack width="50%" flexDirection="row">
          {isDate && (
            <Box width="12vw">
              <DatePickerComponent
                name="date"
                value={date}
                required={true}
                showInputLabel={true}
                currentYear={null}
                disableFuture
                // resProps={{ maxDate}}
                // inputProps={{ disableFuture: true }}
                label={dateLabel}
                // helperText={!AppointmentDate && "Date of Birth  is required"}
                sxLabel={{ fontWeight: 600 }}
                onChange={(e) => setDate(e.target.value)}
                {...dateProps}
              />
            </Box>
          )}

          {CustomRenderTopToolbar && <CustomRenderTopToolbar />}
        </Stack>
        <Box width="20%">
          <SearchTextInput
            name="Search"
            label=""
            placeholder="Search..."
            value={globalFilter}
            onChange={(value) => setGlobalFilter(value)}
            fullWidth
          />
          {/* <CustomInputComponent
            type="text"
            label=""
            showInputLabel={true}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
          /> */}
        </Box>
        {/* <TextField
            label="Search Doctors"
            variant="outlined"
            size="small"
            value={globalFilter}
            // onChange={(e) => setGlobalFilter(e.target.value)}
            sx={{ width: 300 }}
          /> */}
      </Box>
    ),

    // positionActionsColumn: "last",
    //   renderRowActions:({ row, table }) => (
    //   <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
    //     <IconButton backgroundColor="#115E59" onClick={() => alert("Edit action for " + row.getValue("name.firstName"))}>
    //       <ToggleOffOutlinedIcon color="#115E59" />
    //     </IconButton>
    //      <IconButton backgroundColor="#115E59" onClick={() => alert("Edit action for " + row.getValue("name.firstName"))}>
    //       <ModeEditOutlineOutlinedIcon color="#115E59" />
    //     </IconButton>
    //     <IconButton color="error" onClick={() => handleDelete(row)}>
    //       <DeleteForeverIcon />
    //     </IconButton>
    //   </Box>
    // ),

    muiTableBodyRowProps: { hover: true },
    positionGlobalFilter: "right",
    enablePagination: false,
    enableRowNumbers: false,
    enableRowVirtualization: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: maxHeight,
        maxWidth: "99%",
        borderRadius: 1,
        margin: 1,
        border: "1px solid #115E59",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        // borderRight: "1px solid #fff",
        backgroundColor: "#115E59",
        fontSize: "1rem",
        color: "#fff",
        height: "auto",
        fontWeight: 600,
        lineHeight: "1rem",
        paddingY: "0.7rem",

        ".Mui-TableHeadCell-Content": {
          display: "flex",
          justifyContent: "center",
        },
        "& .MuiTableSortLabel-root svg": {
          color: "#fff !important", // Customize as needed
        },
        "& .MuiSvgIcon-root": {
          color: "#fff !important",
        },
      },
    },
    muiTableHeadProps: {
      sx: {
        textAlign: "center",
        backgroundColor: "#115E59",
        zIndex: 5,
      },
    },
    muiTablePaperProps: {
      sx: {
        // borderRadius: "5px",
        // border: "1px solid #115E59",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        // border: "1px solid #115E59",
        display: "flex",
        justifyContent: "center",
        fontSize: "1rem",
        color: "#231E33",
        height: "auto",
        fontWeight: 500,
        lineHeight: "20px",
        paddingY: "0rem",
        textAlign: "center",
        ".Mui-TableHeadCell-Content": {
          display: "flex",
          justifyContent: "center",
        },
      },
    },
    ...tableProps,
  });

  return <MaterialReactTable table={table} />;
};

export default MuiReactTableComponent;
