import {
  FormControl,
  FormHelperText,
  InputLabel,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
const DatePickerComponent = ({
  label,
  name,
  value,
  onChange,
  sxLabel = {},
  sxInput = {},
  inputProps = {},
  showInputLabel = true,
  format = "YYYY-MM-DD",
  currentYear = dayjs(),
  required = false,
  helperText = "",
  ...resProps
}) => {
  const parsed = value ? dayjs(value, format) : null;

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {showInputLabel && (
          <InputLabel
            htmlFor={name}
            className="block mb-1 ml-2 font-medium text-sm"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,

              lineHeight: "1.25rem",
              color: "#000000",
              display: "block",
              ...sxLabel,
              ...(required && {
                "&::after": { content: "' *'", color: "error.main" },
              }),
            }}
          >
            {label}
          </InputLabel>
        )}
        <DatePicker
          value={parsed?.isValid() ? parsed : null}
          onChange={(newVal) =>
            onChange({
              target: {
                name,
                value: dayjs(newVal).format(format),
              },
            })
          }
          minDate={currentYear}
          format={format}
          views={["year", "month", "day"]}
          slotProps={{
            textField: {
              variant: "outlined",
              fullWidth: true,
              size: "small",
              label: showInputLabel ? "" : label,
              sx: {
                padding: "10px",
                "&.MuiTextField-root .MuiOutlinedInput-root": {
                  backgroundColor: "#F6F6F6",
                  height: "40px",
                  border: "1px #D7D7D7",
                },
                ...sxInput,
              },
              ...inputProps,
            },
          }}
          {...resProps}
        />
        {helperText && (
          <FormHelperText sx={{ color: "error.main" }}>
            {helperText}
          </FormHelperText>
        )}
      </LocalizationProvider>
    </>
  );
};

export default DatePickerComponent;
