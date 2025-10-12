import { useTheme } from "@emotion/react";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputBase } from "@mui/material";
import { useState } from "react";

function SearchBar() {
  const [showInput, setShowInput] = useState(false);

  const theme = useTheme();

  const handleMouseEnter = () => {
    setShowInput(true);
  };

  const handleMouseLeave = () => {
    setShowInput(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "fit-content",
        minWidth: "12ch",
        borderRadius: theme.shape.borderRadius * 6,
        backgroundColor: "inherit",
        padding: theme.spacing(0, 1),
        cursor: "pointer",
        color: "white",
        transition: theme.transitions.create(["all"], {
          duration: 300,
          easing: theme.transitions.easing.easeInOut,
          delay: 100,
        }),
        "&:is(:hover,:focus)": {
          backgroundColor: theme.palette.grey[300],
        },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      tabIndex={0}
    >
      <SearchIcon
        sx={{
          marginRight: theme.spacing(1),
          color: showInput ? theme.palette.primary.dark : "white",
        }}
      />
      {showInput ? (
        <InputBase
          placeholder="Search"
          sx={{
            color: theme.palette.primary.dark,
            fontWeight: 500,
            fontSize: "18px",
          }}
        />
      ) : (
        <Box component="span" sx={{ color: "white" }}>
          Search
        </Box>
      )}
    </Box>
  );
}

export default SearchBar;
