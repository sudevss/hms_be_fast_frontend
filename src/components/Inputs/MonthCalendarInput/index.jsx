import EnhancedTabs from "@components/CustomMui/EnhancedTabs";
import { FlexContainer } from "@components/Flex";
import SpanElement from "@components/SpanElement";
import StandardVariantSelect from "@components/StandardVariantSelect";
import {
  ActiveOrgCalendarRange,
  CALENDAR_RANGE_LIST,
  MONTH_FILTER_TYPES,
  MONTH_NAMES,
} from "@data/common";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RestoreIcon from "@mui/icons-material/Restore";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  InputLabel,
  Popover,
  Stack,
  styled,
  TextField,
  Tooltip,
} from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import MonthCardsWrapper from "./MonthCardsWrapper";
// import SelectWithLabel from "../SelectWithLabel";

export const GridContainer = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 83px)",
  justifyContent: "center",
  alignItems: "center",
  padding: 0,
}));

const buttonSxProps = {
  borderRadius: "28px",
  fontSize: "18px",
  padding: "10px 24px",
  ml: 1,
  lineHeight: 1,
};

function MonthCalendarInput(props) {
  const {
    name,
    label,
    inputSelectionType,
    selectedMonthsData,
    handleMonthCalendarInputChange,
    onReset,
    monthRangeSelectionLimits,
    showMonthRangeInfoText,
    forceInputSelectionType,
    orgCode,
    hideOrgCalendar,
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [calendarYearRange, setCalendarYearRange] = useState({
    ...ActiveOrgCalendarRange,
  });
  const [selectedMonthsLocalState, setSelectedMonthsLocalState] = useState([
    { month: -1, year: -1 },
    { month: -1, year: -1 },
  ]);
  const showPopover = Boolean(anchorEl);
  const monthCardsWrapperRef = useRef();

  useEffect(() => {
    if (calendarYearRange.orgCode !== orgCode) {
      const targetCalendarYears = CALENDAR_RANGE_LIST.find(
        (i) => i.orgCode === orgCode
      );

      if (targetCalendarYears) {
        setCalendarYearRange(targetCalendarYears);
        // console.log({ targetCalendarYears });
        setSelectedMonthsLocalState([
          { month: -1, year: targetCalendarYears.from },
          { month: -1, year: targetCalendarYears.to },
        ]);
      }
    }
  }, [orgCode]);

  const tabTitles = forceInputSelectionType
    ? [inputSelectionType]
    : [MONTH_FILTER_TYPES.MONTH_SINGLE, MONTH_FILTER_TYPES.MONTH_RANGE];

  const setFormattedInputValue = (from, to) => {
    if (!from) return;

    let inputText = "";
    const { monthName: month1, year: year1 } = from;

    if (typeof year1 === "number" && month1 !== "" && year1 !== -1)
      inputText = `${month1} '${year1 % 100}`;

    if (!to) {
      setInputValue(inputText);
      setTabIndex(tabTitles.indexOf(MONTH_FILTER_TYPES.MONTH_SINGLE));

      return;
    }

    const { monthName: month2, year: year2 } = to;

    if (typeof year2 === "number" && month2 !== "" && year2 !== -1)
      inputText = `${month1.slice(0, 3)} '${year1 % 100} - ${month2.slice(
        0,
        3
      )} '${year2 % 100}`;
    setInputValue(inputText);
    setTabIndex(tabTitles.indexOf(MONTH_FILTER_TYPES.MONTH_RANGE));
  };

  useEffect(() => {
    let from = null;
    let to = null;
    let monthOne = -1;
    let yearOne = -1;
    let monthTwo = -1;
    let yearTwo = -1;

    const { month: m1, year: y1 } = selectedMonthsData[0] ?? {};
    const { month: m2, year: y2 } = selectedMonthsData[1] ?? {};

    if (
      inputSelectionType === MONTH_FILTER_TYPES.MONTH_SINGLE &&
      typeof m1 === "number" &&
      typeof y1 === "number"
    ) {
      monthOne = m1;
      yearOne = y1;
    } else if (
      inputSelectionType === MONTH_FILTER_TYPES.MONTH_RANGE &&
      typeof m1 === "number" &&
      typeof y1 === "number" &&
      typeof m2 === "number" &&
      typeof y2 === "number"
    ) {
      monthOne = m1;
      yearOne = y1;
      monthTwo = m2;
      yearTwo = y2;
    }

    if (monthOne !== -1 && yearOne !== -1)
      from = { monthName: MONTH_NAMES[monthOne], year: yearOne };
    if (monthTwo !== -1 && yearTwo !== -1) {
      to = { monthName: MONTH_NAMES[monthTwo], year: yearTwo };
    }

    setFormattedInputValue(from, to);
  }, [inputSelectionType, selectedMonthsData]);

  useEffect(() => {
    // const { year: year1 } = selectedMonthsData[0] ?? {};
    // const { year: year2 } = selectedMonthsData[1] ?? {};

    setSelectedMonthsLocalState(selectedMonthsData);

    // const targetYearRange = CALENDAR_RANGE_LIST.find((y) => {
    //   if (year1 && year2 && year1 !== -1 && year2 !== -1) {
    //     if (year1 >= y.from && year2 <= y.to) return true;
    //   } else if (year1 && year1 !== -1) {
    //     if (year1 >= y.from) return true;
    //   }

    //   return false;
    // });

    // setCalendarYearRange(
    //   targetYearRange ?? { ...ActiveOrgCalendarRange, from: year1, to: year2 }
    // );
  }, [
    selectedMonthsData[0]?.month,
    selectedMonthsData[0]?.year,
    selectedMonthsData[1]?.month,
    selectedMonthsData[1]?.year,
  ]);

  const clickHandlerInput = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const closeHandlerPopover = () => {
    setAnchorEl(null);
  };

  const handleKeyPress = (event) => {
    if ([32, 13].includes(event.keyCode)) setAnchorEl(event.currentTarget);
  };

  const applyHandler = () => {
    const monthSelectionData = monthCardsWrapperRef.current.getData();
    const {
      startMonth: { index: startMonthIndex, name: startMonthTitle } = {},
      endMonth: { index: endMonthIndex, name: endMonthTitle } = {},
      startYear: startMonthYear,
      endYear: endMonthYear,
    } = monthSelectionData;

    let from = null;
    let to = null;

    if (
      startMonthIndex !== -1 &&
      startMonthTitle !== "" &&
      startMonthYear !== -1
    )
      from = { monthName: startMonthTitle, year: startMonthYear };

    if (endMonthIndex !== -1 && endMonthTitle !== "" && endMonthYear !== -1)
      to = { monthName: endMonthTitle, year: endMonthYear };

    if (tabTitles[tabIndex] === MONTH_FILTER_TYPES.MONTH_RANGE && to === null)
      return;

    setFormattedInputValue(from, to);
    closeHandlerPopover();
    handleMonthCalendarInputChange(
      monthSelectionData,
      calendarYearRange.orgCode
    );
  };

  const { month: m1, year: y1 } = selectedMonthsLocalState[0] ?? {};
  const { month: m2, year: y2 } = selectedMonthsLocalState[1] ?? {};

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1}>
        <InputLabel htmlFor={`input-${name}`} sx={{ fontWeight: 600 }}>
          {label}
        </InputLabel>

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
            width: 180,
          }}
          value={inputValue}
          onClick={clickHandlerInput}
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
          // onChange={() => null}
        />
        {typeof onReset === "function" && (
          <Tooltip
            title="Reset to default"
            placement="bottom"
            arrow
            enterDelay={100}
          >
            <IconButton
              sx={{
                color: "text.primary",
                "&.MuiButtonBase-root": { m: 0 },
              }}
              aria-label="Reset Month input Filter to default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onReset();
              }}
            >
              <RestoreIcon />
            </IconButton>
          </Tooltip>
        )}
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
        onClose={closeHandlerPopover}
      >
        <EnhancedTabs
          tabTitles={tabTitles}
          tabsGroupTitle="Month Calendar"
          selectedTabIndex={tabIndex}
          tabIndexUpdateHandler={(newIndexValue) => {
            setTabIndex(newIndexValue);
          }}
          sx={{ justifyContent: "center" }}
          TabsComponentProps={{
            sx: {
              pt: 1,
            },
          }}
          TabComponentProps={{
            sx: {
              pb: 1,
            },
            a11yTabProps: {
              "aria-controls": "Month Calendar Input Content",
            },
          }}
        />

        {!hideOrgCalendar && (
          <Box ml="auto" width="300px" my={2} pl={2}>
            <StandardVariantSelect
              label="Org Calendar:"
              options={CALENDAR_RANGE_LIST.map((y) => ({
                key: `${y.from}-${y.to}`,
                value: y,
                title: `${y.from} - ${y.to}`,
              }))}
              value={calendarYearRange}
              getValueLabel={(v) => `${v.from} - ${v.to}`}
              isOptionEqualToValue={(option, value) =>
                option.value.from === value.from && option.value.to === value.to
              }
              onChange={(option) => {
                setCalendarYearRange(option.value);
                setSelectedMonthsLocalState([
                  { month: -1, year: option.value.from },
                  { month: -1, year: option.value.to },
                ]);
              }}
            />
          </Box>
        )}
        <Divider flexItem sx={{ borderColor: "#D9D9D9" }} />
        <Box id="Month Calendar Input Content" p={3} pt={2}>
          <Stack gap={2}>
            <MonthCardsWrapper
              isRangeSelection={
                tabTitles[tabIndex] === MONTH_FILTER_TYPES.MONTH_RANGE
              }
              calendarMinYear={calendarYearRange.from}
              calendarMaxYear={calendarYearRange.to}
              startMonthIndex={m1}
              startYear={y1}
              endMonthIndex={m2}
              endYear={y2}
              ref={monthCardsWrapperRef}
              monthRangeSelectionLimits={monthRangeSelectionLimits}
            />
            <Divider flexItem sx={{ borderColor: "#D9D9D9" }} />
            {tabTitles[tabIndex] === MONTH_FILTER_TYPES.MONTH_RANGE &&
              showMonthRangeInfoText && (
                <SpanElement mt={-1} fontSize="14px">
                  <SpanElement fontWeight={500} fontSize="inherit">
                    Note:&nbsp;
                  </SpanElement>
                  <SpanElement fontSize="inherit">
                    {`Minimum ${monthRangeSelectionLimits.min} months and maximum ${monthRangeSelectionLimits.max}
                  months can be selected.`}
                  </SpanElement>
                </SpanElement>
              )}
            <FlexContainer justifyContent="flex-end">
              <Button
                onClick={closeHandlerPopover}
                autoFocus
                variant="outlined"
                sx={buttonSxProps}
              >
                Cancel
              </Button>
              <Button
                onClick={applyHandler}
                variant="contained"
                sx={buttonSxProps}
              >
                Apply
              </Button>
            </FlexContainer>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}

MonthCalendarInput.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  inputSelectionType: PropTypes.oneOf(Object.values(MONTH_FILTER_TYPES)),
  selectedMonthsData: PropTypes.arrayOf(
    PropTypes.shape({ month: PropTypes.number, year: PropTypes.number })
  ), // month values are zero-based index
  handleMonthCalendarInputChange: PropTypes.func,
  onReset: PropTypes.func,
  monthRangeSelectionLimits: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
  }),
  showMonthRangeInfoText: PropTypes.bool,
  forceInputSelectionType: PropTypes.bool,
  orgCode: PropTypes.string.isRequired,
  hideOrgCalendar: PropTypes.bool,
};

MonthCalendarInput.defaultProps = {
  name: "month-calendar",
  inputSelectionType: MONTH_FILTER_TYPES.MONTH_SINGLE,
  selectedMonthsData: [],
  handleMonthCalendarInputChange: (data) =>
    console.log("Updated Month Input", data),
  onReset: undefined,
  monthRangeSelectionLimits: { min: 2, max: 12 },
  showMonthRangeInfoText: true,
  forceInputSelectionType: false,
  hideOrgCalendar: false,
};

export default MonthCalendarInput;
