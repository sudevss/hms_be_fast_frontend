import { MONTH_NAMES } from "@data/common";
import { Stack } from "@mui/material";
import { range } from "@utils/commonUtils";
import PropTypes from "prop-types";
import { forwardRef, useEffect, useImperativeHandle, useReducer } from "react";
import MonthCard from "./MonthCard";

const SET_START_MONTH_INFO = "SET_START_MONTH_INFO";
const SET_START_MONTH_YEAR = "SET_START_MONTH_YEAR";
const SET_END_MONTH_INFO = "SET_END_MONTH_INFO";
const SET_END_MONTH_YEAR = "SET_END_MONTH_YEAR";
const UPDATE_INITIAL_STATE = "UPDATE_INITIAL_STATE";
const RESET_STATE = "RESET_STATE";

const initialState = {
  startMonth: { index: -1, name: "" },
  endMonth: { index: -1, name: "" },
  startYear: -1,
  endYear: -1,
};

const reducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case UPDATE_INITIAL_STATE:
      return {
        ...state,
        ...payload,
      };

    case SET_START_MONTH_INFO:
      return {
        ...state,
        startMonth: payload,
        endMonth: { ...initialState.endMonth },
      };
    case SET_END_MONTH_INFO:
      return {
        ...state,
        endMonth: payload,
      };
    case SET_START_MONTH_YEAR:
      return {
        ...state,
        startYear: payload,
        startMonth: { ...initialState.startMonth },
        endMonth: { ...initialState.endMonth },
      };
    case SET_END_MONTH_YEAR:
      return {
        ...state,
        endYear: payload,
        endMonth: { ...initialState.endMonth },
      };
    case RESET_STATE:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

const today = new Date();

const MonthCardsWrapper = forwardRef((props, ref) => {
  const {
    isRangeSelection,
    calendarMinYear,
    calendarMaxYear,
    startMonthIndex: smi,
    endMonthIndex: emi,
    startYear: sy,
    endYear: ey,
    monthRangeSelectionLimits,
  } = props;

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    startMonth: { index: startMonthIndex },
    endMonth: { index: endMonthIndex },
    startYear,
    endYear,
  } = state;

  useEffect(() => {
    dispatch({
      type: UPDATE_INITIAL_STATE,
      payload: {
        startMonth: { index: smi, name: MONTH_NAMES[smi] ?? "" },
        endMonth: { index: emi, name: MONTH_NAMES[emi] ?? "" },
        startYear: sy === -1 ? today.getFullYear() : sy,
        endYear: ey === -1 ? today.getFullYear() : ey,
      },
    });
  }, [smi, emi, sy, ey]);

  useImperativeHandle(
    ref,
    () => ({
      getData() {
        if (!isRangeSelection)
          return {
            ...state,
            endMonth: { ...initialState.endMonth },
            endYear: initialState.endYear,
          };

        return {
          ...state,
        };
      },
    }),
    [state]
  );

  const getFirstCardInRangeMonthIndexes = () => {
    if (
      isRangeSelection &&
      endMonthIndex !== -1 &&
      startMonthIndex > -1 &&
      startMonthIndex < 11
    )
      return startYear === endYear
        ? range(startMonthIndex + 1, endMonthIndex)
        : range(startMonthIndex + 1, 11);

    return [];
  };
  const getSecondCardInRangeMonthIndexes = () => {
    if (isRangeSelection && startMonthIndex !== -1 && endMonthIndex > 0)
      return startYear === endYear
        ? range(startMonthIndex, endMonthIndex - 1)
        : range(0, endMonthIndex - 1);

    return [];
  };

  const getSecondCardDisabledMonthIndexes = () => {
    // -2 indicates already selected start month and end month allowed to be selected
    const offset = monthRangeSelectionLimits.min - 2 || 0;

    if (startMonthIndex !== -1 && startYear === endYear)
      return range(0, startMonthIndex + offset);
    if (startMonthIndex !== -1 && startYear === endYear - 1)
      return range(0, startMonthIndex + offset - 12).concat(
        range(startMonthIndex, 11)
      );

    return range(0, 11);
  };

  return (
    <Stack spacing={3} direction="row" justifyContent="space-between">
      <MonthCard
        name="month-card-from"
        yearLabel={isRangeSelection ? "From Year" : "Year"}
        minYear={calendarMinYear}
        maxYear={calendarMaxYear}
        selectedYear={startYear}
        selectedMonthIndex={startMonthIndex}
        inRangeMonthIndexes={getFirstCardInRangeMonthIndexes()}
        monthSelectionHandler={(data) =>
          dispatch({ type: SET_START_MONTH_INFO, payload: data })
        }
        yearSelectionHandler={(data) =>
          dispatch({ type: SET_START_MONTH_YEAR, payload: data })
        }
        disableYearFromSelectionIfGreaterThanThis={
          endYear !== -1 ? endYear : undefined
        }
        disabledMonthIndexes={[]}
      />
      {isRangeSelection && (
        <MonthCard
          name="month-card-to"
          yearLabel={isRangeSelection ? "To Year" : "Year"}
          minYear={calendarMinYear}
          maxYear={calendarMaxYear}
          selectedYear={endYear}
          selectedMonthIndex={endMonthIndex}
          inRangeMonthIndexes={getSecondCardInRangeMonthIndexes()}
          monthSelectionHandler={(data) =>
            dispatch({ type: SET_END_MONTH_INFO, payload: data })
          }
          yearSelectionHandler={(data) =>
            dispatch({ type: SET_END_MONTH_YEAR, payload: data })
          }
          disableYearFromSelectionIfLessThanThis={
            startYear !== -1 ? startYear : undefined
          }
          disabledMonthIndexes={getSecondCardDisabledMonthIndexes()}
        />
      )}
    </Stack>
  );
});

MonthCardsWrapper.propTypes = {
  isRangeSelection: PropTypes.bool,
  calendarMinYear: PropTypes.number.isRequired, // year in yyyy format
  calendarMaxYear: PropTypes.number.isRequired, // year in yyyy format
  startMonthIndex: PropTypes.number,
  startYear: PropTypes.number,
  endMonthIndex: PropTypes.number,
  endYear: PropTypes.number,
  monthRangeSelectionLimits: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
  }),
};

MonthCardsWrapper.defaultProps = {
  isRangeSelection: false,
  startMonthIndex: -1,
  startYear: -1,
  endMonthIndex: -1,
  endYear: -1,
  monthRangeSelectionLimits: { min: 2, max: 12 },
};

MonthCardsWrapper.displayName = "MonthCardsWrapper";

export default MonthCardsWrapper;
