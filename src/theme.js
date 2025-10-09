// Carelon Branding theme Colors
const PRIMARY_TEXT_COLOR = "#115E59"; // Primary text color

export const colors = {
  primary: {
    main: "#115E59", // Button color
    light: "#a4e3bda8", // Light background color
    // light: "#F4ECFF", // Light background color
    dark: "#2B1B49", // Appbar background color
    white: "#F5F5F5",
    trendLineLight: "rgba(121, 76, 255, 0.5)",
  },
  success: {
    main: "#108808",
    light: "rgba(16, 136, 8, 0.5)",
    trendLineLight: "rgba(16, 136, 8, 0.5)",
  },
  warning: {
    main: "#F2BC35",
    light: "rgba(242, 188, 53, 0.5)",
    trendLineLight: "rgba(242, 188, 53, 0.5)",
  },
  error: {
    main: "#D20A3C",
    light: "rgba(210, 10, 60, 0.5)",
    trendLineLight: "rgba(210, 10, 60, 0.5)",
  },
  hms: {
    main: "#231E33", // Secondary text color
    light: "#4E4988",
    dark: "#0C0A1A",
    contrastText: "#FFFFFF",
  },
  grey: {
    main: "#606060",
    light: "#AAAAAA",
    dark: "#404040",
    trendLineLight: "#AAAAAA",
    contrastText: "#FFFFFF",
  },
  info: {
    main: "##44B8F3",
    light: "#8edcff",
    dark: "#0076b6",
    contrastText: "#FFFFFF",
  },
  text: {
    primary: PRIMARY_TEXT_COLOR,
  },
};

const fontFamily = [
  "ui-sans-serif",
  "system-ui",
  "sans-serif",
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  "Segoe UI Symbol",
  '"Noto Color Emoji"',
].join(",");

// mui theme settings
export const themeSettings = {
  palette: {
    mode: "light",
    primary: {
      ...colors.primary,
      extraLight: "#D7C3FF",
    },
    success: {
      ...colors.success,
      extraLight: "rgba(16, 136, 8, 0.3)",
    },
    warning: {
      ...colors.warning,
      extraLight: "rgba(242, 188, 53, 0.3)",
    },
    error: {
      ...colors.error,
      extraLight: "rgba(210, 10, 60, 0.3)",
    },
    hms: {
      ...colors.hms,
      highlight: "#DBCEF8", // For text highlight
    },
    grey: {
      ...colors.grey,
      extraLight: "#CCCCCC",
    },
    text: {
      primary: "#0A121E",
      title: "#0A121E",
      subTitle: "#636C7F",
      title2: "#30394C",
      subTitle2: "#949494",
    },
    background: {
      default: "#FFFFFF",
    },
  },
  typography: {
    fontFamily,
    fontSize: 14,
    h1: {
      fontFamily,
      fontSize: 36,
      fontWeight: 700,
    },
    h2: {
      fontFamily,
      fontSize: 32,
      fontWeight: 600,
    },
    h3: {
      fontFamily,
      fontSize: 28,
      fontWeight: 500,
    },
    h4: {
      fontFamily,
      fontSize: 24,
      fontWeight: 400,
    },
    h5: {
      fontFamily,
      fontSize: 20,
      fontWeight: 400,
    },
    h6: {
      fontFamily,
      fontSize: 16,
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
          paddingInline: "34px",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#FFFFFF",
          padding: "16px",
          paddingBlock: "8px",
          color: colors.hms.main,
          fontSize: "16px",
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
            // marginTop: "-1px",
          },
          "&:after": {
            border: `1px solid ${colors.primary.main}`,
            // marginTop: "-1px",
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          // border: `2px solid ${colors.primary.light}`,
          borderRadius: "8px",
          backgroundColor: colors.primary.light,
          padding: "2px",
          marginRight: "16px",
        },
      },
    },
    MuiFormGroup: {
      styleOverrides: {
        root: {
          "&[role='radiogroup']": {
            alignItems: "flex-start",
          },
        },
      },
    },
    MuiToggleButton: {
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
          marginRight: "1px",
          "&:hover": {
            backgroundColor: colors.primary.light,
          },
          "&.Mui-selected": {
            fontWeight: "600",
            borderRadius: "6px !important",
            backgroundColor: "white",
            color: "#0A121E",
            "&:hover": {
              backgroundColor: "white",
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary.light,
          paddingInline: "24px",
          color: colors.primary.main,
          fontWeight: "600",
          textTransform: "capitalize",
          fontSize: "16px",
        },
        indicator: {
          backgroundColor: colors.hms.main,
        },
      },
    },
    MuiTab: {
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
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          // "&.Mui-selected": {
          //   backgroundColor: "white",
          // },
          "&:not(.Mui-selected):not(.MuiPaginationItem-previousNext)": {
            backgroundColor: "#F5F5F5",
            fontWeight: "600",
          },
          "& :is(.MuiSvgIcon-root)": {
            fontWeight: "600",
            fontSize: "32px",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "16px",
          fontWeight: "500",
          color: colors.hms.main,
          padding: "12px 16px",
          "&.MuiMenuItem-root:is(:hover)": {
            color: colors.text.primary,
            backgroundColor: "#a4e3bda8",
          },
          "&.MuiMenuItem-root:is(:focus-visible)": {
            color: colors.text.primary,
          },
          "&.MuiMenuItem-root": {
            color: colors.hms.main,
            backgroundColor: "transparent",
          },
          "&.MuiMenuItem-root.Mui-selected": {
            fontWeight: "600",
            color: colors.primary.main,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "2px",
          fontSize: "12px",
          fontWeight: "500",
          lineHeight: "14px",
          height: "auto",
          padding: "2px 8px",
          "& .MuiChip-label": {
            padding: 0,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: "500",
          fontSize: "16px",
          "& .MuiSelect-select": {
            padding: "9px",
            // backgroundColor: "#fff",
          },
          "& .MuiSvgIcon-root": {
            fill: colors.text.primary,
          },
          "& .MuiSvgIcon-root.Mui-disabled": {
            fill: colors.grey.light,
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
          "& .MuiMenuItem-root": {
            padding: "12px",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            pointerEvents: "none !important",
            cursor: "not-allowed !important",
          },
        },
      },
    },

    MuiStandardInput: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            pointerEvents: "none !important",
            cursor: "not-allowed !important",
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: colors.hms.main,
          fontSize: "16px",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          color: colors.hms.main,
          paddingBlock: 0,
          fontSize: "18px",
          alignItems: "center",
          "&.MuiAlert-standardSuccess": {
            backgroundColor: "rgba(16, 136, 8, 0.3)",
          },
          "&.MuiAlert-standardError": {
            backgroundColor: "#F2B6C5",
          },
          "&.MuiAlert-standardWarning": {
            backgroundColor: "#FBEBC2",
          },
          "&.MuiAlert-standardSuccess .MuiSvgIcon-root": {
            color: colors.success.main,
          },
          "&.MuiAlert-standardError .MuiSvgIcon-root": {
            color: colors.error.main,
          },
          "&.MuiAlert-standardWarning .MuiSvgIcon-root": {
            color: colors.warning.main,
          },
          "& .MuiSvgIcon-root[data-testid='CloseIcon']": {
            color: "black",
            fontSize: "24px",
          },
        },
      },
      variants: [
        {
          props: { severity: "success" },
          style: {
            backgroundColor: colors.success.light,
          },
        },
        {
          props: { severity: "error" },
          style: {
            backgroundColor: colors.error.light,
          },
        },
        {
          props: { severity: "warning" },
          style: {
            backgroundColor: colors.warning.light,
          },
        },
      ],
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#231E33",
        },
      },
    },
  },
  shadows: [
    "none", // Shadow level 0
    "0px 1px 3px rgba(80, 9, 181, 0.1), 0px 6px 20px rgba(43, 27, 73, 0.15)", // Shadow level 1
    "0px 1px 5px rgba(80, 9, 181, 0.1), 0px 8px 24px rgba(43, 27, 73, 0.15)", // Shadow level 2
    "0px 2px 8px rgba(80, 9, 181, 0.1), 0px 16px 32px rgba(43, 27, 73, 0.15)", // Shadow level 3
    "0px 4px 12px rgba(80, 9, 181, 0.1), 0px 24px 48px rgba(43, 27, 73, 0.15)", // Shadow level 4
    "0px 6px 16px rgba(80, 9, 181, 0.1), 0px 32px 64px rgba(43, 27, 73, 0.15)", // Shadow level 5
    "0px 8px 20px rgba(80, 9, 181, 0.1), 0px 40px 80px rgba(43, 27, 73, 0.15)", // Shadow level 6
    "0px 10px 24px rgba(80, 9, 181, 0.1), 0px 48px 96px rgba(43, 27, 73, 0.15)", // Shadow level 7
    "0px 12px 28px rgba(80, 9, 181, 0.1), 0px 56px 112px rgba(43, 27, 73, 0.15)", // Shadow level 8
    "0px 14px 32px rgba(80, 9, 181, 0.1), 0px 64px 128px rgba(43, 27, 73, 0.15)", // Shadow level 9
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 72px 144px rgba(43, 27, 73, 0.15)", // Shadow level 10
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 80px 144px rgba(43, 27, 73, 0.15)", // Shadow level 10
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 88px 144px rgba(43, 27, 73, 0.15)", // Shadow level 11
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 96px 144px rgba(43, 27, 73, 0.15)", // Shadow level 12
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 104px 144px rgba(43, 27, 73, 0.15)", // Shadow level 13
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 112px 144px rgba(43, 27, 73, 0.15)", // Shadow level 14
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 120px 144px rgba(43, 27, 73, 0.15)", // Shadow level 15
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 128px 144px rgba(43, 27, 73, 0.15)", // Shadow level 16
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 136px 144px rgba(43, 27, 73, 0.15)", // Shadow level 17
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 144px 144px rgba(43, 27, 73, 0.15)", // Shadow level 18
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 152px 144px rgba(43, 27, 73, 0.15)", // Shadow level 19
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 160px 144px rgba(43, 27, 73, 0.15)", // Shadow level 20
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 168px 144px rgba(43, 27, 73, 0.15)", // Shadow level 21
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 176px 144px rgba(43, 27, 73, 0.15)", // Shadow level 22
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 184px 144px rgba(43, 27, 73, 0.15)", // Shadow level 23
    "0px 16px 36px rgba(80, 9, 181, 0.1), 0px 192px 144px rgba(43, 27, 73, 0.15)", // Shadow level 24
  ],
  shape: {
    borderRadius: 8,
  },
};
