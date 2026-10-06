// Funciones que interactuan con la API de SUPABASE
import type { UpdateNotebook } from "@/interfaces";
import { supabase } from "@/supabase/client";

interface PaginatedResult<T> {
  data: T[];
  count: number;
}

interface NotebooksFilters {
  searchTerm?: string;
  statusFilter?: string;
}

export const getNotebooks = async (
  page = 1,
  pageSize = 10,
  filters?: NotebooksFilters,
): Promise<PaginatedResult<any>> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("notebooks")
    .select("*", { count: "exact" })
    .order("serialNumber", { ascending: false });

  if (filters?.searchTerm) {
    const term = `%${filters.searchTerm}%`;
    query = query.or(
      `serialNumber::text.ilike.${term},brand.ilike.${term},model.ilike.${term},status.ilike.${term}`,
    );
  }

  if (filters?.statusFilter && filters.statusFilter !== "all") {
    query = query.eq("status", filters.statusFilter);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return { data: data ?? [], count: count ?? 0 };
};

export const getNotebooksMetrics = async () => {
  const { data, error } = await supabase
    .from("notebooks")
    .select("status");

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  return {
    total: rows.length,
    blocked: rows.filter((r) => r.status === "Bloqueada").length,
    ready: rows.filter((r) => r.status === "Listo para Donar").length,
    repairing: rows.filter((r) => r.status === "En Reparación").length,
    diagnosis: rows.filter(
      (r) => r.status === "Recibido" || r.status === "Instalar SO",
    ).length,
  };
};


export const getReadyNoteboks = async () => {
  const { data: readyNotebooks, error } = await supabase
    .from("notebooks")
    .select("*")
    .eq("status", "Listo para Donar")
    .is("order_id", null)
    .order("serialNumber", { ascending: true });

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  return readyNotebooks;
};

export const createNotebook = async (notebook: any) => {
  const { data: newNotebook, error } = await supabase
    .from("notebooks")
    .insert({
      brand: notebook.brand,
      entryDate: notebook.entryDate,
      model: notebook.model,
      repairHistory: notebook.repairHistory,
      repairNeeded: notebook.repairNeeded,
      specs: notebook.specs,
      status: notebook.status,
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return newNotebook;
};

export const deleteNotebook = async (id: string) => {
  const { error } = await supabase.from("notebooks").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export const updateNotebook = async (notebook: UpdateNotebook) => {
  console.log("esto updateo", notebook);
  const { data: modifiedNotebook, error } = await supabase
    .from("notebooks")
    .update({
      brand: notebook.brand,
      model: notebook.model,
      repairHistory: notebook.repairHistory,
      repairNeeded: notebook.repairNeeded,
      specs: notebook.specs,
      status: notebook.status,
    })
    .eq("id", notebook.id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return modifiedNotebook;
};
