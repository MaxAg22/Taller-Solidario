import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrderDetailPage from "@/pages/OrderDetailPage";
import { renderWithProviders } from "@/tests/integration/helpers/render";
import type { Tables } from "@/supabase/supabase";

type OrderRow = Tables<"orders">;
type NotebookRow = Tables<"notebooks">;

const useOrderMock = vi.hoisted(() => vi.fn());
const useAvailableNotebooksMock = vi.hoisted(() => vi.fn());
const useUpdateOrderMock = vi.hoisted(() => vi.fn());
const useChangeOrderStatusMock = vi.hoisted(() => vi.fn());
const useDeleteOrderMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/orders/useOrder", () => ({ useOrder: useOrderMock }));
vi.mock("@/hooks/notebooks/useAvailableNotebooks", () => ({
  useAvailableNotebooks: useAvailableNotebooksMock,
}));
vi.mock("@/hooks/orders/useUpdateOrder", () => ({
  useUpdateOrder: useUpdateOrderMock,
}));
vi.mock("@/hooks/orders/useChangeOrderStatus", () => ({
  useChangeOrderStatus: useChangeOrderStatusMock,
}));
vi.mock("@/hooks/orders/useDeleteOrder", () => ({
  useDeleteOrder: useDeleteOrderMock,
}));

const mutateMock = vi.fn();

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

function makeNotebook(overrides: Partial<NotebookRow> = {}): NotebookRow {
  return {
    id: "nb-1",
    brand: "Dell",
    model: "Latitude 3400",
    serialNumber: 101,
    status: "Donado",
    specs: "Core i5 · 8GB RAM",
    order_id: "ord-1",
    created_at: "2026-01-01T00:00:00.000Z",
    entryDate: null,
    repairHistory: null,
    repairNeeded: null,
    ...overrides,
  };
}

function mockOrder(order: OrderRow, notebooks: NotebookRow[] = []) {
  useOrderMock.mockReturnValue({
    order,
    notebooks,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  useAvailableNotebooksMock.mockReturnValue({ notebooks: [], isLoading: false, isError: false });
  useUpdateOrderMock.mockReturnValue({ mutate: mutateMock, isPending: false });
  useChangeOrderStatusMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  useDeleteOrderMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
}

describe("OrderDetailPage", () => {
  // resetAllMocks limpiaría el factory de vi.mock (devolvería undefined),
  // así que se resetean los mocks de hook manualmente.
  beforeEach(() => {
    useOrderMock.mockReset();
    useAvailableNotebooksMock.mockReset();
    useUpdateOrderMock.mockReset();
    useChangeOrderStatusMock.mockReset();
    useDeleteOrderMock.mockReset();
    mutateMock.mockReset();
  });

  it("En Preparación sin equipos: muestra destinatario como título, estado vacío y botones Editar/Marcar como Donado/Eliminar orden", () => {
    mockOrder(makeOrder(), []);
    renderWithProviders(<OrderDetailPage />, { route: "/ordenes/ord-1" });

    expect(screen.getByRole("heading", { name: "Escuela Ibarzabal" })).toBeInTheDocument();
    expect(screen.getByText("No hay equipos disponibles")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Marcar como Donado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Eliminar orden" })).toBeEnabled();
  });

  it("En Preparación con equipos: muestra las filas de equipos en la tabla", () => {
    mockOrder(
      makeOrder(),
      [makeNotebook(), makeNotebook({ id: "nb-2", brand: "Lenovo", model: "ThinkPad", serialNumber: 202 })],
    );
    renderWithProviders(<OrderDetailPage />, { route: "/ordenes/ord-1" });

    expect(screen.getByText("Dell Latitude 3400")).toBeInTheDocument();
    expect(screen.getByText("Lenovo ThinkPad")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "101" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "202" })).toBeInTheDocument();
    expect(
      screen.getByText((content, el) =>
        el?.tagName === "H2" && /Equipos asociados/.test(el.textContent ?? "") && el.textContent?.includes("(2)"),
      ),
    ).toBeInTheDocument();
  });

  it("Donado: nota roja visible y solo el botón Volver a En Preparación", () => {
    mockOrder(makeOrder({ status: "Donado" }), [makeNotebook()]);
    renderWithProviders(<OrderDetailPage />, { route: "/ordenes/ord-1" });

    const note = screen.getByRole("note");
    expect(note).toHaveClass("orders-locked-note");
    expect(note).toHaveTextContent(/Esta orden está donada/);
    expect(screen.getByRole("button", { name: "Volver a En Preparación" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Marcar como Donado" })).not.toBeInTheDocument();
  });

  it("Donado sin equipos: Eliminar orden deshabilitado y Volver a En Preparación visible", () => {
    mockOrder(makeOrder({ status: "Donado" }), []);
    renderWithProviders(<OrderDetailPage />, { route: "/ordenes/ord-1" });

    // En estado Donado, la única acción visible es "Volver a En Preparación";
    // los botones de edición (incluido "Eliminar orden") no se renderizan.
    expect(screen.getByRole("button", { name: "Volver a En Preparación" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar orden" })).not.toBeInTheDocument();
  });

  it("editar: sin cambios Guardar Cambios deshabilitado; cambiando un campo se habilita", async () => {
    mockOrder(makeOrder(), [makeNotebook()]);
    renderWithProviders(<OrderDetailPage />, { route: "/ordenes/ord-1" });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar" }));

    const save = screen.getByRole("button", { name: "Guardar Cambios" });
    expect(save).toBeDisabled();

    await user.type(screen.getByLabelText("Descripción"), " actualizada");
    expect(save).toBeEnabled();
  });

  it("editar: quitar un equipo Pendiente lo saca de la lista sin abrir el modal de retorno", async () => {
    mockOrder(makeOrder(), [makeNotebook()]);
    const available = makeNotebook({ id: "nb-9", brand: "Lenovo", model: "ThinkPad", serialNumber: 909, status: "Listo para Donar", order_id: null });
    useAvailableNotebooksMock.mockReturnValue({
      notebooks: [available],
      isLoading: false,
      isError: false,
    });
    renderWithProviders(<OrderDetailPage />, { route: "/ordenes/ord-1" });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar" }));

    // Adjuntamos un notebook disponible desde el multiselect (su trigger es un combobox)
    // El trigger del multiselect es un combobox cuyo contenido visible es "Agregar equipo"
    const trigger = screen.getByText("Agregar equipo").closest("button") as HTMLButtonElement;
    await user.click(trigger);
    // El item del menú es un CommandItem de cmdk (role option)
    await user.click(await screen.findByRole("option", { name: /Lenovo ThinkPad · 909/ }));
    // cerramos el popover con Escape (el trigger no es accesible por nombre mientras hay selección)
    await user.keyboard("{Escape}");

    // El notebook aparece ahora en la tabla de equipos asociados; se busca por
    // el serial único para no chocar con la lista de disponibles
    const attachedRow = screen.getByText(String(available.serialNumber)).closest("tr");
    expect(attachedRow).toHaveClass("orders-row-pending");
    const pendingTag = screen.getByText("Pendiente", { exact: false });
    expect(pendingTag).toHaveClass("orders-pending-tag");

    // Lo quitamos: debe desaparecer sin abrir el modal de estado de retorno
    await user.click(screen.getByRole("button", { name: "Quitar equipo 909" }));

    expect(screen.queryByText("Pendiente", { exact: false })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Quitar equipo" })).not.toBeInTheDocument();
  });

  it("editar: quitar un equipo asociado abre el OrderRemoveNotebookModal; confirmar marca la fila Se quitará", async () => {
    mockOrder(makeOrder(), [makeNotebook()]);
    renderWithProviders(<OrderDetailPage />, { route: "/ordenes/ord-1" });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Quitar equipo 101" }));

    expect(await screen.findByRole("heading", { name: "Quitar equipo" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Quitar de la orden" }));

    expect(screen.queryByRole("heading", { name: "Quitar equipo" })).not.toBeInTheDocument();

    const row = screen.getByText("Dell Latitude 3400").closest("tr");
    expect(row).toHaveClass("orders-row-removing");
    expect(screen.getByText("Listo para donar")).toHaveClass("orders-removing-status");

    // La fila "Se quitará" no cuenta como equipo asociado
    expect(
      screen.getByText((content, el) =>
        el?.tagName === "H2" && /Equipos asociados/.test(el.textContent ?? "") && el.textContent?.includes("(0)"),
      ),
    ).toBeInTheDocument();
  });

  it("salir sin guardar: con cambios, Cancelar abre el ConfirmModal Se perderán los cambios", async () => {
    mockOrder(makeOrder(), []);
    renderWithProviders(<OrderDetailPage />, { route: "/ordenes/ord-1" });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.type(screen.getByLabelText("Descripción"), " cambio");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(await screen.findByRole("heading", { name: "Se perderán los cambios" })).toBeInTheDocument();
    expect(
      screen.getByText("Si salís ahora, se descartarán las modificaciones sin guardar."),
    ).toBeInTheDocument();
  });

  it("con isError=true muestra el estado de error y el botón Reintentar", async () => {
    const refetch = vi.fn();
    useOrderMock.mockReturnValue({
      order: undefined,
      notebooks: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    useAvailableNotebooksMock.mockReturnValue({ notebooks: [], isLoading: false, isError: false });
    useUpdateOrderMock.mockReturnValue({ mutate: mutateMock, isPending: false });
    useChangeOrderStatusMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useDeleteOrderMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    renderWithProviders(<OrderDetailPage />, { route: "/ordenes/ord-1" });

    // El contenedor de error tiene role=alert; se verifica el mensaje y el botón
    const errorEl = screen.getByText("Error en la consulta. No se pudo cargar la orden.");
    expect(errorEl.closest('[role="alert"]')).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
