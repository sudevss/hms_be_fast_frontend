import SideIllustrationPanel from "@components/SideIllustrationPanel";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <Grid container width="100%" height="100%" margin="0" minWidth="400px">
      <Grid
        item
        xs={12}
        sm={5}
        sx={{
          backgroundColor: "primary.light",
          height: { xs: "60px", sm: "100%" },
        }}
      >
        <SideIllustrationPanel />
      </Grid>
      <Grid
        item
        xs={12}
        sm={7}
        sx={{
          height: { xs: "calc(100% - 60px)", sm: "100%" },
        }}
      >
        <Stack justifyContent="center" alignItems="center" height="100%">
          <Stack
            alignItems="center"
            justifyContent="center"
            width={{ md: "500px", xs: "90%" }}
            height="300px"
            sx={{ background: "#EFF1F8", borderRadius: "16px" }}
            pt="2rem"
          >
            <Typography variant="h2" gutterBottom>
              Page not found
            </Typography>
            <Box>
              Navigate to
              <Button
                onClick={() =>
                  navigate(`/criticalExceptionTracker/login`, { replace: true })
                }
                variant="text"
                sx={{
                  m: 0,
                  ml: 1,
                  p: 0,
                  width: "auto",
                  minWidth: "auto",
                  textDecoration: "underline",
                  fontSize: "16px",
                  cursor: "pointer",
                  lineHeight: 1,
                  "&:hover": {
                    background: "none",
                    textDecoration: "underline",
                    fontSize: "16px",
                  },
                }}
                disableRipple
                disableElevation
                disableTouchRipple
              >
                Home
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default NotFound;
