import {
  Autocomplete,
  InputLabel,
  Stack,
  TextField,
  IconButton,
  useTheme,
  FormHelperText,
} from "@mui/material";
import { XCircle } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Carelon HMS - AutoComplete With Label
 * -------------------------------------------------------
 * Reusable, theme-aware, and responsive autocomplete input
 * Supports sorting, grouping, adornments, and clear button.
 */
function AutoCompleteWithLabel({
  name,
  label,
  value,
  placeholder,
  onChangeHandler,
  inputValue,
  onInputChangeHandler,
  RootSxProps,
  searchOptions,
  sortBy,
  groupBy,
  LabelSxProps,
  startAdornment,
  showClearButton,
  required,
  helperText,
  error,
  ...restProps
}) {
  const theme = useTheme();

  const getSortedOptions = (options) =>
    sortBy
      ? [...options].sort((a, b) =>
          a[sortBy].localeCompare(b[sortBy], undefined, { sensitivity: "base" })
        )
      : options;

  return (
    <Stack
      alignItems="flex-start"
      spacing={0.5}
      className="AutoCompleteWithLabel-root"
      sx={RootSxProps}
    >
      {/* Label */}
      <InputLabel
        htmlFor={`search-${name}`}
        sx={{
          fontWeight: 500,
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
          color: theme.palette.text.primary,
          ...(required && {
            "&::after": { content: "' *'", color: theme.palette.error.main },
          }),
          ...LabelSxProps,
        }}
      >
        {label}
      </InputLabel>

      {/* Autocomplete */}
      <Autocomplete
        id={`search-${name}`}
        value={value}
        onChange={(e, newValue, reason) => {
          onChangeHandler(newValue, reason);
        }}
        inputValue={inputValue}
        onInputChange={(e, newValue, reason) => {
          onInputChangeHandler(newValue, reason);
        }}
        options={getSortedOptions(searchOptions)}
        groupBy={
          groupBy ? (option) => option[groupBy][0]?.toUpperCase() : undefined
        }
        sx={{
          width: "100%",
          minWidth: 220,
          "& .MuiInputBase-root": {
            backgroundColor:
              theme.palette.mode === "dark" ? "#1E1E1E" : "#F6F6F6",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: theme.palette.text.primary,
            transition: "all 0.2s ease",
            "&:hover fieldset": {
              borderColor: theme.palette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
              borderWidth: "2px",
            },
          },
          "& .MuiOutlinedInput-root": {
            padding: 0,
            minHeight: 42,
          },
          "& .MuiSvgIcon-root": {
            fontSize: "1.3rem",
            color: theme.palette.text.secondary,
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            size="small"
            error={error}
            helperText=""
            InputProps={{
              ...params.InputProps,
              startAdornment,
              endAdornment: (
                <>
                  {showClearButton && inputValue && (
                    <IconButton
                      edge="end"
                      aria-label="clear"
                      size="small"
                      onClick={() => onInputChangeHandler("", "clear")}
                      sx={{
                        color: theme.palette.grey.main,
                        "&:hover": { color: theme.palette.error.main },
                      }}
                    >
                      <XCircle size={18} />
                    </IconButton>
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-input": {
                padding: "8px 12px",
              },
              "& .MuiInputBase-input::placeholder": {
                color: theme.palette.text.secondary,
                opacity: 0.7,
              },
            }}
          />
        )}
        {...restProps}
      />

      {/* Helper Text */}
      {helperText && (
        <FormHelperText
          sx={{
            color: error
              ? theme.palette.error.main
              : theme.palette.text.secondary,
            fontSize: "13px",
            ml: 1,
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Stack>
  );
}

/* ✅ PropTypes */
AutoCompleteWithLabel.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.shape({
    label: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
      PropTypes.number,
    ]),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  inputValue: PropTypes.string.isRequired,
  onInputChangeHandler: PropTypes.func.isRequired,
  RootSxProps: PropTypes.object,
  searchOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  sortBy: PropTypes.string,
  groupBy: PropTypes.string,
  LabelSxProps: PropTypes.object,
  startAdornment: PropTypes.node,
  showClearButton: PropTypes.bool,
  required: PropTypes.bool,
  helperText: PropTypes.string,
  error: PropTypes.bool,
};

/* ✅ Default Props */
AutoCompleteWithLabel.defaultProps = {
  placeholder: "Search",
  RootSxProps: {},
  LabelSxProps: {},
  sortBy: "",
  groupBy: "",
  startAdornment: null,
  showClearButton: true,
  required: false,
  helperText: "",
  error: false,
};

export default AutoCompleteWithLabel;
