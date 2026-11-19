import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

const defaultProps = {
  id: "nb-1",
  onConfirm: vi.fn(),
  onClose: vi.fn(),
  confirmLabel: "Eliminar",
  title: "Eliminar equipo",
  description: "Esta acción no se puede deshacer.",
  isPending: false,
} as const;

describe("ConfirmModal", () => {
  it("no renderiza nada si id está vacío", () => {
    const { container } = renderWithProps({ ...defaultProps, id: "" });

    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza título, descripción y botones", () => {
    renderWithProps(defaultProps);

    expect(screen.getByRole("heading", { name: "Eliminar equipo" })).toBeInTheDocument();
    expect(screen.getByText("Esta acción no se puede deshacer.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeInTheDocument();
  });

  it("usa la clase destructive en el botón de confirmación cuando destructive=true", async () => {
    renderWithProps({ ...defaultProps, destructive: true });

    const confirm = screen.getByRole("button", { name: "Eliminar" });
    expect(confirm.className).toContain("destructive");

    await userEvent.click(confirm);
    expect(defaultProps.onConfirm).toHaveBeenCalledWith("nb-1");
  });

  it("usa el variant default (bg-primary) en el botón de confirmación cuando destructive=false", () => {
    renderWithProps(defaultProps);

    const confirm = screen.getByRole("button", { name: "Eliminar" });
    // El variant "default" del shadcn Button aplica bg-primary (el variant destructive aplica bg-destructive)
    expect(confirm.className).toContain("bg-primary");
    expect(confirm.className).not.toContain("bg-destructive");
  });

  it("con isPending=true deshabilita los botones y muestra el texto Procesando…", () => {
    renderWithProps({ ...defaultProps, isPending: true });

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Procesando…" })).toBeDisabled();
  });

  it("al hacer click en confirm llama a onConfirm con el id", async () => {
    renderWithProps(defaultProps);

    await userEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).toHaveBeenCalledWith("nb-1");
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("al hacer click en Cancelar llama a onClose", async () => {
    renderWithProps(defaultProps);

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it("muestra un confirmLabel custom en el botón de confirmación", () => {
    renderWithProps({ ...defaultProps, confirmLabel: "Guardar cambios" });

    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
  });
});

function renderWithProps(props: React.ComponentProps<typeof ConfirmModal>) {
  return render(<ConfirmModal {...props} />);
}
