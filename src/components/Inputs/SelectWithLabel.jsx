import {
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  useTheme,
} from "@mui/material";
import PropTypes from "prop-types";

/**
 * Carelon HMS - Select With Label
 * ---------------------------------------------------------
 * A themed, accessible select dropdown with label, placeholder,
 * dynamic states (loading/no data), and validation messages.
 */
function SelectWithLabel({
  name,
  label,
  value,
  renderValue,
  onChangeHandler,
  RootProps,
  labelProps,
  menuOptions,
  SelectSxProps,
  disableMenuOptionConditionValidator,
  helperText,
  placeholderText,
  showMenuOptionsLoadingStatus,
  showOptionsNotAvailableStatus,
  width = "100%",
  minWidth = 240,
  required,
  error,
  ...rest
}) {
  const theme = useTheme();

  const handleChange = (event) => {
    onChangeHandler(event.target.value);
  };

  let MenuOptionElements = [];

  if (menuOptions?.length === 0 && showMenuOptionsLoadingStatus) {
    MenuOptionElements.push(
      <MenuItem value="loading" key="loading" disabled>
        <em>Loading...</em>
      </MenuItem>
    );
  } else if (
    menuOptions?.length === 0 &&
    !showMenuOptionsLoadingStatus &&
    showOptionsNotAvailableStatus
  ) {
    MenuOptionElements.push(
      <MenuItem value="no data" key="no data" disabled>
        <em>No data available</em>
      </MenuItem>
    );
  } else {
    MenuOptionElements = menuOptions.map((option) => {
      if (!option.value) {
        return (
          <MenuItem value="" key="none-option">
            <em>None</em>
          </MenuItem>
        );
      }

      return (
        <MenuItem
          value={option.value || option.label}
          key={option.value || option.label}
          disabled={disableMenuOptionConditionValidator(option)}
          sx={{
            whiteSpace: "unset",
            wordBreak: "break-word",
            fontSize: "14px",
            fontWeight: 500,
            color: theme.palette.text.primary,
            "&.Mui-disabled": {
              opacity: 0.6,
              color: theme.palette.text.disabled,
            },
          }}
        >
          {option.label}
        </MenuItem>
      );
    });
  }

  return (
    <Stack
      spacing={0.75}
      alignItems="flex-start"
      sx={{ width, minWidth, ...RootProps }}
      className="SelectWithLabel-root"
    >
      {/* Label */}
      <InputLabel
        htmlFor={`menu-${name}`}
        sx={{
          fontWeight: 500,
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
          color: theme.palette.text.primary,
          ...(required && {
            "&::after": { content: "' *'", color: theme.palette.error.main },
          }),
        }}
        {...labelProps}
      >
        {label}
      </InputLabel>

      {/* Select Field */}
      <Select
        {...rest}
        id={`menu-${name}`}
        name={name}
        value={value}
        onChange={handleChange}
        displayEmpty
        sx={{
          borderRadius: "8px",
          backgroundColor:
            theme.palette.mode === "dark" ? "#1E1E1E" : "#F6F6F6",
          height: 42,
          fontWeight: 500,
          fontSize: "14px",
          color: theme.palette.text.primary,
          "& .MuiSelect-select": {
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
          },
          "& fieldset": {
            borderColor: error
              ? theme.palette.error.main
              : theme.palette.grey[400],
          },
          "&:hover fieldset": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
            borderWidth: "2px",
          },
          "& .placeholder-text": {
            color: theme.palette.text.secondary,
            opacity: 0.7,
            fontWeight: 400,
          },
          ...SelectSxProps,
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: "8px",
              maxHeight: 260,
              boxShadow:
                "0px 1px 5px rgba(80,9,181,0.1), 0px 8px 24px rgba(43,27,73,0.15)",
            },
          },
          sx: {
            "& .MuiList-root": {
              maxWidth: "100%",
            },
          },
        }}
        renderValue={(selected) => {
          if (!selected && placeholderText) {
            return <span className="placeholder-text">{placeholderText}</span>;
          }
          return renderValue ? renderValue(selected) : selected;
        }}
      >
        {MenuOptionElements}
      </Select>

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

SelectWithLabel.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]).isRequired,
  renderValue: PropTypes.func,
  menuOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
      ]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  SelectSxProps: PropTypes.object,
  RootProps: PropTypes.object,
  labelProps: PropTypes.object,
  onChangeHandler: PropTypes.func,
  disableMenuOptionConditionValidator: PropTypes.func,
  helperText: PropTypes.string,
  placeholderText: PropTypes.string,
  showMenuOptionsLoadingStatus: PropTypes.bool,
  showOptionsNotAvailableStatus: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minWidth: PropTypes.number,
  required: PropTypes.bool,
  error: PropTypes.bool,
};

SelectWithLabel.defaultProps = {
  SelectSxProps: {},
  RootProps: {},
  labelProps: {},
  renderValue: null,
  onChangeHandler: () => {},
  disableMenuOptionConditionValidator: () => false,
  helperText: "",
  placeholderText: "",
  showMenuOptionsLoadingStatus: true,
  showOptionsNotAvailableStatus: true,
  width: "100%",
  minWidth: 240,
  required: false,
  error: false,
};

export default SelectWithLabel;
