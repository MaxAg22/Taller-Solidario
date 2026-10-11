import type { NotebookStatus } from "@/interfaces";

export const NOTEBOOK_STATUSES = [
  { value: "Listo para Donar", label: "Listo para donar", color: "#00d587" },
  { value: "Recibido", label: "Recibido", color: "#60a5fa" },
  { value: "Instalar SO", label: "Instalar SO", color: "#a78bfa" },
  { value: "En Reparación", label: "En reparación", color: "#fb923c" },
  { value: "Bloqueada", label: "Bloqueada", color: "#ff3654" },
  { value: "Donado", label: "Donado", color: "#94a3b8" },
] as const satisfies readonly { value: NotebookStatus; label: string; color: string }[];
