import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { AttendanceRow } from "@/interfaces";
import type { DataTableFeatures } from "@/components/notebooks/table/data-table-features";
import { AttendanceCell } from "./AttendanceCell";
import { UserActions } from "./UserActions";
import { attendanceDate } from "@/utils/attendance";

const helper = createColumnHelper<DataTableFeatures, AttendanceRow>();
const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];

export function attendanceColumns(week: Date[], selectedDate: Date, onSelect: (date: Date) => void) {
  const selected = attendanceDate(selectedDate);
  return helper.columns([
    helper.accessor("name", {
      header: "Alumno",
      cell: ({ row }) => (
        <div className="attendance-user-cell">
          <span>{row.original.name}</span>
          <UserActions key={row.original.id} id={row.original.id} name={row.original.name} />
        </div>
      ),
    }),
    ...week.map((day, index) => {
      const date = attendanceDate(day);
      return helper.display({
        id: `day-${date}`,
        header: () => (
          <button type="button" className="attendance-day-heading" data-selected={date === selected} aria-pressed={date === selected} aria-label={format(day, "EEEE d 'de' MMMM yyyy", { locale: es })} title={format(day, "EEEE d 'de' MMMM", { locale: es })} onClick={() => onSelect(day)}>
            <span>{dayLabels[index]}</span>
            <span>{format(day, "dd/MM")}</span>
          </button>
        ),
        cell: ({ row }) => (
          <AttendanceCell
            key={JSON.stringify([row.original.id, date])}
            id={row.original.id}
            name={row.original.name}
            date={date}
            checked={row.original.attendance[date] ?? false}
            disabled={row.original.attendanceDisabled}
            selected={date === selected}
          />
        ),
      });
    }),
  ]);
}
