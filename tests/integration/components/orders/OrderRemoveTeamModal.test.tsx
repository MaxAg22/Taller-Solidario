import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OrderRemoveTeamModal } from "@/components/orders/OrderRemoveTeamModal";
import type { OrderTeam } from "@/interfaces";

const notebook: OrderTeam = {
  id: "nb-1",
  name: "Dell Latitude 3400",
  serialNumber: "SN001",
  status: "Listo para Donar",
  specs: "Core i5 · 8GB RAM",
  pending: null,
  removeStatus: null,
};

function renderWithProps(overrides: Partial<React.ComponentProps<typeof OrderRemoveTeamModal>> = {}) {
  const props = {
    notebook,
    onConfirm: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  const result = render(<OrderRemoveTeamModal {...props} />);
  return { props, ...result };
}

describe("OrderRemoveTeamModal", () => {
  it("renderiza el título y la descripción con el nombre del equipo", () => {
    renderWithProps();

    expect(screen.getByRole("heading", { name: "Quitar equipo" })).toBeInTheDocument();
    expect(
      screen.getByText(/Elegí el estado con el que Dell Latitude 3400 volverá al Inventario/),
    ).toBeInTheDocument();
  });

  it("muestra el Select con el estado por defecto Listo para Donar", () => {
    renderWithProps();

    // El trigger muestra el label del estado ("Listo para donar"), no su value
    expect(screen.getByRole("combobox", { name: "Estado de retorno" })).toHaveTextContent(
      "Listo para donar",
    );
  });

  it('al cambiar el estado y hacer click en "Quitar de la orden" llama a onConfirm con el estado seleccionado', async () => {
    const { props } = renderWithProps();
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox", { name: "Estado de retorno" }));
    await user.click(await screen.findByRole("option", { name: "En reparación" }));
    await user.click(screen.getByRole("button", { name: "Quitar de la orden" }));

    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).toHaveBeenCalledWith("En Reparación");
  });

  it('con el estado por defecto, "Quitar de la orden" llama a onConfirm con Listo para Donar', async () => {
    const { props } = renderWithProps();

    await userEvent.click(screen.getByRole("button", { name: "Quitar de la orden" }));

    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).toHaveBeenCalledWith("Listo para Donar");
  });

  it("al hacer click en Cancelar llama a onClose", async () => {
    const { props } = renderWithProps();

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });
});
