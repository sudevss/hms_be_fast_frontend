import {
  IconButton,
  InputAdornment,
  TextField,
  useTheme,
} from "@mui/material";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import { CustomSearchIcon } from "@components/SVGs/Misc";

/**
 * intuismart HMS - Search Text Input
 * --------------------------------------------------------
 * Themed, accessible search field with built-in icons,
 * clear functionality, and responsive styling.
 */
function SearchTextInput({
  name,
  label,
  placeholder,
  sx,
  style,
  value,
  onChange,
  onBlur,
  fullWidth,
  disabled,
}) {
  const theme = useTheme();

  return (
    <TextField
      name={name || label}
      type="text"
      variant="outlined"
      placeholder={placeholder || label}
      fullWidth={fullWidth}
      style={style}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      autoComplete="off"
      aria-label={label}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <CustomSearchIcon
              sx={{ color: theme.palette.primary.main }}
              width={20}
              height={20}
            />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              onClick={() => onChange("")}
              onMouseDown={(e) => e.preventDefault()}
              edge="end"
              size="small"
              title="Clear"
              sx={{
                color: theme.palette.error.main,
                "&:hover": {
                  color: theme.palette.primary.dark,
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor:
            theme.palette.mode === "dark" ? "#1E1E1E" : "#F6F6F6",
          height: "42px",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          "& fieldset": {
            borderColor: theme.palette.grey[400],
          },
          "&:hover fieldset": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
            borderWidth: "2px",
          },
        },
        "& .MuiInputBase-input": {
          color: theme.palette.text.primary,
          fontWeight: 500,
          fontSize: "0.95rem",
          padding: "8px 4px",
        },
        "& .MuiInputBase-input::placeholder": {
          color: theme.palette.text.secondary,
          opacity: 0.7,
        },
        ...sx,
      }}
    />
  );
}

SearchTextInput.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  sx: PropTypes.object,
  style: PropTypes.object,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
};

SearchTextInput.defaultProps = {
  name: "",
  placeholder: "",
  sx: {},
  style: {},
  onBlur: null,
  fullWidth: true,
  disabled: false,
};

export default SearchTextInput;
