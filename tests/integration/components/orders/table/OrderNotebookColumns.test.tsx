import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/shared/table/DataTable";
import { orderNotebookColumns } from "@/components/orders/table/OrderNotebookColumns";
import type { OrderNotebookRow, Notebook } from "@/interfaces";

function makeNotebook(overrides: Partial<Notebook> = {}): Notebook {
  return {
    id: "nb-1",
    serialNumber: "SN001",
    brand: "Dell",
    model: "Latitude 3400",
    status: "Listo para Donar",
    specs: "Core i5 · 8GB RAM",
    repairNeeded: "",
    repairHistory: "",
    entryDate: "2026-01-01",
    orderId: null,
    ...overrides,
  };
}

function makeTeam(overrides: Partial<OrderNotebookRow> = {}): OrderNotebookRow {
  const notebook = makeNotebook();
  return {
    notebook,
    name: `${notebook.brand} ${notebook.model}`,
    pending: null,
    removeStatus: null,
    ...overrides,
  };
}

describe("orderNotebookColumns", () => {
  it("tiene exactamente 5 columnas: Nombre de equipo, N.° de Serie, Estado, Especificaciones, Acciones", () => {
    render(<DataTable columns={orderNotebookColumns()} data={[makeTeam()]} />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual([
      "Nombre de equipo",
      "N.° de Serie",
      "Estado",
      "Especificaciones",
      "Acciones",
    ]);
  });

  it("fila normal: el estado muestra la clase inventory-table-status", () => {
    render(<DataTable columns={orderNotebookColumns()} data={[makeTeam()]} />);

    const status = screen.getByText("Listo para Donar");
    expect(status).toHaveClass("inventory-table-status");
    expect(status).toHaveAttribute("data-status", "Listo para Donar");
  });

  it('fila "Se quitará" con removeStatus: muestra el label del estado de retorno con la clase orders-removing-status', () => {
    render(
      <DataTable
        columns={orderNotebookColumns()}
        data={[makeTeam({ pending: "Se quitará", removeStatus: "Bloqueada" })]}
      />,
    );

    const status = screen.getByText("Bloqueada");
    expect(status).toHaveClass("orders-removing-status");
    expect(screen.queryByText("Listo para Donar")).not.toBeInTheDocument();
  });

  it('fila "Pendiente": el nombre incluye la etiqueta Pendiente con la clase orders-pending-tag', () => {
    render(<DataTable columns={orderNotebookColumns()} data={[makeTeam({ pending: "Pendiente" })]} />);

    const tag = screen.getByText("Pendiente");
    expect(tag).toHaveClass("orders-pending-tag");
  });

  it("sin onRemove: el botón de acciones está deshabilitado con el title de modo edición", () => {
    render(<DataTable columns={orderNotebookColumns()} data={[makeTeam()]} />);

    const button = screen.getByRole("button", { name: "Quitar equipo SN001" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("title", "Quitar de la orden (solo disponible en modo edición)");
  });

  it("con onRemove: el botón está habilitado y al hacer click llama a onRemove con la fila", async () => {
    const onRemove = vi.fn();
    render(<DataTable columns={orderNotebookColumns(onRemove)} data={[makeTeam()]} />);

    const button = screen.getByRole("button", { name: "Quitar equipo SN001" });
    expect(button).toBeEnabled();

    await userEvent.click(button);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ notebook: expect.objectContaining({ id: "nb-1" }) }));
  });
});
