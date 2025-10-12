import { Box, InputLabel, TextField } from "@mui/material";
import PropTypes from "prop-types";

function TextInputWithLabel(props) {
  const {
    type,
    name,
    label,
    placeholder,
    InputSxProps,
    LabelSxProps,
    RootSxProps,
    ...restProps
  } = props;

  const { required } = restProps;

  return (
    <Box className="TextInputWithLabel-root" sx={RootSxProps}>
      <InputLabel
        htmlFor={`input-${name}`}
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
      <TextField
        id={`input-${name}`}
        name={name}
        type={type}
        variant="outlined"
        placeholder={placeholder}
        fullWidth
        sx={{
          padding: "5px",
          "&.MuiTextField-root": { backgroundColor: "inherit" },
          // "&.MuiTextField-root .MuiOutlinedInput-root": {
          //   backgroundColor: "white",
          // },
          "& .MuiInputBase-input": {
            color: "text.primary",
            fontWeight: 500,
            padding: "12px",
          },
          "&.MuiTextField-root .MuiOutlinedInput-root": {
            backgroundColor: "#fff",
            height: "40px",
            border: "1px #D7D7D7",
          },
          ...InputSxProps,
        }}
        {...restProps}
      />
    </Box>
  );
}

TextInputWithLabel.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  InputSxProps: PropTypes.shape({}),
  LabelSxProps: PropTypes.shape({}),
  RootSxProps: PropTypes.shape({}),
};

TextInputWithLabel.defaultProps = {
  type: "text",
  placeholder: "",
  InputSxProps: {},
  LabelSxProps: {},
  RootSxProps: {},
};

export default TextInputWithLabel;
