import { Box, styled } from "@mui/material";

const StyledFlexCard = styled(Box)(({ theme }) => ({
  color: "hms.main",
  display: "flex",
  borderColor: theme.palette.primary.main,
  borderRadius: "8px",
  border: "1px solid #E3E3E3",
  boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.05)",
}));

export default StyledFlexCard;
