import { Autocomplete, InputLabel, Stack, TextField } from "@mui/material";
import PropTypes from "prop-types";

function AutoCompleteWithLabel(props) {
  const {
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
    ...restProps
  } = props;

  const { required } = restProps;

  const getSortedOptions = (options) =>
    options.sort((a, b) => -b[sortBy].localeCompare(a[sortBy]));

  return (
    <Stack
      alignItems="flex-start"
      className="TextInputWithLabel-root"
      sx={RootSxProps}
    >
      <InputLabel
        htmlFor={`search-${name}`}
        sx={{
          fontWeight: 500,
          lineHeight: "28px",
          ...(required && {
            "&::after": { content: "' *'", color: "error.main" },
          }),
          ...LabelSxProps,
        }}
      >
        {label}
      </InputLabel>
      <Autocomplete
        value={value}
        onChange={(e, newValue, reason) => {
          onChangeHandler(newValue, reason);
        }}
        inputValue={inputValue}
        onInputChange={(e, newValue, reason) => {
          onInputChangeHandler(newValue, reason);
        }}
        id={`search-${name}`}
        options={sortBy ? getSortedOptions(searchOptions) : searchOptions}
        groupBy={
          groupBy ? (option) => option[groupBy][0]?.toUpperCase() : undefined
        }
        sx={{
          width: 250,
          "& .MuiSvgIcon-root": {
            fontSize: "1.5rem",
          },
          "& .MuiInputBase-root": {
            padding: 0,
            color: "#666666",
          },
          "& .MuiInputBase-input": {
            color: "text.primary",
            fontWeight: 500,
            padding: 0,
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#666666",
          },
          "& .MuiButtonBase-root.MuiAutocomplete-popupIndicator": {
            display: "none",
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              startAdornment,
              // endAdornment: (
              //   <IconButton
              //     edge="end"
              //     aria-label="clear"
              //     onClick={() => null}
              //   >
              //     <Clear />
              //   </IconButton>
              // ),
            }}
          />
        )}
      />
    </Stack>
  );
}

AutoCompleteWithLabel.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  // value: PropTypes.oneOfType([
  //   PropTypes.string,
  //   PropTypes.bool,
  //   PropTypes.number,
  // ]).isRequired,
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
  RootSxProps: PropTypes.shape({}),
  searchOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  sortBy: PropTypes.string,
  groupBy: PropTypes.string,
  LabelSxProps: PropTypes.shape({}),
  startAdornment: PropTypes.node,
};

AutoCompleteWithLabel.defaultProps = {
  placeholder: "Search",
  RootSxProps: {},
  LabelSxProps: {},
  sortBy: "",
  groupBy: "",
  startAdornment: null,
};

export default AutoCompleteWithLabel;
