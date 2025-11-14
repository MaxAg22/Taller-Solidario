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
