import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Stack } from "@mui/material";
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

  // ✅ Automatically make every header its tooltip
  const enhancedColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        headerTooltip:
          col.headerTooltip ?? String(col.header ?? col.accessorKey ?? ""),
      })),
    [columns]
  );

  const table = useMaterialReactTable({
    columns: enhancedColumns, // ✅ use enhanced columns
    data,
    enableRowActions: false,
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

    // ✅ Tooltip settings for all header cells
    muiTableHeadCellTooltipProps: {
      arrow: true,
      placement: "top",
      enterDelay: 150,
      sx: {
        bgcolor: "#333",
        color: "#fff",
        fontSize: "0.75rem",
        fontWeight: 400,
        px: 1,
      },
    },

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
                required
                showInputLabel
                disableFuture
                label={dateLabel}
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
        </Box>
      </Box>
    ),

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
        backgroundColor: "#115E59",
        fontSize: "1rem",
        color: "#fff",
        fontWeight: 600,
        lineHeight: "1rem",
        py: "0.7rem",
        ".Mui-TableHeadCell-Content": {
          display: "flex",
          justifyContent: "center",
        },
        "& .MuiTableSortLabel-root svg": {
          color: "#fff !important",
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

    muiTableBodyCellProps: {
      sx: {
        display: "flex",
        justifyContent: "center",
        fontSize: "1rem",
        color: "#231E33",
        fontWeight: 500,
        lineHeight: "20px",
        textAlign: "center",
        py: 0,
      },
    },

    ...tableProps,
  });

  return <MaterialReactTable table={table} />;
};

export default MuiReactTableComponent;
