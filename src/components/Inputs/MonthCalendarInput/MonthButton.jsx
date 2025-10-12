import { Box, Button, useTheme } from "@mui/material";
import PropTypes from "prop-types";

function MonthButton(props) {
  const {
    isCurrentMonth,
    isSelectedMonth,
    isInRangeMonth,
    children,
    onClick,
    disableSelection,
    ...rest
  } = props;
  const theme = useTheme();

  let color = theme.palette.hms.main;
  let backgroundColor = "transparent";
  let className = "month-btn";

  if (isSelectedMonth) color = theme.palette.common.white;
  else if (isCurrentMonth) color = theme.palette.text.primary;

  if (isSelectedMonth) backgroundColor = theme.palette.text.primary;
  // else if (isInRangeMonth && !disableSelection)
  else if (isInRangeMonth) backgroundColor = "rgba(80, 9, 181, 0.1)";

  if (isSelectedMonth) className = `${className} selected-month`;
  // else if (isInRangeMonth && !disableSelection)
  //   className = `${className} in-range-month`;
  else if (isInRangeMonth) className = `${className} in-range-month`;
  else if (isCurrentMonth) className = `${className} current-month`;

  return (
    <Box
      {...rest}
      component="li"
      sx={{
        textAlign: "center",
        borderRadius: isSelectedMonth ? "25px" : 0,
        paddingBlock: isSelectedMonth ? "4px" : "0",
        marginBlock: isSelectedMonth ? "0" : "10px",
        // border: "2px solid transparent",
        "&.in-range-month + .in-range-month": {
          borderLeft: "2px solid #ccc",
        },
        "&.in-range-month:nth-of-type(3n+1)": {
          borderLeft: "none",
        },
        "&.selected-month .MuiButton-root.Mui-disabled": {
          color: "white",
        },
      }}
      className={className}
    >
      <Button
        variant="text"
        sx={{
          fontSize: "18px",
          fontWeight: isCurrentMonth || isSelectedMonth ? "600" : "500",
          color,
          backgroundColor,
          width: "100%",
          height: "100%",
          borderRadius: "inherit",
          padding: 0,
          paddingBlock: "inherit",
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: "white",
          },
        }}
        disabled={disableSelection}
        onClick={onClick}
      >
        {children}
      </Button>
    </Box>
  );
}

MonthButton.propTypes = {
  isCurrentMonth: PropTypes.bool,
  isSelectedMonth: PropTypes.bool,
  isInRangeMonth: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disableSelection: PropTypes.bool,
};

MonthButton.defaultProps = {
  isCurrentMonth: false,
  isSelectedMonth: false,
  isInRangeMonth: false,
  disableSelection: true,
};

export default MonthButton;
