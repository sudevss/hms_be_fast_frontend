import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { colors } from "./palette";
import { typography } from "./typography";

/**
 * Carelon HMS Theme (Dynamic)
 * ------------------------------------------
 * Supports Light & Dark modes, responsive typography,
 * and consistent component styling across resolutions.
 */

export const themeSettings = (mode = "light") => {
  const isDark = mode === "dark";

  const baseTheme = createTheme({
    palette: {
      mode,
      primary: {
        ...colors.primary,
        main: isDark ? "#4ADE80" : colors.primary.main, // softer accent in dark mode
      },
      background: {
        default: isDark ? "#4ADE80" : "#FFFFFF",
        paper: isDark ? "#1A202C" : "#F9FAFB",
      },
      text: {
        primary: isDark ? "#F5F5F5" : "#0A121E",
        secondary: isDark ? "#AAAAAA" : "#636C7F",
        disabled: isDark ? "#777777" : "#949494",
      },
      success: { ...colors.success },
      warning: { ...colors.warning },
      error: { ...colors.error },
      hms: { ...colors.hms },
      grey: { ...colors.grey },
    },

    typography,

    shape: { borderRadius: 8 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#0A121E" : "#FFFFFF",
            color: isDark ? "#F5F5F5" : "#0A121E",
            transition: "background-color 0.3s ease, color 0.3s ease",
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: "1200px",
            "@media (max-width:1200px)": { padding: "0 24px" },
            "@media (max-width:600px)": { padding: "0 16px" },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "capitalize",
            borderRadius: 8,
            fontWeight: 600,
            padding: "8px 20px",
            transition: "all 0.2s ease",
            "&:hover": {
              boxShadow:
                "0px 1px 5px rgba(80, 9, 181, 0.1), 0px 8px 24px rgba(43, 27, 73, 0.15)",
            },
          },
        },
      },
    },
  });

  return responsiveFontSizes(baseTheme);
};

export default themeSettings;
