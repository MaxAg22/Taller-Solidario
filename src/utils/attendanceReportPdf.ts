import { format, parseISO } from "date-fns";
import type { AttendanceReportRow } from "@/interfaces";
import { formatReportHours, isValidReportRange } from "./attendanceReport";

export async function downloadAttendanceReport(rows: AttendanceReportRow[], start: string, end: string) {
  if (!isValidReportRange(start, end) || !rows.length || rows.some((row) => row.hoursPerDay === null || row.totalHours === null)) {
    throw new Error("Completá el período y las horas estimadas antes de generar el reporte.");
  }
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF();
  const period = `${format(parseISO(start), "dd/MM/yyyy")} al ${format(parseISO(end), "dd/MM/yyyy")}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("Taller Solidario", 14, 17);
  doc.setFontSize(12);
  doc.text("Reporte de asistencia y horas estimadas", 14, 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Período: ${period} (ambas fechas incluidas)`, 14, 33);
  doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 39);
  autoTable(doc, {
    startY: 46,
    head: [["Alumno", "Días asistidos", "Horas estimadas\npor día", "Horas totales\nestimadas"]],
    body: rows.map((row) => [row.name, String(row.attendanceDays), formatReportHours(row.hoursPerDay!), formatReportHours(row.totalHours!)]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 10, cellPadding: 3, textColor: [30, 41, 59], lineColor: [223, 227, 232], lineWidth: 0.15, overflow: "linebreak" },
    headStyles: { fillColor: [241, 243, 246], textColor: [30, 41, 59], fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 82 }, 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
    margin: { top: 20, right: 14, bottom: 22, left: 14 },
    rowPageBreak: "avoid",
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Taller Solidario · Asistencias · ${period}`, 14, 12);
      }
    },
  });
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Página ${page} de ${pages}`, 196, 291, { align: "right" });
  }
  doc.save(`asistencias_${start}_${end}.pdf`);
}
