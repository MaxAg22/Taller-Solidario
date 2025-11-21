import type { Tables } from "@/supabase/supabase";
import type {
  NotebookStatus,
  Notebook,
  Order,
  OrderStatus,
} from "@/interfaces";
type NotebookRow = Tables<"notebooks">;
type OrderRow = Tables<"orders">;

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

export function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    name: row.name ?? "",
    orderNumber: row.orderNumber?.toString() ?? "",
    description: row.description ?? "",
    deadline: row.deadline ?? "",
    totalNotebooks: row.totalNotebooks ?? 0,
    readyNotebooks: row.readyNotebooks ?? 0,
    status: (row.status as OrderStatus) ?? "Pendiente",
  };
}
