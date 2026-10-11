import type { Tables } from "@/supabase/supabase";

export interface AttendanceUser {
  id: Tables<"users">["id"];
  name: string;
}

export interface AttendanceRecord {
  id: AttendanceUser["id"];
  date: string;
}

export interface AttendanceChange extends AttendanceRecord {
  is_present: boolean;
}

export interface AttendanceRow extends AttendanceUser {
  attendance: Record<string, boolean>;
  attendanceDisabled: boolean;
}
