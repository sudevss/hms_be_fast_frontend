export const GENDER_DATA = ["Male", "Female", "Others"].map((val) => ({
  value: val,
  label: val,
}));

export const TOKEN_TYPES = ["Appointment", "Walk-in"].map((val) => ({
  value: val,
  label: val,
}));

export const PAYMENT_METHODS = [
  "Cash",
  "Debit Card",
  "Credit Card",
  "UPI",
  "Net Banking",
].map((val) => ({
  value: val,
  label: val,
}));

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((val) => ({
  value: val,
  label: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
}));

export const TIME_SLOTS_HOURS_OPTIONS = [
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "8pm",
  "9pm",
].map((val) => ({
  value: val,
  label: val,
}));

export const APPOINTMENTS_TABS = ["Scheduled", "Waiting", "Completed"];

export const INITIAL_SHOW_ALERT = {
  show: false,
  message: "",
  status: "",
};
