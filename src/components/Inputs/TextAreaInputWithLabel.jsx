import { Box, InputLabel, TextField, useTheme } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Carelon HMS - TextArea Input with Label
 * -----------------------------------------------------
 * A themed multiline input with label, responsive spacing,
 * and full consistency across the Carelon HMS design system.
 */
function TextAreaInputWithLabel({
  type,
  name,
  label,
  placeholder,
  InputSxProps,
  LabelSxProps,
  RootSxProps,
  required,
  helperText,
  error,
  ...restProps
}) {
  const theme = useTheme();

  return (
    <Box
      className="TextAreaInputWithLabel-root"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0.75,
        width: "100%",
        ...RootSxProps,
      }}
    >
      {/* Label */}
      <InputLabel
        htmlFor={`input-${name}`}
        sx={{
          fontWeight: 500,
          fontSize: "0.95rem",
          lineHeight: "1.25rem",
          color: theme.palette.text.primary,
          ...(required && {
            "&::after": {
              content: "' *'",
              color: theme.palette.error.main,
            },
          }),
          ...LabelSxProps,
        }}
      >
        {label}
      </InputLabel>

      {/* Multiline TextField */}
      <TextField
        id={`input-${name}`}
        name={name}
        type={type}
        variant="outlined"
        multiline
        minRows={4}
        placeholder={placeholder}
        fullWidth
        error={error}
        helperText={helperText}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor:
              theme.palette.mode === "dark" ? "#1E1E1E" : "#FFFFFF",
            borderRadius: "8px",
            fontSize: "0.95rem",
            fontWeight: 500,
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
          },
          "& .MuiInputBase-input": {
            color: theme.palette.text.primary,
            padding: "12px",
            lineHeight: 1.5,
            resize: "vertical",
          },
          "& .MuiFormHelperText-root": {
            marginLeft: "4px",
            fontSize: "0.8rem",
            color: error
              ? theme.palette.error.main
              : theme.palette.text.secondary,
          },
          ...InputSxProps,
        }}
        {...restProps}
      />
    </Box>
  );
}

TextAreaInputWithLabel.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  InputSxProps: PropTypes.object,
  LabelSxProps: PropTypes.object,
  RootSxProps: PropTypes.object,
  required: PropTypes.bool,
  helperText: PropTypes.string,
  error: PropTypes.bool,
};

TextAreaInputWithLabel.defaultProps = {
  type: "text",
  placeholder: "",
  InputSxProps: {},
  LabelSxProps: {},
  RootSxProps: {},
  required: false,
  helperText: "",
  error: false,
};

export default TextAreaInputWithLabel;
