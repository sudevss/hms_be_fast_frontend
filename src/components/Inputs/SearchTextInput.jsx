import { IconButton, InputAdornment, TextField } from "@mui/material";
import PropTypes from "prop-types";
// import SearchIcon from "@mui/icons-material/Search";
import { CustomSearchIcon } from "@components/SVGs/Misc";
import CloseIcon from "@mui/icons-material/Close";

function SearchTextInput(props) {
  const {
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
  } = props;

  return (
    <TextField
      name={name || label}
      type="text"
      variant="outlined"
      placeholder={placeholder || label}
      fullWidth
      style={style}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onBlur={onBlur}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {value && (
              <IconButton
                onClick={() => {
                  onChange("");
                }}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                size="small"
                title="Clear"
                color="#115E59"
              >
                <CloseIcon color="#115E59" />
              </IconButton>
            )}
          </InputAdornment>
        ),
        startAdornment: (
          <InputAdornment position="start">
            <CustomSearchIcon
              sx={{ color: "#115E59" }}
              width={20}
              height={20}
            />
          </InputAdornment>
        ),
      }}
      disabled={disabled}
      autoComplete="off"
      aria-autocomplete="none"
      sx={{
        padding: "10px",
        "&.MuiTextField-root .MuiOutlinedInput-root": {
          backgroundColor: "#F6F6F6",
          height: "40px",
          border: "1px #D7D7D7",
        },
      }}
    />
  );
}

SearchTextInput.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  sx: PropTypes.shape({}),
  style: PropTypes.shape({}),
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
  fullWidth: false,
  disabled: false,
};

export default SearchTextInput;
