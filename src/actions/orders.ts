import type { CreateOrder, UpdateOrder } from "@/interfaces";
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

export const createOrder = async (order: CreateOrder) => {
  const { data: newOrder, error } = await supabase
    .from("orders")
    .insert({
      name: order.name,
      description: order.description,
      deadline: order.deadline,
      readyNotebooks: order.newNotebooksSelected?.length ?? 0,
      totalNotebooks: order.totalNotebooks,
      status: order.status,
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (newOrder && newOrder.length > 0) {
    await updateNotebooksIds({
      ...order,
      id: newOrder[0].id,
      oldNotebooksSelected: [],
      newNotebooksSelected: order.newNotebooksSelected,
    });

    await updateNotebooksStatus(newOrder[0])
  }


  return newOrder;
};

export const updateOrder = async (order: UpdateOrder) => {
  const { data: modifiedOrder, error } = await supabase
    .from("orders")
    .update({
      name: order.name,
      description: order.description,
      totalNotebooks: order.totalNotebooks,
      readyNotebooks: order.newNotebooksSelected?.length,
      deadline: order.deadline.toISOString().split("T")[0],
      status: order.status,
    })
    .eq("id", order.id);

    await updateNotebooksIds(order);
    await updateNotebooksStatus(order);

  if (error) {
    throw new Error(error.message);
  }

  return modifiedOrder;
};

export const deleteOrder = async (id: string) => {
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

// Helper function to update notebooks ids
const updateNotebooksIds = async (order: any) => {
  const oldIds = new Set<string>(order.oldNotebooksSelected);   
  const newIds = new Set<string>(order.newNotebooksSelected);  

  const added = [...newIds].filter(id => !oldIds.has(id));
  const removed = [...oldIds].filter(id => !newIds.has(id));

  for (const id of added) {
    const { error } = await supabase
      .from("notebooks")
      .update({ order_id: order.id })
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  for (const id of removed) {
    const { error } = await supabase
      .from("notebooks")
      .update({ order_id: null, status: "Listo para Donar" })
      .eq("id", id);

    if (error) throw new Error(error.message);
  }
};

// Helper function to update notebooks status
const updateNotebooksStatus = async (order: any) => {
  const { error } = await supabase
    .from("notebooks")
    .update({ status: order.status === "Entregada" ? "Donado" : "Listo para Donar" })
    .eq("order_id", order.id);

  if (error) throw new Error(error.message);
};
