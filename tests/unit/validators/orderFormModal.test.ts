import { orderFormSchema } from "@/validators/orderFormModal.validator";
import { notebookFormSchema } from "@/validators/notebookFormModal.validator";
import { describe, it, expect } from "vitest";

describe("orderFormSchema", () => {
  it("rechaza recipient vacío", () => {
    const result = orderFormSchema.safeParse({
      recipient: "",
      deliveryDate: "2026-11-16",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza deliveryDate vacío", () => {
    const result = orderFormSchema.safeParse({
      recipient: "Escuela Ibarzabal",
      deliveryDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("acepta datos válidos sin descripción", () => {
    const result = orderFormSchema.safeParse({
      recipient: "Escuela Ibarzabal",
      deliveryDate: "2026-11-16",
    });
    expect(result.success).toBe(true);
  });

  it("acepta datos válidos con descripción", () => {
    const result = orderFormSchema.safeParse({
      recipient: "Escuela Ibarzabal",
      deliveryDate: "2026-11-16",
      description: "Equipamiento para el aula",
    });
    expect(result.success).toBe(true);
  });
});

describe("notebookFormSchema", () => {
  it("rechaza model vacío", () => {
    const result = notebookFormSchema.safeParse({
      model: "",
      status: "Recibido",
    });
    expect(result.success).toBe(false);
  });

  it("acepta datos válidos", () => {
    const result = notebookFormSchema.safeParse({
      model: "Juana Manso V3",
      brand: "Gob. Ed.",
      status: "Recibido",
    });
    expect(result.success).toBe(true);
  });
});
