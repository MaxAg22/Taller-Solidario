import { useState } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { FileDown } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAttendanceReport } from "@/hooks/attendance/useAttendanceReport";
import { attendanceDate } from "@/utils/attendance";
import { attendanceReportRows, estimatedHours, formatReportHours, isValidReportRange } from "@/utils/attendanceReport";
import { downloadAttendanceReport } from "@/utils/attendanceReportPdf";

export function AttendanceReportModal({ selectedDate, onClose }: { selectedDate: Date; onClose: () => void }) {
  const [start, setStart] = useState(() => attendanceDate(startOfMonth(selectedDate)));
  const [end, setEnd] = useState(() => attendanceDate(endOfMonth(selectedDate)));
  const [general, setGeneral] = useState("2");
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { usersQuery, attendanceQuery } = useAttendanceReport(start, end);
  const validRange = isValidReportRange(start, end);
  const invalidGeneral = Boolean(general.trim()) && estimatedHours(general) === null;
  const ready = validRange && usersQuery.isSuccess && attendanceQuery.isSuccess && !usersQuery.isFetching && !attendanceQuery.isFetching;
  const rows = attendanceReportRows(usersQuery.data ?? [], attendanceQuery.data ?? {}, general, overrides);
  const missingHours = rows.some((row) => row.hoursPerDay === null);
  const canGenerate = ready && rows.length > 0 && !missingHours && !invalidGeneral && !isGenerating;

  async function generate() {
    if (!canGenerate) return;
    setIsGenerating(true);
    try {
      await downloadAttendanceReport(rows, start, end);
      toast.success("Reporte generado correctamente");
    } catch {
      toast.error("No se pudo generar el PDF. Intentá nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !isGenerating) onClose(); }}>
      <DialogContent className="attendance-report-modal" showCloseButton={!isGenerating}>
        <DialogHeader>
          <DialogTitle>Generar reporte de asistencia</DialogTitle>
          <DialogDescription>Calculá las horas estimadas a partir de los días de asistencia del período.</DialogDescription>
        </DialogHeader>
        <div className="attendance-report-controls">
          <div>
            <Label htmlFor="report-start">Desde</Label>
            <Input id="report-start" type="date" value={start} max={end || undefined} disabled={isGenerating} onChange={(event) => setStart(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="report-end">Hasta</Label>
            <Input id="report-end" type="date" value={end} min={start || undefined} disabled={isGenerating} onChange={(event) => setEnd(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="report-general">Horas estimadas por día — general</Label>
            <Input id="report-general" type="number" min="0" max="24" step="0.01" placeholder="Ej: 3" value={general} aria-invalid={invalidGeneral} disabled={isGenerating} onChange={(event) => setGeneral(event.target.value)} />
          </div>
        </div>
        <p className="attendance-report-hint">Ambas fechas están incluidas. Un estimado individual reemplaza al general; dejalo vacío para usar el general.</p>
        {!validRange && <p className="attendance-report-error" role="alert">Ingresá un rango válido: la fecha inicial debe ser anterior o igual a la final.</p>}
        {invalidGeneral && <p className="attendance-report-error" role="alert">Ingresá entre 0 y 24 horas por día, con hasta dos decimales.</p>}
        {(usersQuery.isError || attendanceQuery.isError) && (
          <div className="attendance-feedback" role="alert">
            <p>No se pudo cargar la información completa del reporte.</p>
            <Button variant="outline" size="sm" onClick={() => {
              if (usersQuery.isError) void usersQuery.refetch();
              if (attendanceQuery.isError) void attendanceQuery.refetch();
            }}>Reintentar</Button>
          </div>
        )}
        <div className="attendance-report-table inventory-table-panel" aria-busy={usersQuery.isFetching || attendanceQuery.isFetching}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Días asistidos</TableHead>
                <TableHead>Horas estimadas por día</TableHead>
                <TableHead>Horas totales estimadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const value = overrides[row.id] ?? "";
                const invalid = Boolean(value.trim()) && estimatedHours(value) === null;
                return (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{ready ? row.attendanceDays : "—"}</TableCell>
                    <TableCell>
                      <Input type="number" min="0" max="24" step="0.01" aria-label={`Horas por día de ${row.name}`} aria-invalid={invalid} disabled={isGenerating} value={value} placeholder={estimatedHours(general) === null ? "Sin estimar" : general} onChange={(event) => setOverrides((prev) => ({ ...prev, [row.id]: event.target.value }))} />
                    </TableCell>
                    <TableCell>{ready && row.totalHours !== null ? `${row.attendanceDays} × ${formatReportHours(row.hoursPerDay!)} = ${formatReportHours(row.totalHours)} h` : "—"}</TableCell>
                  </TableRow>
                );
              })}
              {!rows.length && <TableRow><TableCell colSpan={4} className="inventory-table-empty">{usersQuery.isLoading ? "Cargando alumnos…" : usersQuery.isError ? "La lista de alumnos no está disponible." : "No hay alumnos registrados."}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="attendance-report-footer">
          <p role="status">{ready ? `${rows.length} alumnos${missingHours ? " · Completá las horas generales o individuales." : ""}` : validRange && !usersQuery.isError && !attendanceQuery.isError ? "Cargando asistencias del período…" : ""}</p>
          <Button type="button" variant="outline" disabled={isGenerating} onClick={onClose}>Cancelar</Button>
          <Button type="button" disabled={!canGenerate} onClick={() => void generate()}><FileDown size={16} aria-hidden="true" />{isGenerating ? "Generando…" : "Generar PDF"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
