import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Search } from "lucide-react";
import { useAttendances, useUsers } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/notebooks/table/DataTable";
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";
import { attendanceColumns } from "@/components/attendance/AttendanceColumns";
import { UserFormModal } from "@/components/attendance/UserFormModal";
import { attendanceDate, getAttendanceWeek } from "@/utils/attendance";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const from = pagination.pageIndex * pagination.pageSize;
  const usersQuery = useUsers(from, from + pagination.pageSize - 1, search);
  const users = usersQuery.data?.users ?? [];
  const rowCount = usersQuery.data?.rowCount ?? 0;
  const week = useMemo(() => getAttendanceWeek(selectedDate), [selectedDate]);
  const recordsQuery = useAttendances(attendanceDate(week[0]), attendanceDate(week[6]), users.map((user) => user.id));
  const columns = useMemo(() => attendanceColumns(week, selectedDate, setSelectedDate), [week, selectedDate]);
  const rows = users.map((user) => ({
    ...user,
    attendance: Object.fromEntries((recordsQuery.data ?? [])
      .filter((record) => record.id === user.id)
      .map((record) => [record.date, true])),
    attendanceDisabled: recordsQuery.isLoading || recordsQuery.isError,
  }));

  if (usersQuery.data && pagination.pageIndex > 0 && from >= rowCount) {
    setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, Math.ceil(rowCount / prev.pageSize) - 1) }));
  }

  return (
    <div className="attendance-page">
      <div className="inventory-heading">
        <h1>Asistencias</h1>
        <Button className="inventory-add" onClick={() => setIsCreating(true)}>
          <Plus aria-hidden="true" /> Agregar alumno
        </Button>
      </div>
      <div className="attendance-layout">
        <AttendanceCalendar selectedDate={selectedDate} week={week} onSelect={setSelectedDate} />
        <section className="attendance-register" aria-label="Planilla semanal de asistencias">
          <div className="attendance-week-label">
            <h2>Asistencia semanal</h2>
            <p>{format(week[0], "d MMM", { locale: es })} – {format(week[6], "d MMM yyyy", { locale: es })}</p>
          </div>
          <div className="inventory-toolbar attendance-toolbar">
            <div className="inventory-search">
              <Search aria-hidden="true" />
              <Input
                aria-label="Buscar alumno por nombre"
                placeholder="Buscar alumno por nombre…"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
              />
            </div>
            <p className="inventory-results" role="status">
              {usersQuery.isLoading ? "Cargando alumnos…" : usersQuery.isError ? "" : `${users.length} de ${rowCount} alumnos`}
            </p>
          </div>
          {(usersQuery.isError || recordsQuery.isError) && (
            <div className="attendance-feedback" role="alert">
              <p>{usersQuery.isError ? "No se pudo cargar la lista de alumnos." : "No se pudo cargar la asistencia de esta semana."}</p>
              <Button variant="outline" size="sm" onClick={() => {
                if (usersQuery.isError) void usersQuery.refetch();
                if (recordsQuery.isError) void recordsQuery.refetch();
              }}>Reintentar</Button>
            </div>
          )}
          <div className="inventory-table-section attendance-table" aria-busy={usersQuery.isLoading || recordsQuery.isLoading}>
            <DataTable
              columns={columns}
              data={rows}
              pagination={pagination}
              setPagination={setPagination}
              rowCount={rowCount}
              isLoading={usersQuery.isLoading}
              emptyMessage={usersQuery.isError ? "La lista de alumnos no está disponible." : search.trim() ? "No hay alumnos que coincidan con la búsqueda." : "No hay alumnos registrados."}
            />
          </div>
        </section>
      </div>
      {isCreating && <UserFormModal onClose={() => setIsCreating(false)} />}
    </div>
  );
}
