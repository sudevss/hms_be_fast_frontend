import { FlexContainer } from "@components/Flex";
import { MONTH_NAMES } from "@data/common";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  Box,
  Divider,
  InputAdornment,
  InputLabel,
  Popover,
  Stack,
  TextField,
} from "@mui/material";
import { isNumber } from "@utils/commonUtils";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import MonthCard from "./MonthCard";

const toDay = new Date();

function MonthPicker({
  name,
  direction,
  label,
  initialValue,
  onChange,
  minYear,
  maxYear,
  InputTextProps,
  RootSxProps,
  getMonthDisabled,
}) {
  const [monthIndex, setMonthIndex] = useState(-1);
  const [fullYear, setFullYear] = useState(toDay.getFullYear());
  const [inputValue, setInputValue] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);

  const { compactYear, compactMonth } = InputTextProps;

  const getComputedInputText = (mi, fy) => {
    if (compactYear && compactMonth) {
      return `${MONTH_NAMES[mi % 12].slice(0, 3)} '${fy % 100}`;
    }
    if (compactYear) {
      return `${MONTH_NAMES[mi % 12]} '${fy % 100}`;
    }
    if (compactMonth) {
      return `${MONTH_NAMES[mi % 12].slice(0, 3)} '${fy}`;
    }

    return `${MONTH_NAMES[mi % 12]} '${fy}`;
  };

  useEffect(() => {
    const { monthIndex: mi, fullYear: fy } = initialValue ?? {};

    if (isNumber(mi) && isNumber(fy) && mi !== -1 && fy !== -1) {
      setMonthIndex(mi);
      setFullYear(fy);
      setInputValue(getComputedInputText(mi, fy));
    }
  }, [initialValue?.monthIndex, initialValue?.fullYear]);

  const onClosePopover = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (monthIndex !== -1) {
      setInputValue(getComputedInputText(monthIndex, fullYear));
      onClosePopover();
      onChange({ monthIndex, fullYear });
    }
  }, [monthIndex]);

  const showPopover = Boolean(anchorEl);

  const handleInputClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleKeyPress = (event) => {
    if ([32, 13].includes(event.keyCode)) setAnchorEl(event.currentTarget);
  };

  let inputWidth = 160;

  if (compactMonth) {
    inputWidth = 120;
  } else if (compactYear) {
    inputWidth = 140;
  }

  return (
    <>
      <Stack
        className="MonthPicker-root"
        sx={{
          flexDirection: direction,
          alignItems: direction === "row" ? "center" : "flex-start",
          gap: "4px",
          ...RootSxProps,
        }}
      >
        {label && (
          <InputLabel htmlFor={`input-${name}`} sx={{ fontWeight: 600 }}>
            {label}
          </InputLabel>
        )}

        <TextField
          id={`input-${name}`}
          name={name}
          variant="outlined"
          fullWidth
          sx={{
            "&.MuiTextField-root": {
              backgroundColor: "white",
            },
            "& .MuiSvgIcon-root": {
              color: "text.primary",
            },
            // width: 215,
            width: inputWidth,
          }}
          value={inputValue}
          onClick={handleInputClick}
          onKeyUp={handleKeyPress}
          InputProps={{
            readOnly: true,
            sx: { fontWeight: 500 },
            endAdornment: (
              <InputAdornment position="end">
                <CalendarMonthIcon color="text.primary" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Popover
        anchorReference="anchorEl"
        anchorEl={anchorEl}
        open={showPopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "&.MuiPopover-root": {
            borderRadius: "8px",
          },
        }}
        elevation={1}
        onClose={onClosePopover}
      >
        <FlexContainer
          width="100%"
          height="64px"
          bgcolor="primary.light"
          fontWeight={600}
          fontSize={18}
          color="hms.main"
          justifyContent="flex-start"
          px={4}
          pt={2}
        >
          Select Month
        </FlexContainer>
        <Divider flexItem sx={{ borderColor: "#D9D9D9" }} />
        <Box p={2} pt={2}>
          <MonthCard
            yearLabel="Year"
            minYear={minYear}
            maxYear={maxYear}
            selectedYear={fullYear}
            selectedMonthIndex={monthIndex}
            onMonthChange={setMonthIndex}
            onYearChange={(newYear) => {
              setFullYear(newYear);
              setMonthIndex(-1);
            }}
            getMonthDisabled={getMonthDisabled}
          />
        </Box>
      </Popover>
    </>
  );
}

MonthPicker.propTypes = {
  name: PropTypes.string,
  direction: PropTypes.string,
  label: PropTypes.string.isRequired,
  initialValue: PropTypes.shape({
    fullYear: PropTypes.number,
    monthIndex: PropTypes.number, // zero based
  }).isRequired,
  onChange: PropTypes.func,
  minYear: PropTypes.number,
  maxYear: PropTypes.number,
  InputTextProps: PropTypes.shape({
    compactYear: PropTypes.bool,
    compactMonth: PropTypes.bool,
  }),
  RootSxProps: PropTypes.shape({}),
  getMonthDisabled: PropTypes.func,
};

MonthPicker.defaultProps = {
  name: "MonthPicker-input",
  direction: "row",
  onChange: ({ fullYear, monthIndex }) => console.log({ fullYear, monthIndex }),
  minYear: toDay.getFullYear() - 1,
  maxYear: toDay.getFullYear() + 1,
  InputTextProps: { compactYear: true, compactMonth: true },
  RootSxProps: {},
  getMonthDisabled: ({ fullYear, monthIndex }) =>
    fullYear > toDay.getFullYear() ||
    (fullYear === toDay.getFullYear() && monthIndex > toDay.getMonth()),
};

export default MonthPicker;
