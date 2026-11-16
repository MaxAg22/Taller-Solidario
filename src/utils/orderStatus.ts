import type { OrderStatus } from "@/interfaces";

export const ORDER_STATUSES = [
  { value: "En Preparación", label: "En Preparación", color: "#b45309" },
  { value: "Donado", label: "Donado", color: "#475569" },
] as const satisfies readonly { value: OrderStatus; label: string; color: string }[];
