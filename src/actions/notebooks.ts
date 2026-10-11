// Funciones que interactuan con la API de SUPABASE
import type { UpdateNotebook } from "@/interfaces";
import { supabase } from "@/supabase/client";

export const getNotebooks = async (from: number, to: number) => {
  const { data: notebooks, count, error } = await supabase
    .from("notebooks")
    .select("*", { count: "exact" })
    .order("entryDate", { ascending: false })
    .range(from,to);

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  return {
    notebooks: notebooks ?? [],
    rowCount: count ?? 0,
  };
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
