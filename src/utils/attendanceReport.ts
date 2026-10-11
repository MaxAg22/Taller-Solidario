import { format, isValid, parseISO } from "date-fns";
import type { AttendanceReportRow, AttendanceUser } from "@/interfaces";

export function isValidReportRange(start: string, end: string) {
  return [start, end].every((value) => {
    const date = parseISO(value);
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(date) && format(date, "yyyy-MM-dd") === value;
  }) && start <= end;
}

export function estimatedHours(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  const hours = Number(normalized);
  return /^(?:\d+|\d*\.\d{1,2})$/.test(normalized) && Number.isFinite(hours) && hours >= 0 && hours <= 24 ? hours : null;
}

export const formatReportHours = (hours: number) => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(hours);

export function attendanceReportRows(users: AttendanceUser[], counts: Record<number, number>, general: string, overrides: Record<number, string>): AttendanceReportRow[] {
  return users.map((user) => {
    const override = overrides[user.id]?.trim();
    const hoursPerDay = estimatedHours(override || general);
    const attendanceDays = counts[user.id] ?? 0;
    return {
      ...user,
      attendanceDays,
      hoursPerDay,
      totalHours: hoursPerDay === null ? null : attendanceDays * Math.round(hoursPerDay * 100) / 100,
    };
  });
}
