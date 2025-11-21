import { supabase } from "@/supabase/client";

export const getOrders = async () => {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("orderNumber", { ascending: false });

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  return orders;
};

export const createOrder = async (order: any) => {
  const { data: newOrder, error } = await supabase
    .from("orders")
    .insert({
      name: order.name,
      description: order.description,
      deadline: order.deadline,
      readyNotebooks: order.readyNotebooks,
      totalNotebooks: order.totalNotebooks,
      status: order.status,
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return newOrder;
};
