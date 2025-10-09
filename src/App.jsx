import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./pages/router";
import { themeSettings } from "./theme";

function App() {
  const theme = useMemo(() => createTheme(themeSettings), []);

  return (
    <div className="app" id="App-root">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* <SystemAlertContextProvider> */}
        <RouterProvider router={router} />
        {/* </SystemAlertContextProvider> */}
      </ThemeProvider>
    </div>
  );
}

export default App;
