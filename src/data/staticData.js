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
  "9:15am",
  "9:30am",
  "9:45am",
  "10am",
  "10:15am",
  "10:30am",
  "10:45am",
  "11am",
  "11:15am",
  "11:30am",
  "11:45am",
  "12pm",
  "12:15pm",
  "12:30pm",
  "12:45pm",
  "1pm",
  "1:15pm",
  "1:30pm",
  "1:45pm",
  "2pm",
  "2:15pm",
  "2:30pm",
  "2:45pm",
  "3pm",
  "3:15pm",
  "3:30pm",
  "3:45pm",
  "4pm",
  "4:15pm",
  "4:30pm",
  "4:45pm",
  "5pm",
  "5:15pm",
  "5:30pm",
  "5:45pm",
  "6pm",
  "6:15pm",
  "6:30pm",
  "6:45pm",
  "7pm",
  "7:15pm",
  "7:30pm",
  "7:45pm",
  "8pm",
  "8:15pm",
  "8:30pm",
  "8:45pm",
  "9pm",
  "9:15pm",
  "9:30pm",
  "9:45pm",
  "10pm",
].map((val) => ({
  value: val,
  label: val,
}));

export const DOCTOR_SHEDULE_SLOTS_OPTIONS = [
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
  "10pm",
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

// Ordered ascending by academic level (undergraduate → postgraduate → super-speciality).
// IMPORTANT: This array doubles as the MUI Autocomplete options list in AddDoctor.jsx.
// Do NOT add non-displayable rank markers — they would appear as dropdown suggestions.
export const QUALIFICATION_HIERARCHY = [
  "MBBS", "BDS", "BAMS", "BHMS", "BUMS",
  "MD", "MS", "DNB", "DM", "MCh",
  "MDS", "MPhil", "PhD",
  "FCPS", "MRCP", "FRCS",
  "Fellowship",
];

/**
 * Sorts a comma-separated qualification string by academic hierarchy.
 * Returns null if input is empty/null/whitespace-only (caller shows "Enter details").
 * Unknown qualifications (free-text entries not in QUALIFICATION_HIERARCHY) are
 * appended after known degrees, preserving their relative order.
 *
 * @param {string|null|undefined} str - e.g. "MS,MBBS"  or  "PhD,CustomDeg,MBBS"
 * @returns {string|null}   - e.g. "MBBS, MS" or  "MBBS, PhD, CustomDeg"
 *
 * @example
 * sortQualifications("MS,MBBS")        // → "MBBS, MS"
 * sortQualifications("PhD,MBBS,MS")    // → "MBBS, MS, PhD"
 * sortQualifications("")               // → null
 * sortQualifications(",")              // → null
 * sortQualifications(null)             // → null
 */
export const sortQualifications = (str) => {
  if (!str) return null;
  const parts = str.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const sorted = [...parts].sort((a, b) => {
    const ai = QUALIFICATION_HIERARCHY.indexOf(a);
    const bi = QUALIFICATION_HIERARCHY.indexOf(b);
    const aRank = ai === -1 ? Infinity : ai;
    const bRank = bi === -1 ? Infinity : bi;
    return aRank - bRank || parts.indexOf(a) - parts.indexOf(b);
  });
  return sorted.join(", ");
};
