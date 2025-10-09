import { Typography } from "@mui/material";
import PropTypes from "prop-types";

// eslint-disable-next-line react/prop-types
function SpanElement({ sx, children, color, ...rest }) {
  return (
    <Typography
      variant="subtitle1"
      component="span"
      display="inline-block"
      color={color || "hms.main"}
      {...rest}
      sx={sx}
    >
      {children}
    </Typography>
  );
}
SpanElement.propTypes = {
  sx: PropTypes.shape({}),
  children: PropTypes.node,
};
SpanElement.defaultProps = {
  sx: {},
  children: null,
};
export default SpanElement;
