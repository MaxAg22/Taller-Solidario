import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderFormModal } from "@/components/orders/OrderFormModal";
import { renderWithProviders } from "@/tests/integration/helpers/render";
import type { Tables } from "@/supabase/supabase";

type OrderRow = Tables<"orders">;

const useCreateOrderMock = vi.hoisted(() => vi.fn());

const mutateRef = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/orders/useCreateOrder", () => ({
  useCreateOrder: (options: { onSuccess?: (order: { id: string }) => void }) => {
    useCreateOrderMock(options);
    const result = useCreateOrderMock.mock.results.at(-1)?.value as
      | { mutate: (payload: unknown) => void; isPending: boolean }
      | undefined;
    return {
      mutate: result?.mutate ?? mutateRef,
      isPending: result?.isPending ?? false,
    };
  },
}));

function mockUseCreateOrder(overrides: { isPending?: boolean } = {}) {
  mutateRef.mockClear();
  useCreateOrderMock.mockReturnValue({ mutate: mutateRef, isPending: overrides.isPending ?? false });
}

function renderModal() {
  return renderWithProviders(
    <OrderFormModal
      onClose={vi.fn()}
      onCreated={vi.fn()}
    />,
  );
}

function createdOnSuccess() {
  const call = useCreateOrderMock.mock.calls.at(-1)?.[0] as
    | { onSuccess?: (order: { id: string }) => void }
    | undefined;
  return call?.onSuccess;
}

const createdOrder: OrderRow = {
  id: "ord-new",
  recipient: "Escuela Ibarzabal",
  deliveryDate: "2026-02-01",
  description: null,
  status: "En Preparación",
  created_at: "2026-01-20T00:00:00.000Z",
};

describe("OrderFormModal", () => {
  beforeEach(() => {
    useCreateOrderMock.mockReset();
    mutateRef.mockClear();
  });

  it("renderiza título, descripción, campos y botones", () => {
    mockUseCreateOrder();
    renderModal();

    expect(screen.getByRole("heading", { name: "Crear orden" })).toBeInTheDocument();
    expect(
      screen.getByText("Registrá el destinatario y la fecha de entrega de la donación."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Destinatario")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha de entrega")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear orden" })).toBeInTheDocument();
  });

  it("con recipient vacío muestra el error de validación y no llama a createOrder", async () => {
    mockUseCreateOrder();
    renderModal();

    await userEvent.click(screen.getByRole("button", { name: "Crear orden" }));

    expect(await screen.findByText("El destinatario es requerido")).toBeInTheDocument();
    expect(mutateRef).not.toHaveBeenCalled();
  });

  it("con fecha vacía muestra el error de validación y no llama a createOrder", async () => {
    mockUseCreateOrder();
    renderModal();
    await userEvent.type(screen.getByLabelText("Destinatario"), "Escuela Ibarzabal");

    await userEvent.click(screen.getByRole("button", { name: "Crear orden" }));

    expect(await screen.findByText("La fecha de entrega es requerida")).toBeInTheDocument();
    expect(mutateRef).not.toHaveBeenCalled();
  });

  it("con datos válidos llama a createOrder con recipient, deliveryDate y description", async () => {
    mockUseCreateOrder();
    renderModal();

    await userEvent.type(screen.getByLabelText("Destinatario"), "Escuela Ibarzabal");
    fireEvent.change(screen.getByLabelText("Fecha de entrega"), { target: { value: "2026-02-01" } });
    await userEvent.type(
      screen.getByLabelText("Descripción"),
      "Equipo para el aula de informática.",
    );

    await userEvent.click(screen.getByRole("button", { name: "Crear orden" }));
    expect(mutateRef).toHaveBeenCalledWith({
      recipient: "Escuela Ibarzabal",
      deliveryDate: "2026-02-01",
      description: "Equipo para el aula de informática.",
    });
  });

  it("con datos válidos y sin descripción llama a createOrder con description null", async () => {
    mockUseCreateOrder();
    renderModal();

    await userEvent.type(screen.getByLabelText("Destinatario"), "Escuela Ibarzabal");
    fireEvent.change(screen.getByLabelText("Fecha de entrega"), { target: { value: "2026-02-01" } });

    await userEvent.click(screen.getByRole("button", { name: "Crear orden" }));

    expect(mutateRef).toHaveBeenCalledWith({
      recipient: "Escuela Ibarzabal",
      deliveryDate: "2026-02-01",
      description: null,
    });
  });

  it("con isPending=true deshabilita el botón submit", () => {
    mockUseCreateOrder({ isPending: true });
    renderModal();

    // Con isPending, el botón incluye un spinner (role=status) cuyo aria-label
    // forma parte del nombre accésible; se busca el botón de submit por su type.
    const submit = screen
      .getAllByText("Crear orden")
      .map((el) => el.closest("button"))
      .find((el) => el?.getAttribute("type") === "submit") as HTMLButtonElement;
    expect(submit).toBeDisabled();
  });

  it("al hacer click en Cancelar llama a onClose", async () => {
    mockUseCreateOrder();
    const onClose = vi.fn();
    renderWithProviders(<OrderFormModal onClose={onClose} onCreated={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("llama a onCreated con el id cuando createOrder tiene éxito", async () => {
    mockUseCreateOrder();
    const onCreated = vi.fn();
    renderWithProviders(<OrderFormModal onClose={vi.fn()} onCreated={onCreated} />);

    await userEvent.type(screen.getByLabelText("Destinatario"), "Escuela Ibarzabal");
    await userEvent.type(screen.getByLabelText("Fecha de entrega"), "2026-02-01");
    await userEvent.click(screen.getByRole("button", { name: "Crear orden" }));

    await waitFor(() => expect(createdOnSuccess()).toBeDefined());
    createdOnSuccess()?.(createdOrder);

    expect(onCreated).toHaveBeenCalledWith("ord-new");
  });
});
