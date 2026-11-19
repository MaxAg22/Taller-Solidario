import { vi } from "vitest";

type QueryResult = {
  data: unknown;
  error: { message: string } | null;
  count?: number | null;
};


//   supabase.from("orders").select("*").eq("id", id).maybeSingle()
//   => mock guarda en fromCalls: { table: "orders", query: { select: [["*"]], eq: [["id", id]], maybeSingle: [] } }


export function createSupabaseMock() {
  const fromCalls: { table: string; query: Record<string, unknown> }[] = [];
  const rpcCalls: { fn: string; args: Record<string, unknown> }[] = [];
  let resultQueue: QueryResult[] = [];

  const chain = (table: string) => {
    const record: Record<string, unknown> = {};
    fromCalls.push({ table, query: record });

    const builder: Record<string, unknown> = {};

    const addMethod = (name: string) => {
      builder[name] = (...args: unknown[]) => {
        record[name] = args;
        return builder;
      };
    };

    for (const method of ["select", "or", "gte", "lte", "eq", "is", "order", "range", "insert", "delete", "maybeSingle", "single"]) {
      addMethod(method);
    }

    // Esto sirve para el await supabase.from("orders").select("*").eq("id", id).maybeSingle() que devuelve una promesa
    builder.then = (
      resolve: (value: QueryResult) => void,
      reject: (error: Error) => void
    ) => {
      const result = resultQueue.shift() ?? { data: null, error: null };
      resolve(result);
      return Promise.resolve(result).catch(reject);
    };

    return builder;
  };

  const mock = {
    from: (table: string) => chain(table),
    rpc: (fn: string, args: Record<string, unknown>) => {
      rpcCalls.push({ fn, args });
      const result = resultQueue.shift() ?? { data: null, error: null };
      return Promise.resolve(result);
    },
  };

  return {
    mock,
    fromCalls,
    rpcCalls,
    queueResult(result: QueryResult) {
      resultQueue.push(result);
    },
    clearQueue() {
      resultQueue = [];
    },
  };
}

export function mockSupabaseClient() {
  const sandbox = createSupabaseMock();

  vi.doMock("@/supabase/client", () => ({
    supabase: sandbox.mock,
  }));

  return sandbox;
}
