import { Button, useTheme } from "@mui/material";
import PropTypes from "prop-types";

function QuarterButton(props) {
  const { isCurrent, isSelected, children, onClick, disabled } = props;
  const theme = useTheme();

  let color = theme.palette.hms.main;
  let backgroundColor = "#EEEEEE";
  let className = "QuarterButton-root";

  if (isSelected) color = theme.palette.common.white;
  else if (isCurrent) color = theme.palette.primary.main;

  if (isSelected) backgroundColor = theme.palette.text.primary;

  if (isSelected) className = `${className} QuarterButton-Selected`;
  else if (isCurrent) className = `${className} QuarterButton-Current`;

  // console.log({ children, isSelected, isCurrent, disabled });

  return (
    <Button
      variant="contained"
      sx={{
        fontSize: "18px",
        fontWeight: isCurrent || isSelected ? "500" : "400",
        color,
        backgroundColor,
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        padding: "2px 20px",
        border: "2px solid transparent",
        borderColor: isCurrent ? theme.palette.primary.main : undefined,
        "&:hover": {
          backgroundColor: theme.palette.primary.main,
          color: "white",
        },
        "&.Mui-disabled": {
          backgroundColor: "white",
          borderColor: "#EEEEEE",
          color: "#777",
        },
      }}
      onClick={onClick}
      disabled={disabled}
      className={className}
      disableElevation
    >
      {children}
    </Button>
  );
}

QuarterButton.propTypes = {
  isCurrent: PropTypes.bool,
  isSelected: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

QuarterButton.defaultProps = {
  isCurrent: false,
  isSelected: false,
  disabled: false,
};

export default QuarterButton;
