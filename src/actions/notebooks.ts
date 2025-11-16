// Funciones que interactuan con la API de SUPABASE

import type { Notebook } from "@/interfaces";
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
