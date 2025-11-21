import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputBase, IconButton } from "@mui/material";
import { useState } from "react";

/**
 * intuismart HMS - Search Bar
 * ------------------------------------------------
 * A responsive, animated search input with hover/focus expansion,
 * theme-aware colors, and keyboard accessibility.
 */
function SearchBar({ placeholder = "Search", onSearch }) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");

  const handleFocus = () => setFocused(true);
  const handleBlur = () => !query && setFocused(false);
  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) onSearch(val);
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => e.preventDefault()}
      role="search"
      aria-label="Search"
      sx={{
        display: "flex",
        alignItems: "center",
        width: focused ? { xs: "100%", sm: "280px" } : { xs: "42px", sm: "160px" },
        height: "42px",
        borderRadius: "9999px",
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[800]
            : theme.palette.grey[200],
        boxShadow:
          focused &&
          "0px 2px 8px rgba(80,9,181,0.1), 0px 16px 32px rgba(43,27,73,0.15)",
        paddingInline: focused ? "12px" : "8px",
        transition: "all 0.3s ease-in-out",
        overflow: "hidden",
        color: theme.palette.text.primary,
        "&:hover": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[700]
              : theme.palette.grey[300],
        },
      }}
    >
      <IconButton
        type="submit"
        sx={{
          p: 0.8,
          color: focused
            ? theme.palette.primary.main
            : theme.palette.text.secondary,
          transition: "color 0.2s ease-in-out",
        }}
        aria-label="Search"
      >
        <SearchIcon />
      </IconButton>

      <InputBase
        placeholder={placeholder}
        inputProps={{ "aria-label": "Search" }}
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        sx={{
          ml: 1,
          flex: 1,
          fontWeight: 500,
          fontSize: "0.95rem",
          color: theme.palette.text.primary,
          opacity: focused ? 1 : 0,
          width: focused ? "100%" : 0,
          transition: "all 0.3s ease",
        }}
      />
    </Box>
  );
}

export default SearchBar;
