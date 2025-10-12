import { DATA_LAST_UPDATED_MONTH_OFFSET, MONTH_NAMES } from "@data/common";
import { Box, Divider, styled, Stack } from "@mui/material";
import { range } from "@utils/commonUtils";
import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";
import SelectWithLabel from "../SelectWithLabelWithSpanElement";
import MonthButton from "./MonthButton";

export const GridContainer = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 83px)",
  justifyContent: "center",
  alignItems: "center",
  padding: 0,
}));

const date = new Date();

function MonthCard(props) {
  const {
    name,
    selectedMonthIndex,
    selectedYear,
    inRangeMonthIndexes,
    monthSelectionHandler,
    yearSelectionHandler,
    yearLabel,
    minYear,
    maxYear,
    disableYearFromSelectionIfGreaterThanThis,
    disableYearFromSelectionIfLessThanThis,
    disabledMonthIndexes,
  } = props;

  const menuOptions = useMemo(
    () =>
      range(minYear, maxYear).map((month) => ({
        value: month,
        label: month.toString(),
      })),
    [minYear, maxYear]
  );

  const onChangeHandler = (value) => yearSelectionHandler(parseInt(value, 10));
  const isCurrentMonth = (i) =>
    selectedYear === date.getFullYear() && i === date.getMonth();
  const isFutureMonth = (j) =>
    selectedYear === date.getFullYear() &&
    j > date.getMonth() - DATA_LAST_UPDATED_MONTH_OFFSET + 1;

  const validator = useCallback(
    (option) => {
      let disable = false;

      if (option.value < disableYearFromSelectionIfLessThanThis) disable = true;
      if (option.value > disableYearFromSelectionIfGreaterThanThis)
        disable = true;

      return disable;
    },
    [
      disableYearFromSelectionIfLessThanThis,
      disableYearFromSelectionIfGreaterThanThis,
    ]
  );

  return (
    <Stack spacing={2} pb={2} neme={name}>
      <SelectWithLabel
        label={yearLabel}
        name={`${yearLabel}-${name}`}
        value={selectedYear}
        menuOptions={menuOptions}
        SelectSxProps={{ minWidth: 102 }}
        RootProps={{ alignSelf: "center" }}
        onChangeHandler={onChangeHandler}
        disableMenuOptionConditionValidator={validator}
        width={100}
      />
      <Divider variant="middle" flexItem sx={{ borderColor: "#D9D9D9" }} />
      <GridContainer component="ul" sx={{ listStyle: "none" }}>
        {MONTH_NAMES.map((month, i) => (
          <MonthButton
            key={month}
            component="li"
            isCurrentMonth={isCurrentMonth(i)}
            isInRangeMonth={inRangeMonthIndexes.includes(i)}
            isSelectedMonth={i === selectedMonthIndex}
            onClick={() => monthSelectionHandler({ index: i, name: month })}
            disableSelection={
              isFutureMonth(i) || disabledMonthIndexes.includes(i)
            }
          >
            {month.slice(0, 3)}
          </MonthButton>
        ))}
      </GridContainer>
    </Stack>
  );
}

MonthCard.propTypes = {
  name: PropTypes.string,
  selectedMonthIndex: PropTypes.number, // zero-based index
  inRangeMonthIndexes: PropTypes.arrayOf(PropTypes.number), // zero-based indexes
  monthSelectionHandler: PropTypes.func,
  yearSelectionHandler: PropTypes.func,
  yearLabel: PropTypes.string,
  minYear: PropTypes.number, // year in yyyy format
  maxYear: PropTypes.number, // year in yyyy format
  selectedYear: PropTypes.number, // year in yyyy format
  disableYearFromSelectionIfGreaterThanThis: PropTypes.number, // year in yyyy format
  disableYearFromSelectionIfLessThanThis: PropTypes.number, // year in yyyy format
  disabledMonthIndexes: PropTypes.arrayOf(PropTypes.number), // zero-based indexes
};

MonthCard.defaultProps = {
  name: "month-card",
  inRangeMonthIndexes: [],
  selectedMonthIndex: -1,
  monthSelectionHandler: (month) => console.log(`Selected month:${month}`),
  yearSelectionHandler: (year) => console.log(`Selected year:${year}`),
  yearLabel: "Year",
  minYear: 2020,
  maxYear: date.getFullYear(),
  selectedYear: -1,
  disableYearFromSelectionIfGreaterThanThis: 9999,
  disableYearFromSelectionIfLessThanThis: -1,
  disabledMonthIndexes: [],
};

export default MonthCard;
