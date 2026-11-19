import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { orderColumns } from "@/components/orders/table/OrderColumns";
import { DataTable } from "@/components/shared/table/DataTable";
import type { Tables } from "@/supabase/supabase";

type OrderRow = Tables<"orders">;

function makeOrder(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    id: "ord-1",
    recipient: "Escuela Ibarzabal",
    deliveryDate: "2026-01-15",
    description: "Equipo para el aula",
    status: "En Preparación",
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("orderColumns", () => {
  it("tiene exactamente 3 columnas: Destinatario, Fecha de entrega, Estado", () => {
    render(<DataTable columns={orderColumns} data={[makeOrder()]} />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual([
      "Destinatario",
      "Fecha de entrega",
      "Estado",
    ]);
  });

  it("formatea la fecha de entrega con formatDeliveryDate", () => {
    render(<DataTable columns={orderColumns} data={[makeOrder()]} />);

    expect(screen.getByText("15/01/2026")).toBeInTheDocument();
  });

  it("renderiza el valor del destinatario", () => {
    render(<DataTable columns={orderColumns} data={[makeOrder()]} />);

    expect(screen.getByRole("cell", { name: "Escuela Ibarzabal" })).toBeInTheDocument();
  });
});
