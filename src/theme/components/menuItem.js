import { colors } from "../palette";

export const MuiMenuItem = {
  styleOverrides: {
    root: {
      fontSize: "16px",
      fontWeight: "500",
      color: colors.hms.main,
      padding: "12px 16px",
      "&:hover": {
        color: colors.text.primary,
        backgroundColor: colors.primary.light,
      },
      "&.Mui-selected": {
        fontWeight: "600",
        color: colors.primary.main,
      },
      "@media (max-width:600px)": {
        fontSize: "14px",
        padding: "10px 12px",
      },
    },
  },
};
