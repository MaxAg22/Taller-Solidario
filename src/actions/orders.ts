// Funciones que interactuan con la API de SUPABASE
import { supabase } from "@/supabase/client";
import type {
  ChangeOrderStatusPayload,
  CreateOrderPayload,
  UpdateOrderPayload,
} from "@/interfaces";

export const getOrders = async (
  from: number,
  to: number,
  search: string,
  deliveryDateFrom?: string,
  deliveryDateTo?: string,
) => {
  let query = supabase.from("orders").select("*", { count: "exact" });

  const text = search.trim();

  if (text) {
    const pattern = JSON.stringify(`%${text}%`);
    query = query.or(`recipient.ilike.${pattern}`);
  }

  if (deliveryDateFrom) {
    query = query.gte("deliveryDate", deliveryDateFrom);
  }

  if (deliveryDateTo) {
    query = query.lte("deliveryDate", deliveryDateTo);
  }

  const { data: orders, count, error } = await query
    .order("deliveryDate", { ascending: false })
    .range(from, to);

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  return {
    orders: orders ?? [],
    rowCount: count ?? 0,
  };
};

export const getOrder = async (id: string) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (!order) {
    throw new Error("No se encontró la orden");
  }

  const { data: notebooks, error: notebooksError } = await supabase
    .from("notebooks")
    .select("*")
    .eq("order_id", id);

  if (notebooksError) {
    throw new Error(notebooksError.message);
  }

  return {
    order,
    notebooks: notebooks ?? [],
  };
};

export const createOrder = async (order: CreateOrderPayload) => {
  const { data: newOrder, error } = await supabase
    .from("orders")
    .insert({
      recipient: order.recipient,
      deliveryDate: order.deliveryDate,
      description: order.description,
      status: "En Preparación",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return newOrder;
};

export const updateOrder = async (order: UpdateOrderPayload) => {
  const { error } = await supabase.rpc("save_order_changes", {
    p_order_id: order.id,
    p_recipient: order.recipient,
    p_delivery_date: order.deliveryDate,
    p_description: order.description,
    p_attach: order.attach,
    p_detach: order.detach,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const changeOrderStatus = async (order: ChangeOrderStatusPayload) => {
  const { error } = await supabase.rpc("change_order_status", {
    p_order_id: order.id,
    p_status: order.status,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteOrder = async (id: string) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (!order) {
    throw new Error("No se encontró la orden");
  }

  if (order.status === "Donado") {
    throw new Error("Una orden donada no se puede eliminar");
  }

  const { count, error: notebooksError } = await supabase
    .from("notebooks")
    .select("id", { count: "exact", head: true })
    .eq("order_id", id);

  if (notebooksError) {
    throw new Error(notebooksError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error("La orden tiene equipos asociados y no se puede eliminar");
  }

  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};
