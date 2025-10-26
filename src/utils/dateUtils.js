import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function convertUTCClockToIST(timeStr) {
  // Parse time in UTC base (assuming AM/PM)
  const date = dayjs(`1970-01-01 ${timeStr}`, "YYYY-MM-DD hh:mm A");
  return date.add(5, "hour").add(30, "minute").format("hh:mm A");
}

export { dayjs, convertUTCClockToIST };