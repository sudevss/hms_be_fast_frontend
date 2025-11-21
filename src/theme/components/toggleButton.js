import { colors } from "../palette";

export const MuiToggleButton = {
  styleOverrides: {
    root: {
      textTransform: "capitalize",
      padding: "6px 10px",
      minWidth: "160px",
      fontSize: "14px",
      fontWeight: "500",
      color: colors.text.primary,
      border: "none",
      borderRadius: "6px !important",
      "&:hover": {
        backgroundColor: colors.primary.light,
      },
      "&.Mui-selected": {
        fontWeight: "600",
        backgroundColor: "white",
        color: "#0A121E",
      },
      "@media (max-width:600px)": {
        minWidth: "120px",
        fontSize: "13px",
      },
    },
  },
};
