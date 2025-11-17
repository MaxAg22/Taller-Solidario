// Funciones que interactuan con la API de SUPABASE
import { supabase } from "@/supabase/client";

export const getNotebooks = async () => {
  const { data: notebooks, error } = await supabase
    .from("notebooks")
    .select("*")
    .order("serialNumber", { ascending: false });

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  return notebooks;
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
