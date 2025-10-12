import { Box, Stack } from "@mui/material";
import { getFormattedDate, isDate } from "@utils/date";
import PropTypes from "prop-types";

export default function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const { targetStr, actualStr } = payload[0]?.payload ?? {};

    const labelDate = new Date(label);

    return (
      <Stack
        component="ul"
        sx={{
          listStyle: "none",
          textAlign: "center",
        }}
        justifyContent="center"
        alignItems="center"
        p={0}
        m={0}
        height="100%"
        width="100%"
      >
        <Box
          component="li"
          color="grey.main"
          fontSize="14px"
          fontWeight={400}
          lineHeight="22px"
        >
          Target:&nbsp;
          {targetStr}
        </Box>
        <Box
          component="li"
          color="hms.main"
          fontSize="16px"
          fontWeight={500}
          lineHeight="22px"
        >
          Actual:&nbsp;
          {actualStr}
        </Box>
        <Box
          component="li"
          color="grey.main"
          fontSize="14px"
          fontWeight={400}
          lineHeight="22px"
        >
          {label && isDate(labelDate)
            ? getFormattedDate(labelDate, true, false)
            : label}
        </Box>
      </Stack>
    );
  }

  return null;
}
CustomTooltip.propTypes = {
  active: PropTypes.bool.isRequired,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      payload: PropTypes.shape({}),
    })
  ).isRequired,
  label: PropTypes.string,
};
CustomTooltip.defaultProps = {
  label: "",
};
