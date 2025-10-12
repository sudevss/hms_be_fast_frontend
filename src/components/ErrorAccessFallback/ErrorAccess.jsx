import { Box } from "@mui/material";

function ErrorAccess() {
  return (
    <Box
      role="alert"
      display="flex"
      p={4}
      flexDirection="column"
      color="primary.dark"
      alignItems="flex-start"
    >
      <Box color="inherit" fontWeight={500} fontSize={22}>
        You don't have Access . Please reach out to{" "}
        <a
          href="mailto:QualityCoE@carelon.com"
          className="text-[#5009BB] hover:underline font-semibold"
        >
          QualityCoE
        </a>{" "}
        for access and try again.
      </Box>
    </Box>
  );
}

export default ErrorAccess;
