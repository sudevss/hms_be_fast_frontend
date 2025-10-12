import { Box, Button, useTheme } from "@mui/material";
import PropTypes from "prop-types";

function MonthButton(props) {
  const { isCurrentMonth, isSelectedMonth, children, onClick, disabled } =
    props;
  const theme = useTheme();

  let color = theme.palette.hms.main;
  let backgroundColor = "transparent";
  let className = "MonthButton-root";

  if (isSelectedMonth) color = theme.palette.common.white;
  else if (isCurrentMonth) color = theme.palette.text.primary;

  if (isSelectedMonth) backgroundColor = theme.palette.text.primary;

  if (isSelectedMonth) className = `${className} MonthButton-Selected`;
  else if (isCurrentMonth) className = `${className} MonthButton-Current`;

  return (
    <Box
      component="li"
      sx={{
        textAlign: "center",
        borderRadius: isSelectedMonth ? "25px" : 0,
        paddingBlock: isSelectedMonth ? "4px" : "0",
        marginBlock: isSelectedMonth ? "0" : "10px",
        "&.MonthButton-Selected .MuiButton-root.Mui-disabled": {
          color: "#E3E3E3",
        },
        "&.MonthButton-Current .MuiButton-root.Mui-disabled": {
          color,
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
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    </Box>
  );
}

MonthButton.propTypes = {
  isCurrentMonth: PropTypes.bool,
  isSelectedMonth: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

MonthButton.defaultProps = {
  isCurrentMonth: false,
  isSelectedMonth: false,
  disabled: false,
};

export default MonthButton;
