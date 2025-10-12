import {
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import PropTypes from "prop-types";

function SelectWithLabel(props) {
  const {
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
    width,
    minWidth = 240,
    ...rest
  } = props;
  const { required } = rest;

  const handleChange = (event) => {
    onChangeHandler(event.target.value);
  };

  let MenuOptionElements = [];

  if (menuOptions?.length === 0 && showMenuOptionsLoadingStatus) {
    MenuOptionElements.push(
      <MenuItem value="loading" key="loading" disabled>
        <em>Loading</em>
      </MenuItem>
    );
  } else if (
    menuOptions?.length === 0 &&
    !showMenuOptionsLoadingStatus &&
    showOptionsNotAvailableStatus
  ) {
    MenuOptionElements.push(
      <MenuItem value="no data" key="no data" disabled>
        <em>No data</em>
      </MenuItem>
    );
  } else {
    MenuOptionElements = menuOptions.map((option) => {
      if (!option.value)
        return (
          <MenuItem value="" key="falsy-item" id="falsy-item">
            <em>None</em>
          </MenuItem>
        );

      return (
        <MenuItem
          value={option.value || option.label}
          key={option.value || option.label}
          disabled={disableMenuOptionConditionValidator(option)}
          style={{
            whiteSpace: "unset",
            wordBreak: "break-word",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          {option.label}
        </MenuItem>
      );
    });
  }

  return (
    <Stack spacing={1} {...RootProps}>
      <InputLabel
        className="ml-2"
        htmlFor={`menu-${name}`}
        sx={{
          fontWeight: 600,
          ...(required && {
            "&::after": { content: "' *'", color: "error.main" },
          }),
        }}
        {...labelProps}
      >
        {label}
      </InputLabel>
      <Select
        {...rest}
        id={`menu-${name}`}
        name={name}
        value={value}
        sx={{
          minWidth: minWidth,
          width,

          "& .MuiSelect-select.Mui-disabled .placeholder-text": {
            color: "#BBB",
            fontWeight: 400,
          },
          "& .MuiSelect-select .placeholder-text": {
            color: "#CCB8F0",
            fontWeight: 400,
          },
          ...SelectSxProps,
        }}
        MenuProps={{
          sx: {
            "& .MuiList-root": {
              maxHeight: "260px",
              maxWidth: "100%",
            },
          },
        }}
        onChange={handleChange}
        // MenuProps={{ sx: { marginTop: 1 } }}
        renderValue={(selected) => {
          if (!selected && placeholderText) {
            return <span className="placeholder-text">{placeholderText}</span>;
          }

          return renderValue ? renderValue(selected) : selected;
        }}
      >
        {MenuOptionElements}
      </Select>
      {helperText && (
        <FormHelperText sx={{ color: "error.main" }}>
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
  SelectSxProps: PropTypes.shape({}),
  RootProps: PropTypes.shape({}),
  labelProps: PropTypes.shape({}),
  onChangeHandler: PropTypes.func,
  disableMenuOptionConditionValidator: PropTypes.func,
  helperText: PropTypes.string,
  placeholderText: PropTypes.string,
  showMenuOptionsLoadingStatus: PropTypes.bool,
  showOptionsNotAvailableStatus: PropTypes.bool,
  width: PropTypes.number,
};

SelectWithLabel.defaultProps = {
  SelectSxProps: {},
  RootProps: {},
  labelProps: {},
  renderValue: null,
  onChangeHandler: (value) => null,
  disableMenuOptionConditionValidator: () => false,
  helperText: "",
  placeholderText: "",
  showMenuOptionsLoadingStatus: true,
  showOptionsNotAvailableStatus: true,
  width: 240,
};

export default SelectWithLabel;
