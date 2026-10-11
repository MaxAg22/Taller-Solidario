import { es } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";

export function AttendanceCalendar({ selectedDate, week, onSelect }: {
  selectedDate: Date;
  week: Date[];
  onSelect: (date: Date) => void;
}) {
  return (
    <aside className="attendance-calendar-panel" aria-label="Calendario de asistencias">
      <Calendar
        mode="single"
        required
        locale={es}
        weekStartsOn={1}
        selected={selectedDate}
        onSelect={onSelect}
        modifiers={{ attendanceWeek: week }}
        modifiersClassNames={{ attendanceWeek: "attendance-calendar-week" }}
        className="attendance-calendar"
      />
      <p className="attendance-calendar-hint">Elegí un día para ver su semana.</p>
    </aside>
  );
}
