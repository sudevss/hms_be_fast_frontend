import {
  Checkbox,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import PropTypes from "prop-types";

const MenuSxProps = {
  minWidth: "unset",
  width: 120,
  "& .MuiMenuItem-root .MuiCheckbox-root": {
    p: 0,
    pr: 1,
    color: (theme) => theme.palette.text.primary,
  },
  "& .MuiMenuItem-root .MuiTypography-root": {
    whiteSpace: "normal",
    wordWrap: "break-word",
    fontSize: "16px",
    fontWeight: 500,
  },
};

function MutliSelectWithLabel(props) {
  const {
    name,
    label,
    selectedOptionValues,
    onChangeHandler,
    wrapperProps,
    menuOptions,
    SelectSxProps,
    MenuProps,
    ...rest
  } = props;

  const handleChange = (e) => {
    const { target } = e;

    const selectionValue =
      typeof target.value === "string" ? target.split(",") : target.value;

    onChangeHandler(selectionValue);
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} {...wrapperProps}>
      <InputLabel htmlFor={`menu-${name}`} sx={{ fontWeight: 600 }}>
        {label}
      </InputLabel>
      <Select
        {...rest}
        id={`menu-${name}`}
        name={name}
        value={selectedOptionValues}
        sx={{
          width: 180,
          "& .MuiSvgIcon-root": {
            fontSize: "1.5rem",
          },
          ...SelectSxProps,
        }}
        onChange={handleChange}
        renderValue={(selected) => selected.join(", ")}
        multiple
        MenuProps={{
          sx: MenuSxProps,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "right",
          },
          ...MenuProps,
        }}
        autoWidth={false}
      >
        {menuOptions.map((option) => (
          <MenuItem
            value={option.value || option.label}
            key={option.value || option.label}
            disabled={option.disabled}
          >
            <Checkbox
              checked={selectedOptionValues.includes(
                option.value || option.label
              )}
            />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}

MutliSelectWithLabel.propTypes = {
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
  SelectSxProps: PropTypes.shape({}),
  wrapperProps: PropTypes.shape({}),
  MenuProps: PropTypes.shape({}),
  onChangeHandler: PropTypes.func,
};

MutliSelectWithLabel.defaultProps = {
  SelectSxProps: {},
  wrapperProps: {},
  MenuProps: {},
  onChangeHandler: (value) => {
    console.log(value);
  },
};

export default MutliSelectWithLabel;
