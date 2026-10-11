import { useQuery } from "@tanstack/react-query";
import { getAttendanceReportCounts, getAttendanceReportUsers } from "@/actions";
import { isValidReportRange } from "@/utils/attendanceReport";

export function useAttendanceReport(start: string, end: string) {
  const usersQuery = useQuery({
    queryKey: ["users", "report"],
    queryFn: ({ signal }) => getAttendanceReportUsers(signal),
  });
  const attendanceQuery = useQuery({
    queryKey: ["attendances", "report", start, end],
    queryFn: ({ signal }) => getAttendanceReportCounts(start, end, signal),
    enabled: isValidReportRange(start, end),
  });
  return { usersQuery, attendanceQuery };
}
