import {
  Checkbox,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  useTheme,
  FormHelperText,
} from "@mui/material";
import PropTypes from "prop-types";

/**
 * intuismart HMS - MultiSelectWithLabel
 * ------------------------------------------------
 * Responsive, theme-aware multiple select component
 * with labeled checkboxes and accessibility support.
 */
function MultiSelectWithLabel({
  name,
  label,
  selectedOptionValues,
  onChangeHandler,
  wrapperProps,
  menuOptions,
  SelectSxProps,
  MenuProps,
  helperText,
  required,
  error,
  ...rest
}) {
  const theme = useTheme();

  const handleChange = (e) => {
    const { target } = e;
    const selectionValue =
      typeof target.value === "string" ? target.value.split(",") : target.value;
    onChangeHandler(selectionValue);
  };

  return (
    <Stack
      spacing={0.5}
      alignItems="flex-start"
      className="MultiSelectWithLabel-root"
      sx={{ width: "100%", maxWidth: 320, ...wrapperProps }}
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
      >
        {label}
      </InputLabel>

      {/* Select Field */}
      <Select
        {...rest}
        id={`menu-${name}`}
        name={name}
        value={selectedOptionValues}
        onChange={handleChange}
        multiple
        displayEmpty
        renderValue={(selected) => {
          if (selected.length === 0) return "Select...";
          if (selected.length > 3)
            return `${selected.slice(0, 3).join(", ")} +${selected.length - 3}`;
          return selected.join(", ");
        }}
        sx={{
          width: "100%",
          backgroundColor:
            theme.palette.mode === "dark" ? "#1E1E1E" : "#F6F6F6",
          borderRadius: "8px",
          fontSize: "14px",
          color: theme.palette.text.primary,
          fontWeight: 500,
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            padding: "8px 12px",
          },
          "& .MuiSvgIcon-root": {
            color: theme.palette.text.primary,
            fontSize: "1.4rem",
          },
          "& fieldset": {
            borderColor: error
              ? theme.palette.error.main
              : theme.palette.grey.light,
          },
          "&:hover fieldset": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
            borderWidth: "2px",
          },
          ...SelectSxProps,
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              width: 240,
              maxHeight: 260,
              borderRadius: "8px",
              boxShadow:
                "0px 1px 5px rgba(80,9,181,0.1), 0px 8px 24px rgba(43,27,73,0.15)",
              "& .MuiMenuItem-root": {
                whiteSpace: "normal",
                wordWrap: "break-word",
                fontSize: "14px",
                fontWeight: 500,
              },
              "& .MuiCheckbox-root": {
                p: 0,
                pr: 1,
                color: theme.palette.primary.main,
              },
            },
          },
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
          ...MenuProps,
        }}
      >
        {menuOptions.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            sx={{
              "&.Mui-disabled": {
                opacity: 0.6,
              },
            }}
          >
            <Checkbox
              checked={selectedOptionValues.includes(option.value)}
              sx={{
                color: theme.palette.primary.main,
                "&.Mui-checked": {
                  color: theme.palette.primary.main,
                },
              }}
            />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
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

/* ✅ PropTypes */
MultiSelectWithLabel.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  selectedOptionValues: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])
  ).isRequired,
  menuOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
      ]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  SelectSxProps: PropTypes.object,
  wrapperProps: PropTypes.object,
  MenuProps: PropTypes.object,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.bool,
};

/* ✅ Default Props */
MultiSelectWithLabel.defaultProps = {
  SelectSxProps: {},
  wrapperProps: {},
  MenuProps: {},
  helperText: "",
  required: false,
  error: false,
};

export default MultiSelectWithLabel;
