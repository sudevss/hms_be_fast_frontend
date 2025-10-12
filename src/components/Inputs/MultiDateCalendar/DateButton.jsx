import { Box, Button, useTheme } from "@mui/material";
import PropTypes from "prop-types";

function DateButton(props) {
  const { isCurrentDate, isSelectedDate, children, onClick, isDisabled } =
    props;
  const theme = useTheme();

  let color = theme.palette.hms.main;
  let backgroundColor = "transparent";
  let className = "date-btn";

  if (isSelectedDate) color = theme.palette.common.white;
  else if (isCurrentDate) color = theme.palette.text.main;

  if (isSelectedDate) backgroundColor = theme.palette.text.primary;

  if (isSelectedDate) className = `${className} selected-date`;
  else if (isCurrentDate) className = `${className} current-date`;

  if (isSelectedDate && isDisabled) color = "#F5F5F5 !important";

  return (
    <Box
      component="li"
      sx={{
        textAlign: "center",
        width: "100%",
        height: "100%",
        borderRadius: "50%",
      }}
      className={className}
    >
      <Button
        variant="text"
        sx={{
          fontSize: "18px",
          fontWeight: isCurrentDate || isSelectedDate ? "600" : "500",
          color,
          backgroundColor,
          p: 0,
          m: 0,
          minWidth: "unset",
          width: "100%",
          height: "100%",
          border: "2px solid transparent",
          // borderColor: isCurrentDate
          //   ? theme.palette.primary.main
          //   : "transparent",
          borderRadius: "50%",
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: "white",
            borderColor: theme.palette.primary.main,
          },
        }}
        data-value={children}
        data-selected={isSelectedDate}
        // disabled={false}
        onClick={onClick}
        disabled={isDisabled}
      >
        {children}
      </Button>
    </Box>
  );
}

DateButton.propTypes = {
  isCurrentDate: PropTypes.bool.isRequired,
  isSelectedDate: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired,
};

export default DateButton;
