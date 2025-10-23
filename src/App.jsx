import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./pages/router";
import { themeSettings } from "./theme";

// ✅ Optional: Global alert or error context (can uncomment later)
// import { SystemAlertContextProvider } from "@contexts/SystemAlertContext";

function App() {
  // Create and memoize the MUI theme for better performance
  const theme = useMemo(() => createTheme(themeSettings), []);

  return (
    <div className="app min-h-screen bg-gray-50 text-gray-900" id="App-root">
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
