import type { Tables } from "@/supabase/supabase";
import type { NotebookStatus, Notebook } from "@/interfaces";
type NotebookRow = Tables<"notebooks">;

export function mapNotebook(row: NotebookRow): Notebook {
  return {
    id: row.id,
    serialNumber: row.serialNumber?.toString() ?? "",
    brand: row.brand ?? "",
    model: row.model ?? "",
    status: (row.status as NotebookStatus) ?? "Recibido",
    specs: row.specs ?? "",
    repairNeeded: row.repairNeeded ?? "",
    repairHistory: row.repairHistory ?? "",
    entryDate: row.entryDate ?? "",
  };
}
