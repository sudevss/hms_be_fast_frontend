import { FlexContainer } from "@components/Flex";
import SpanElement from "@components/SpanElement";
import { MONTH_NAMES } from "@data/common";
import { Box, Divider, Stack, styled } from "@mui/material";
import { range } from "@utils/commonUtils";
import PropTypes from "prop-types";
import { useMemo } from "react";
import DateButton from "./DateButton";

const DAY_HEADING_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const today = new Date();

export const GridContainer = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(7, 38px)",
  gridAutoRows: "38px",
  justifyContent: "center",
  alignItems: "center",
  padding: 0,
  gap: "2px",
}));

function DateCalendar(props) {
  const { fullYear, monthIndex, dateValues, onClick, maxAllowedDate } = props;

  const date = new Date(fullYear, monthIndex, 1);
  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();
  const EMPTY_CELLS = range(1, date.getDay());
  const DATE_VALUES = useMemo(() => range(1, lastDay), [fullYear, monthIndex]);

  return (
    <Stack>
      <FlexContainer gap={1} style={{ padding: 0, margin: 0 }}>
        <SpanElement
          sx={{ fontSize: "20px", fontStyle: "italic", fontWeight: 500 }}
        >
          {MONTH_NAMES[monthIndex]},
        </SpanElement>
        <SpanElement
          sx={{ fontSize: "20px", fontStyle: "italic", fontWeight: 500 }}
        >
          {fullYear}
        </SpanElement>
      </FlexContainer>
      <Divider variant="middle" flexItem />
      <GridContainer component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
        {DAY_HEADING_LETTERS.map((letter, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <FlexContainer gap={1} key={letter + i} component="li" pt={1}>
            <SpanElement
              sx={{ fontSize: "20px", fontStyle: "italic", fontWeight: 500 }}
            >
              {letter}
            </SpanElement>
          </FlexContainer>
        ))}
        {EMPTY_CELLS.map((emptyCell) => (
          <Box component="li" key={emptyCell} />
        ))}
        {DATE_VALUES.map((dateValue) => (
          <DateButton
            key={dateValue}
            isCurrentDate={
              today.getFullYear() === fullYear &&
              today.getMonth() === monthIndex &&
              today.getDate() === dateValue
            }
            isSelectedDate={dateValues.includes(dateValue)}
            onClick={onClick}
            isDisabled={dateValue > maxAllowedDate}
          >
            {dateValue}
          </DateButton>
        ))}
      </GridContainer>
    </Stack>
  );
}

DateCalendar.propTypes = {
  fullYear: PropTypes.number, // year in yyyy format
  monthIndex: PropTypes.number, // zero-based index
  dateValues: PropTypes.arrayOf(PropTypes.number),
  onClick: PropTypes.func.isRequired,
  maxAllowedDate: PropTypes.number,
};

DateCalendar.defaultProps = {
  fullYear: new Date().getFullYear(),
  monthIndex: new Date().getMonth(),
  dateValues: [],
  maxAllowedDate: 30,
};

export default DateCalendar;
