import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatDeliveryDate(value: string): string {
  if (!value) return "—";

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "—";

  return format(date, "dd/MM/yyyy", { locale: es });
}
