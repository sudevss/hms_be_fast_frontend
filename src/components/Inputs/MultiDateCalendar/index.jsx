import { FlexContainer } from "@components/Flex";
import SpanElement from "@components/SpanElement";
import { Button, Divider, Paper, Stack } from "@mui/material";
import PropTypes from "prop-types";
import DateCalendar from "./DateCalendar";

const buttonSxProps = {
  borderRadius: "28px",
  fontSize: "18px",
  padding: "8px 24px",
  ml: 1,
  lineHeight: 1,
};

function MultiDateCalendar(props) {
  const {
    fullYear,
    monthIndex,
    maxAllowedDate,
    selectedDateValues,
    onDateClick,
    onClear,
    isError,
  } = props;

  // useEffect(() => {}, []);

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Stack spacing={1}>
        <DateCalendar
          fullYear={fullYear}
          monthIndex={monthIndex}
          dateValues={selectedDateValues}
          onClick={onDateClick}
          maxAllowedDate={maxAllowedDate}
        />
        <Divider flexItem />
        <FlexContainer justifyContent="space-between">
          {selectedDateValues?.length === 0 ? (
            <SpanElement
              sx={{
                fontSize: "12px",
                color: isError ? "error.main" : "hms.main",
              }}
            >
              Please select atleast a date
            </SpanElement>
          ) : (
            <SpanElement />
          )}
          <Button
            onClick={onClear}
            autoFocus
            variant="outlined"
            sx={buttonSxProps}
            // disabled
          >
            Clear
          </Button>
        </FlexContainer>
      </Stack>
    </Paper>
  );
}

MultiDateCalendar.propTypes = {
  fullYear: PropTypes.number, // year in yyyy format
  monthIndex: PropTypes.number, // zero-based index
  maxAllowedDate: PropTypes.number,
  selectedDateValues: PropTypes.arrayOf(PropTypes.number),
  onDateClick: PropTypes.func,
  onClear: PropTypes.func,
  isError: PropTypes.bool,
};

MultiDateCalendar.defaultProps = {
  fullYear: new Date().getFullYear(),
  monthIndex: new Date().getMonth(),
  maxAllowedDate: 30,
  selectedDateValues: [],
  onDateClick: () => null,
  onClear: () => null,
  isError: false,
};

export default MultiDateCalendar;
