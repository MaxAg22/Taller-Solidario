import { useSaveAttendance } from "@/hooks";
import type { AttendanceUser } from "@/interfaces";

interface AttendanceCellProps {
  id: AttendanceUser["id"];
  name: string;
  date: string;
  checked: boolean;
  disabled: boolean;
  selected: boolean;
}

export function AttendanceCell({ id, name, date, checked, disabled, selected }: AttendanceCellProps) {
  const { mutate, isPending } = useSaveAttendance();
  return (
    <div className="attendance-day-cell" data-selected={selected} aria-busy={isPending}>
      <input
        type="checkbox"
        className="attendance-checkbox"
        aria-label={`Asistencia de ${name} el ${date}`}
        checked={checked}
        disabled={disabled || isPending}
        onChange={(event) => mutate({ id, date, is_present: event.target.checked })}
      />
    </div>
  );
}
