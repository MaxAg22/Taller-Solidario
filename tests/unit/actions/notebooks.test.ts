import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockSupabaseClient, createSupabaseMock } from "../supabase/mock";

let sandbox: ReturnType<typeof createSupabaseMock>;

beforeEach(() => {
  vi.resetModules();
  sandbox = mockSupabaseClient();
});

async function loadActions() {
  return import("@/actions/notebooks");
}

describe("getAvailableNotebooks", () => {
  it("filtra por status Listo para Donar y order_id null", async () => {
    sandbox.queueResult({ data: [{ id: "n1" }], error: null });
    const { getAvailableNotebooks } = await loadActions();

    const result = await getAvailableNotebooks();

    expect(result).toHaveLength(1);
    const q = sandbox.fromCalls[0].query;
    expect(q.eq).toEqual(["status", "Listo para Donar"]);
    expect(q.is).toEqual(["order_id", null]);
    expect(q.order).toEqual(["serialNumber", { ascending: true }]);
  });

  it("con error, lanza excepción", async () => {
    sandbox.queueResult({ data: null, error: { message: "query failed" } });
    const { getAvailableNotebooks } = await loadActions();

    await expect(getAvailableNotebooks()).rejects.toThrow("query failed");
  });
});
