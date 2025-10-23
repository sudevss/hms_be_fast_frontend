import { colors } from "../palette";

export const MuiTabs = {
  styleOverrides: {
    root: {
      backgroundColor: colors.primary.light,
      paddingInline: "24px",
      fontWeight: "600",
      fontSize: "16px",
      "@media (max-width:600px)": {
        fontSize: "14px",
        paddingInline: "12px",
      },
    },
    indicator: {
      backgroundColor: colors.hms.main,
    },
  },
};

export const MuiTab = {
  styleOverrides: {
    root: {
      color: colors.primary.main,
      fontWeight: "600",
      textTransform: "capitalize",
      fontSize: "16px",
      "&.Mui-selected": {
        color: colors.hms.main,
      },
    },
  },
};
