import SideIllustrationPanel from "@components/SideIllustrationPanel";
import { Box, Grid, Stack, Typography } from "@mui/material";

function NoUserAccess() {
  return (
    <Grid container width="100%" height="100%" margin="0" minWidth="400px">
      <Grid
        item
        xs={12}
        sm={5}
        sx={{
          backgroundColor: "#EBE4FF",
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
              <span className="px-10 text-[25px] font-bold text-[#5009B5]  flex justify-center ">
                Hello User, You currently do not have Data Access to the
                application.
              </span>
            </Typography>
            <Box className="text-[#5009B5] font-thin">
              Navigate to
              <a
                href={`${encodeURI(
                  `${window.location.origin}/v2/api/assets/cit/CRET_User_Manual.pdf`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#794CFF",
                  fontWeight: "600",
                  fontSize: 14,
                  cursor: "pointer",
                  marginLeft: "3px",
                  textDecoration: "underline",
                  marginBottom: "4px",
                }}
              >
                User Manual
              </a>
            </Box>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default NoUserAccess;
