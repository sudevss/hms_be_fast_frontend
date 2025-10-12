import { FlexContainer } from "@components/Flex";
import SpanElement from "@components/SpanElement";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  IconButton,
  InputAdornment,
  InputLabel,
  Popover,
  Stack,
  TextField,
} from "@mui/material";
import { isNumber } from "@utils/commonUtils";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import QuarterButton from "./QuarterButton";

const toDay = new Date();

export const Quarters = ["Q1", "Q2", "Q3", "Q4"];
export const YTQ = "YTQ";

const getComputedInputText = (q, fy) => `${fy} ${q}`;

export const getCurrentMonthQuarter = (monthIndex) => {
  switch (monthIndex) {
    case 0:
    case 1:
    case 2:
      return Quarters[0];
    case 3:
    case 4:
    case 5:
      return Quarters[1];
    case 6:
    case 7:
    case 8:
      return Quarters[2];
    case 9:
    case 10:
    case 11:
      return Quarters[3];
    default:
      return null;
  }
};

const getFutureMonthQuarters = (monthIndex) => {
  switch (monthIndex) {
    case 0:
    case 1:
    case 2:
      return Quarters.slice(1);
    case 3:
    case 4:
    case 5:
      return Quarters.slice(2);
    case 6:
    case 7:
    case 8:
      return Quarters.slice(3);
    case 9:
    case 10:
    case 11:
      return [];
    default:
      return [];
  }
};

function FiscalQuarterPicker({
  name,
  direction,
  label,
  initialValue,
  onChange,
  minYear,
  maxYear,
  RootSxProps,
  getQuarterDisabled,
}) {
  const [quarter, setQuarter] = useState(null);
  const [fullYear, setFullYear] = useState(toDay.getFullYear());
  const [inputValue, setInputValue] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);

  // console.log({ initialValue });

  useEffect(() => {
    const { quarter: q, fullYear: fy } = initialValue ?? {};

    if (
      [...Quarters, YTQ].includes(q?.toUpperCase()) &&
      isNumber(fy) &&
      fy !== -1
    ) {
      setQuarter(q?.toUpperCase());
      setFullYear(fy);

      setInputValue(getComputedInputText(q, fy));
    }
  }, [initialValue?.quarter, initialValue?.fullYear]);

  const onClosePopover = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (quarter) {
      setInputValue(getComputedInputText(quarter, fullYear));
      onClosePopover();
      onChange({ quarter, fullYear });
    }
  }, [quarter]);

  const showPopover = Boolean(anchorEl);

  const handleInputClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleKeyPress = (event) => {
    if ([32, 13].includes(event.keyCode)) setAnchorEl(event.currentTarget);
  };

  const inputWidth = 140;

  return (
    <>
      <Stack
        className="FiscalQuarterPicker-root"
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
          // alignItems="flex-end"
          px={3}
          pt={4}
          pb={3}
        >
          Filter
        </FlexContainer>
        <Stack p={3} pt={2} gap={2} className="FiscalQuarterPicker-popover">
          <FlexContainer justifyContent="space-between">
            <IconButton
              aria-label="previous year"
              color="primary"
              onClick={() => {
                setFullYear((cur) => cur - 1);
              }}
              disabled={fullYear <= minYear}
              sx={{ p: "4px" }}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
            <SpanElement fontWeight={500} fontSize={18}>
              {fullYear}
            </SpanElement>
            <IconButton
              aria-label="next year"
              color="primary"
              onClick={() => {
                setFullYear((cur) => cur + 1);
              }}
              disabled={fullYear >= maxYear}
              sx={{ p: "4px" }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          </FlexContainer>
          <FlexContainer
            flexWrap="nowrap"
            gap={2}
            sx={{ "&>*": { flex: "1 1 auto" } }}
            className="FiscalQuarterPicker-quarter-buttons"
          >
            {Quarters.map((Q) => (
              <QuarterButton
                isCurrent={getCurrentMonthQuarter(toDay.getMonth()) === Q}
                isSelected={quarter === Q}
                onClick={() => setQuarter(Q)}
                disabled={getQuarterDisabled({ fullYear, quarter: Q })}
                key={`${fullYear}-${Q}`}
              >
                {Q}
              </QuarterButton>
            ))}
          </FlexContainer>
          <FlexContainer>
            <QuarterButton
              isCurrent={false}
              isSelected={quarter === YTQ}
              onClick={() => setQuarter(YTQ)}
              disabled={false}
            >
              {YTQ}
            </QuarterButton>
          </FlexContainer>
        </Stack>
      </Popover>
    </>
  );
}

FiscalQuarterPicker.propTypes = {
  name: PropTypes.string,
  direction: PropTypes.string,
  label: PropTypes.string.isRequired,
  initialValue: PropTypes.shape({
    fullYear: PropTypes.number,
    quarter: PropTypes.number, // zero based
  }).isRequired,
  onChange: PropTypes.func,
  minYear: PropTypes.number,
  maxYear: PropTypes.number,
  RootSxProps: PropTypes.shape({}),
  getQuarterDisabled: PropTypes.func,
};

FiscalQuarterPicker.defaultProps = {
  name: "FiscalQuarterPicker-input",
  direction: "row",
  onChange: ({ fullYear, quarter }) => console.log({ fullYear, quarter }),
  minYear: toDay.getFullYear() - 1,
  maxYear: toDay.getFullYear() + 1,
  RootSxProps: {},
  getQuarterDisabled: ({ fullYear, quarter }) =>
    fullYear > toDay.getFullYear() ||
    (toDay.getFullYear() === fullYear &&
      getFutureMonthQuarters(toDay.getMonth()).includes(quarter)),
};

export default FiscalQuarterPicker;
