import { formatDeliveryDate } from "@/utils/order";
import { ORDER_STATUSES } from "@/utils/orderStatus";
import { mapNotebook } from "@/utils/notebook";
import { describe, it, expect } from "vitest";

describe("formatDeliveryDate", () => {
  it("formatea una fecha ISO a dd/MM/yyyy", () => {
    expect(formatDeliveryDate("2026-11-16")).toBe("16/11/2026");
  });

  it("devuelve guion si el valor está vacío", () => {
    expect(formatDeliveryDate("")).toBe("—");
  });

  it("devuelve guion si la fecha no es válida", () => {
    expect(formatDeliveryDate("no-fecha")).toBe("—");
  });
});

describe("ORDER_STATUSES", () => {
  it("tiene exactamente dos estados", () => {
    expect(ORDER_STATUSES).toHaveLength(2);
  });

  it("contiene En Preparación y Donado", () => {
    const values = ORDER_STATUSES.map((s) => s.value);
    expect(values).toContain("En Preparación");
    expect(values).toContain("Donado");
  });

  it("cada estado tiene valor, label y color", () => {
    for (const status of ORDER_STATUSES) {
      expect(status.value).toBeTruthy();
      expect(status.label).toBeTruthy();
      expect(status.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("mapNotebook", () => {
  const baseRow = {
    id: "uuid-1",
    serialNumber: 42,
    brand: "Gob. Ed.",
    model: "Juana Manso V3",
    status: "Listo para Donar",
    specs: "Intel Celeron",
    repairNeeded: "",
    repairHistory: "",
    entryDate: "2026-01-01",
    order_id: null as string | null,
  };

  it("mapea order_id a orderId", () => {
    const row = { ...baseRow, order_id: "order-uuid" };
    const result = mapNotebook(row);
    expect(result.orderId).toBe("order-uuid");
  });

  it("order_id null devuelve orderId null", () => {
    const result = mapNotebook(baseRow);
    expect(result.orderId).toBeNull();
  });

  it("convierte serialNumber a string", () => {
    const result = mapNotebook(baseRow);
    expect(result.serialNumber).toBe("42");
  });

  it("campos nulos devuelven string vacío", () => {
    const row = { ...baseRow, brand: null, model: null, specs: null };
    const result = mapNotebook(row);
    expect(result.brand).toBe("");
    expect(result.model).toBe("");
    expect(result.specs).toBe("");
  });
});
