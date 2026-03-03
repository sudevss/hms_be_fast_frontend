import {
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  useTheme,
} from "@mui/material";
import PropTypes from "prop-types";
import SpanElement from "@components/SpanElement";

/**
 * intuismart HMS - Inline Select With Label + SpanElement
 * ----------------------------------------------------------
 * Responsive, inline select component that supports
 * label emphasis (via SpanElement), placeholders, helper text,
 * and dynamic menu states (loading/no data).
 */
function SelectWithLabelWithSpanElement({
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
  noDataText,
  showMenuOptionsLoadingStatus,
  showOptionsNotAvailableStatus,
  width = "100%",
  minWidth = 200,
  ...rest
}) {
  const theme = useTheme();

  const handleChange = (event) => {
    onChangeHandler(event.target.value);
  };

  // Generate Menu Options
  const MenuOptionElements = (() => {
    if (menuOptions?.length === 0 && showMenuOptionsLoadingStatus)
      return [
        <MenuItem key="loading" disabled>
          <em>Loading...</em>
        </MenuItem>,
      ];

    if (
      menuOptions?.length === 0 &&
      !showMenuOptionsLoadingStatus &&
      showOptionsNotAvailableStatus
    )
      return [
        <MenuItem key="no-data" disabled>
          <em>{noDataText || "No data available"}</em>
        </MenuItem>,
      ];

    return menuOptions.map((option) => (
      <MenuItem
        value={option.value || option.label}
        key={option.value || option.label}
        disabled={disableMenuOptionConditionValidator(option)}
        sx={{
          whiteSpace: "unset",
          wordBreak: "break-word",
          width: "100%",
          fontSize: "14px",
          fontWeight: 500,
          color: theme.palette.text.primary,
          "&.Mui-disabled": { opacity: 0.6, color: theme.palette.text.disabled },
        }}
      >
        {option.label}
      </MenuItem>
    ));
  })();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1}
      flexWrap="wrap"
      {...RootProps}
      sx={{ width, minWidth, ...RootProps?.sx }}
    >
      {/* Label with optional inline SpanElement */}
      <InputLabel
        htmlFor={`menu-${name}`}
        sx={{
          fontWeight: 600,
          fontSize: "0.95rem",
          color: theme.palette.text.primary,
          whiteSpace: "nowrap",
          ...labelProps?.sx,
        }}
        {...labelProps}
      >
        <SpanElement fontWeight={600} color={theme.palette.hms.main}>
          {label}
        </SpanElement>
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
          minWidth,
          flex: "1 1 auto",
          height: 42,
          borderRadius: "8px",
          backgroundColor:
            theme.palette.mode === "dark" ? "#1E1E1E" : "#F6F6F6",
          "& .MuiSelect-select": {
            padding: "8px 12px",
            color: theme.palette.text.primary,
            fontWeight: 500,
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
          },
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
        }}
        renderValue={(selected) =>
          !selected && placeholderText ? (
            <span className="placeholder-text">{placeholderText}</span>
          ) : renderValue ? (
            renderValue(selected)
          ) : (
            selected
          )
        }
      >
        {MenuOptionElements}
      </Select>

      {/* Helper Text */}
      {helperText && (
        <FormHelperText
          sx={{
            color: theme.palette.error.main,
            fontSize: "0.8rem",
            ml: { xs: 0, sm: 1 },
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Stack>
  );
}

SelectWithLabelWithSpanElement.propTypes = {
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
      ]),
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
  noDataText: PropTypes.string,
  showMenuOptionsLoadingStatus: PropTypes.bool,
  showOptionsNotAvailableStatus: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minWidth: PropTypes.number,
};

SelectWithLabelWithSpanElement.defaultProps = {
  SelectSxProps: {},
  RootProps: {},
  labelProps: {},
  renderValue: null,
  onChangeHandler: () => {},
  disableMenuOptionConditionValidator: () => false,
  helperText: "",
  placeholderText: "",
  noDataText: "",
  showMenuOptionsLoadingStatus: true,
  showOptionsNotAvailableStatus: true,
  width: "100%",
  minWidth: 200,
};

export default SelectWithLabelWithSpanElement;
