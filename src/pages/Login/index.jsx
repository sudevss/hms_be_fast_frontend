import { Grid, Stack, Typography } from "@mui/material";
import SideIllustrationPanel from "@components/SideIllustrationPanel";
import LoginCardPanel from "./LoginCardPanel";

function Login() {
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
          ml: "20%",
          height: { xs: "calc(100% - 60px)", sm: "100%" },
        }}
      >
        <LoginCardPanel />
      </Grid>
    </Grid>
  );
}

export default Login;
