import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrdersPage from "@/pages/OrdersPage";
import { renderWithProviders } from "@/tests/integration/helpers/render";
import type { Tables } from "@/supabase/supabase";

type OrderRow = Tables<"orders">;

const useOrdersMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks")>();
  return { ...actual, useOrders: useOrdersMock };
});

function mockUseOrders(overrides: Partial<ReturnType<typeof baseUseOrders>> = {}) {
  useOrdersMock.mockReturnValue({ ...baseUseOrders(), ...overrides });
}

function baseUseOrders() {
  return {
    orders: [] as OrderRow[],
    rowCount: 0,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  };
}

function makeOrder(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    id: "ord-1",
    recipient: "Escuela Ibarzabal",
    deliveryDate: "2026-01-15",
    description: null,
    status: "En Preparación",
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("OrdersPage", () => {
  beforeEach(() => {
    useOrdersMock.mockReset();
  });

  it("renderiza título, botón Crear orden y campos de búsqueda/filtros", () => {
    mockUseOrders();
    renderWithProviders(<OrdersPage />);

    expect(screen.getByRole("heading", { name: "Órdenes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Crear orden/ })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar órdenes por destinatario" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filtrar por estado" })).toBeInTheDocument();
    // Los inputs de fecha (type=date) no exponen role textbox en jsdom; se buscan por label
    expect(screen.getByLabelText("Filtrar por fecha de entrega desde")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por fecha de entrega hasta")).toBeInTheDocument();
  });

  it("con isLoading=true muestra Cargando órdenes…", () => {
    mockUseOrders({ isLoading: true });
    renderWithProviders(<OrdersPage />);

    expect(screen.getByText("Cargando órdenes…")).toBeInTheDocument();
  });

  it("con isError=true muestra el mensaje de error y el botón Reintentar", async () => {
    const refetch = vi.fn();
    mockUseOrders({ isError: true, refetch });
    renderWithProviders(<OrdersPage />);

    expect(
      screen.getByText("No se pudo cargar la lista de órdenes."),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin filtros y sin órdenes muestra "No hay órdenes disponibles"', () => {
    mockUseOrders();
    renderWithProviders(<OrdersPage />);

    expect(screen.getByText("No hay órdenes disponibles")).toBeInTheDocument();
  });

  it('con filtros y sin resultados muestra "No se encontraron resultados"', async () => {
    mockUseOrders();
    renderWithProviders(<OrdersPage />);

    const user = userEvent.setup();
    await user.type(
      screen.getByRole("textbox", { name: "Buscar órdenes por destinatario" }),
      "inexistente",
    );

    expect(await screen.findByText("No se encontraron resultados")).toBeInTheDocument();
  });

  it("con datos muestra las filas y el conteo de órdenes", () => {
    mockUseOrders({
      orders: [makeOrder(), makeOrder({ id: "ord-2", recipient: "Club Atlético" })],
      rowCount: 2,
    });
    renderWithProviders(<OrdersPage />);

    expect(screen.getByText("Escuela Ibarzabal")).toBeInTheDocument();
    expect(screen.getByText("Club Atlético")).toBeInTheDocument();
    expect(screen.getByText("2 de 2 órdenes")).toBeInTheDocument();
  });

  it('al hacer click en "Crear orden" renderiza el OrderFormModal', async () => {
    mockUseOrders();
    renderWithProviders(<OrdersPage />);

    expect(screen.queryByRole("heading", { name: "Crear orden" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Crear orden/ }));

    expect(await screen.findByRole("heading", { name: "Crear orden" })).toBeInTheDocument();
  });
});
