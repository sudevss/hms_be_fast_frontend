import { Button, styled } from "@mui/material";

const StyledButton = styled(Button)(({ theme, variant }) => ({
  fontSize: "18px",
  fontWeight: "500",
  paddingBlock: "8px",
  paddingInline: "24px",
  borderRadius: "28px",
  lineHeight: "26px",
  minWidth: "80px",
  borderColor: theme.palette.primary.main,
  ...(variant === "outlined"
    ? {
        borderWidth: "2px",
        "&:is(:hover,:focus)": {
          borderWidth: "2px",
          borderColor: theme.palette.primary.main,
        },
      }
    : null),
}));

export default StyledButton;
