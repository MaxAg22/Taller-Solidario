import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/shared/table/DataTable";
import { orderNotebookColumns } from "@/components/orders/table/OrderNotebookColumns";
import type { OrderTeam } from "@/interfaces";

function makeTeam(overrides: Partial<OrderTeam> = {}): OrderTeam {
  return {
    id: "nb-1",
    name: "Dell Latitude 3400",
    serialNumber: "SN001",
    status: "Listo para Donar",
    specs: "Core i5 · 8GB RAM",
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
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ id: "nb-1" }));
  });
});
