import Button from "@mui/material/Button";
import PropTypes from "prop-types";

export default function TextVariantButton({
  label,
  onClick = () => null,
  fontSize,
  textDecoration,
  textTransform,
  color,
  style,
  endIcon,
}) {
  return (
    <Button
      size="small"
      variant="text"
      sx={{
        m: 0,
        p: 0,
        pl: 1,
        minWidth: "unset",
        fontSize: fontSize || "16px",
        color: color || "text.primary",
        textDecoration: textDecoration || "underline",
        textTransform: textTransform || "capitalize ",
        "&.MuiButton-root:is(:hover,:focus)": {
          background: "none",
          textDecoration: textDecoration || "underline",
          textTransform: textTransform || "capitalize ",
        },
      }}
      disableRipple
      onClick={onClick}
      style={style}
      endIcon={endIcon}
    >
      {label}
    </Button>
  );
}

TextVariantButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  textDecoration: PropTypes.string,
  fontSize: PropTypes.string,
  textTransform: PropTypes.string,
  color: PropTypes.string,
  style: PropTypes.shape({}),
  endIcon: PropTypes.node,
};

TextVariantButton.defaultProps = {
  textDecoration: "none",
  fontSize: "16px",
  textTransform: "",
  color: "text.primary",
  style: {},
  endIcon: null,
};
