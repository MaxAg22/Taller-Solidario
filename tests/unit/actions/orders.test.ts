import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockSupabaseClient, createSupabaseMock } from "../supabase/mock";

let sandbox: ReturnType<typeof createSupabaseMock>;

beforeEach(() => {
  vi.resetModules();
  sandbox = mockSupabaseClient();
});

async function loadActions() {
  return import("@/actions/orders");
}

describe("getOrders", () => {
  it("sin filtros, consulta orders con orden y rango", async () => {
    sandbox.queueResult({ data: [{ id: "1", recipient: "Escuela" }], error: null, count: 1 });
    const { getOrders } = await loadActions();

    const result = await getOrders(0, 13, "");

    expect(result.rowCount).toBe(1);
    expect(sandbox.fromCalls[0].table).toBe("orders");
    const q = sandbox.fromCalls[0].query;
    expect(q.select).toBeDefined();
    expect(q.order).toEqual(["deliveryDate", { ascending: false }]);
    expect(q.range).toEqual([0, 13]);
  });

  it("con búsqueda, agrega filtro or en recipient", async () => {
    sandbox.queueResult({ data: [], error: null, count: 0 });
    const { getOrders } = await loadActions();

    await getOrders(0, 13, "Ibarzabal");

    const q = sandbox.fromCalls[0].query;
    expect(q.or).toBeDefined();
    expect(JSON.stringify(q.or)).toContain("recipient.ilike");
    expect(JSON.stringify(q.or)).toContain("Ibarzabal");
  });

  it("con deliveryDateFrom, agrega gte", async () => {
    sandbox.queueResult({ data: [], error: null, count: 0 });
    const { getOrders } = await loadActions();

    await getOrders(0, 13, "", "2026-01-01");

    const q = sandbox.fromCalls[0].query;
    expect(q.gte).toEqual(["deliveryDate", "2026-01-01"]);
  });

  it("con deliveryDateTo, agrega lte", async () => {
    sandbox.queueResult({ data: [], error: null, count: 0 });
    const { getOrders } = await loadActions();

    await getOrders(0, 13, "", undefined, "2026-12-31");

    const q = sandbox.fromCalls[0].query;
    expect(q.lte).toEqual(["deliveryDate", "2026-12-31"]);
  });

  it("con status, agrega eq", async () => {
    sandbox.queueResult({ data: [], error: null, count: 0 });
    const { getOrders } = await loadActions();

    await getOrders(0, 13, "", undefined, undefined, "Donado");

    const q = sandbox.fromCalls[0].query;
    expect(q.eq).toEqual(["status", "Donado"]);
  });

  it("combina búsqueda + fechas + status", async () => {
    sandbox.queueResult({ data: [], error: null, count: 0 });
    const { getOrders } = await loadActions();

    await getOrders(0, 13, "Escuela", "2026-01-01", "2026-12-31", "En Preparación");

    const q = sandbox.fromCalls[0].query;
    expect(q.or).toBeDefined();
    expect(q.gte).toBeDefined();
    expect(q.lte).toBeDefined();
    expect(q.eq).toBeDefined();
  });

  it("con error, lanza excepción", async () => {
    sandbox.queueResult({ data: null, error: { message: "DB error" } });
    const { getOrders } = await loadActions();

    await expect(getOrders(0, 13, "")).rejects.toThrow("DB error");
  });
});

describe("getOrder", () => {
  it("devuelve order y notebooks", async () => {
    const orderData = { id: "o1", recipient: "Escuela", status: "En Preparación" };
    const notebooksData = [{ id: "n1", serialNumber: 1 }];

    sandbox.queueResult({ data: orderData, error: null });
    sandbox.queueResult({ data: notebooksData, error: null });
    const { getOrder } = await loadActions();

    const result = await getOrder("o1");

    expect(result.order).toEqual(orderData);
    expect(result.notebooks).toEqual(notebooksData);
    expect(sandbox.fromCalls).toHaveLength(2);
    expect(sandbox.fromCalls[0].table).toBe("orders");
    expect(sandbox.fromCalls[1].table).toBe("notebooks");
  });

  it("con orden inexistente, lanza error", async () => {
    sandbox.queueResult({ data: null, error: null });
    sandbox.queueResult({ data: [], error: null });
    const { getOrder } = await loadActions();

    await expect(getOrder("no-existe")).rejects.toThrow("No se encontró la orden");
  });

  it("con error de orders, lanza el mensaje", async () => {
    sandbox.queueResult({ data: null, error: { message: "connection lost" } });
    sandbox.queueResult({ data: [], error: null });
    const { getOrder } = await loadActions();

    await expect(getOrder("o1")).rejects.toThrow("connection lost");
  });
});

describe("createOrder", () => {
  it("inserta con status En Preparación y devuelve la orden", async () => {
    const newOrder = { id: "new-1", recipient: "Escuela", status: "En Preparación" };
    sandbox.queueResult({ data: newOrder, error: null });
    const { createOrder } = await loadActions();

    const result = await createOrder({
      recipient: "Escuela",
      deliveryDate: "2026-11-16",
      description: null,
    });

    expect(result).toEqual(newOrder);
    const q = sandbox.fromCalls[0].query;
    expect(q.insert).toBeDefined();
    const insertPayload = (q.insert as unknown[])[0] as Record<string, unknown>;
    expect(insertPayload.status).toBe("En Preparación");
    expect(insertPayload.recipient).toBe("Escuela");
  });

  it("con error, lanza excepción", async () => {
    sandbox.queueResult({ data: null, error: { message: "insert failed" } });
    const { createOrder } = await loadActions();

    await expect(
      createOrder({ recipient: "X", deliveryDate: "2026-01-01", description: null })
    ).rejects.toThrow("insert failed");
  });
});

describe("updateOrder", () => {
  it("llama a save_order_changes con los parámetros correctos", async () => {
    sandbox.queueResult({ data: null, error: null });
    const { updateOrder } = await loadActions();

    await updateOrder({
      id: "o1",
      recipient: "Escuela",
      deliveryDate: "2026-11-16",
      description: "desc",
      attach: [{ notebookId: "n1" }],
      detach: [{ notebookId: "n2", status: "Recibido" }],
    });

    expect(sandbox.rpcCalls).toHaveLength(1);
    expect(sandbox.rpcCalls[0].fn).toBe("save_order_changes");
    expect(sandbox.rpcCalls[0].args).toEqual({
      p_order_id: "o1",
      p_recipient: "Escuela",
      p_delivery_date: "2026-11-16",
      p_description: "desc",
      p_attach: [{ notebookId: "n1" }],
      p_detach: [{ notebookId: "n2", status: "Recibido" }],
    });
  });

  it("con error de RPC, lanza excepción", async () => {
    sandbox.queueResult({ data: null, error: { message: "rpc failed" } });
    const { updateOrder } = await loadActions();

    await expect(
      updateOrder({
        id: "o1",
        recipient: "X",
        deliveryDate: "2026-01-01",
        description: null,
        attach: [],
        detach: [],
      })
    ).rejects.toThrow("rpc failed");
  });
});

describe("changeOrderStatus", () => {
  it("llama a change_order_status con id y status", async () => {
    sandbox.queueResult({ data: null, error: null });
    const { changeOrderStatus } = await loadActions();

    await changeOrderStatus({ id: "o1", status: "Donado" });

    expect(sandbox.rpcCalls).toHaveLength(1);
    expect(sandbox.rpcCalls[0].fn).toBe("change_order_status");
    expect(sandbox.rpcCalls[0].args).toEqual({
      p_order_id: "o1",
      p_status: "Donado",
    });
  });

  it("con error de RPC, lanza excepción", async () => {
    sandbox.queueResult({ data: null, error: { message: "transition failed" } });
    const { changeOrderStatus } = await loadActions();

    await expect(
      changeOrderStatus({ id: "o1", status: "Donado" })
    ).rejects.toThrow("transition failed");
  });
});

describe("deleteOrder", () => {
  it("con orden Donado, lanza error sin borrar", async () => {
    sandbox.queueResult({ data: { id: "o1", status: "Donado" }, error: null });
    const { deleteOrder } = await loadActions();

    await expect(deleteOrder("o1")).rejects.toThrow("Una orden donada no se puede eliminar");
    expect(sandbox.fromCalls).toHaveLength(1);
  });

  it("con orden inexistente, lanza error", async () => {
    sandbox.queueResult({ data: null, error: null });
    const { deleteOrder } = await loadActions();

    await expect(deleteOrder("no-existe")).rejects.toThrow("No se encontró la orden");
  });

  it("con equipos asociados, lanza error sin borrar", async () => {
    sandbox.queueResult({ data: { id: "o1", status: "En Preparación" }, error: null });
    sandbox.queueResult({ data: null, error: null, count: 2 });
    const { deleteOrder } = await loadActions();

    await expect(deleteOrder("o1")).rejects.toThrow("La orden tiene equipos asociados");
    expect(sandbox.fromCalls).toHaveLength(2);
  });

  it("con orden vacía en En Preparación, borra", async () => {
    sandbox.queueResult({ data: { id: "o1", status: "En Preparación" }, error: null });
    sandbox.queueResult({ data: null, error: null, count: 0 });
    sandbox.queueResult({ data: null, error: null });
    const { deleteOrder } = await loadActions();

    await expect(deleteOrder("o1")).resolves.toBeUndefined();
    expect(sandbox.fromCalls).toHaveLength(3);
    const lastQuery = sandbox.fromCalls[2].query;
    expect(lastQuery.delete).toBeDefined();
  });
});
