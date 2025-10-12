import { MONTH_NAMES } from "@data/common";
import { Box, Divider, Stack, styled } from "@mui/material";
import { range } from "@utils/commonUtils";
import PropTypes from "prop-types";
import { useMemo } from "react";
import SelectWithLabel from "../SelectWithLabelWithSpanElement";
import MonthButton from "./MonthButton";

export const GridContainer = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 83px)",
  justifyContent: "center",
  alignItems: "center",
  padding: 0,
}));

const toDay = new Date();

function MonthCard(props) {
  const {
    yearLabel,
    minYear,
    maxYear,
    selectedYear,
    selectedMonthIndex,
    onMonthChange,
    onYearChange,
    getMonthDisabled,
  } = props;

  const YEAR_MENU_OPTIONS = useMemo(
    () =>
      range(minYear, maxYear).map((month) => ({
        value: month,
        label: month.toString(),
      })),
    [minYear, maxYear]
  );

  const isCurrentMonth = (i) =>
    selectedYear === toDay.getFullYear() && i === toDay.getMonth();

  return (
    <Stack gap={2} className="MonthCard-root">
      <SelectWithLabel
        label={yearLabel}
        value={selectedYear}
        menuOptions={YEAR_MENU_OPTIONS}
        SelectSxProps={{ minWidth: 102 }}
        RootProps={{ alignSelf: "center" }}
        onChangeHandler={(value) => onYearChange(parseInt(value, 10))}
        width={100}
      />
      <Divider variant="middle" flexItem sx={{ borderColor: "#D9D9D9" }} />
      <GridContainer
        component="ul"
        sx={{ listStyle: "none" }}
        className="MonthButton-group"
      >
        {MONTH_NAMES.map((month, i) => (
          <MonthButton
            key={`${selectedYear}-${month}`}
            isCurrentMonth={isCurrentMonth(i)}
            isSelectedMonth={i === selectedMonthIndex}
            onClick={() => onMonthChange(i)}
            disabled={getMonthDisabled({
              fullYear: selectedYear,
              monthIndex: i,
            })}
          >
            {month.slice(0, 3)}
          </MonthButton>
        ))}
      </GridContainer>
    </Stack>
  );
}

MonthCard.propTypes = {
  selectedMonthIndex: PropTypes.number, // zero-based index
  yearLabel: PropTypes.string,
  minYear: PropTypes.number, // year in yyyy format
  maxYear: PropTypes.number, // year in yyyy format
  selectedYear: PropTypes.number, // year in yyyy format
  onMonthChange: PropTypes.func,
  onYearChange: PropTypes.func,
  getMonthDisabled: PropTypes.func,
};

MonthCard.defaultProps = {
  yearLabel: "Year",
  minYear: 2020,
  maxYear: toDay.getFullYear(),
  selectedYear: -1,
  selectedMonthIndex: -1,
  onMonthChange: () => null,
  onYearChange: () => null,
  // eslint-disable-next-line no-unused-vars
  getMonthDisabled: ({ fullYear, monthIndex }) => false,
};

export default MonthCard;
