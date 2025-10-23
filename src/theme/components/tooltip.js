import { colors } from "../palette";

export const MuiTooltip = {
  styleOverrides: {
    tooltip: {
      backgroundColor: "#FFFFFF",
      padding: "8px 16px",
      color: colors.hms.main,
      fontSize: "14px",
      border: `1px solid ${colors.primary.main}`,
      borderRadius: "8px",
      boxShadow:
        "0px 1px 5px rgba(80, 9, 181, 0.1), 0px 8px 24px rgba(43, 27, 73, 0.15)",
      marginTop: "6px !important",
    },
    arrow: {
      color: "white",
      "&:before": {
        border: `1px solid ${colors.primary.main}`,
      },
    },
  },
};
