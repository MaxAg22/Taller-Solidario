import { addDays, format, startOfWeek } from "date-fns";

export function getAttendanceWeek(selectedDate: Date) {
  const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function attendanceDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}
