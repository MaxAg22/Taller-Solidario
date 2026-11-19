import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FormModal } from "@/components/shared/FormModal";

const defaultProps = {
  contentClassName: "test-form-modal",
  title: "Título del modal",
  description: "Descripción del modal",
  isPending: false,
  submitLabel: "Enviar",
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  children: <p>Contenido del formulario</p>,
} as const;

function renderWithProps(overrides: Partial<React.ComponentProps<typeof FormModal>> = {}) {
  const props = { ...defaultProps, ...overrides };
  const result = render(<FormModal {...props} />);
  return { props, ...result };
}

describe("FormModal", () => {
  it("renderiza título, descripción, botón X, children y botones Cancelar/submit", () => {
    renderWithProps();

    expect(screen.getByRole("heading", { name: "Título del modal" })).toBeInTheDocument();
    expect(screen.getByText("Descripción del modal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar formulario" })).toBeInTheDocument();
    expect(screen.getByText("Contenido del formulario")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("con isPending=true deshabilita el botón submit y muestra un spinner", () => {
    const { container } = renderWithProps({ isPending: true });

    const submit = screen.getByRole("button", { name: /Enviar/ });
    expect(submit).toBeDisabled();
    // El Spinner del FormModal es un svg dentro del botón submit
    expect(submit.querySelector("svg")).not.toBeNull();
    void container;
  });

  it("muestra el submitLabel como texto del botón submit", () => {
    renderWithProps({ submitLabel: "Crear registro" });

    expect(screen.getByRole("button", { name: "Crear registro" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enviar" })).not.toBeInTheDocument();
  });

  it("al hacer click en el botón X llama a onClose", async () => {
    const { props } = renderWithProps();

    await userEvent.click(screen.getByRole("button", { name: "Cerrar formulario" }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("al hacer click en Cancelar llama a onClose", async () => {
    const { props } = renderWithProps();

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("al enviar el form llama a onSubmit", async () => {
    const { props } = renderWithProps();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Enviar/ }));
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    // onSubmit recibe un SyntheticEvent de React (no un Event nativo de DOM)
    expect(
      (props.onSubmit as ReturnType<typeof vi.fn>).mock.calls[0][0].type,
    ).toBe("submit");
  });
});
