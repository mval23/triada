"use server";

import { redirect } from "next/navigation";
import { toBogotaIso } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { check, number, optionalText, refreshAll, text } from "./helpers";

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const { data: recipes, error: recipesError } = await supabase.from("recipes").select("id, price");
  check(recipesError, "leer los sabores");

  const items = (recipes ?? [])
    .map((recipe) => ({
      recipe_id: recipe.id as string,
      quantity: Math.round(number(formData, `qty_${recipe.id}`)),
      unit_price: Number(recipe.price),
    }))
    .filter((item) => item.quantity > 0);

  if (items.length === 0) {
    throw new Error("El pedido necesita al menos una galleta.");
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: text(formData, "customer_name"),
      due_at: toBogotaIso(text(formData, "due_date"), text(formData, "due_time")),
      paid_amount: Math.max(0, number(formData, "paid_amount", { money: true })),
      notes: optionalText(formData, "notes"),
    })
    .select("id")
    .single();
  check(error, "crear el pedido");

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(items.map((item) => ({ ...item, order_id: order!.id })));
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order!.id);
    check(itemsError, "guardar las galletas del pedido");
  }

  refreshAll();
  redirect("/pedidos");
}

export async function markDelivered(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "entregado", delivered_at: new Date().toISOString() })
    .eq("id", id);
  check(error, "marcar el pedido como entregado");
  refreshAll();
}

export async function markPending(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status: "pendiente", delivered_at: null }).eq("id", id);
  check(error, "devolver el pedido a pendientes");
  refreshAll();
}

/** Suma un pago (o abono) a lo que ya se había pagado. */
export async function addPayment(id: string, formData: FormData) {
  const amount = number(formData, "amount", { money: true });
  if (amount <= 0) return;
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select("paid_amount").eq("id", id).single();
  check(error, "leer el pedido");
  const { error: updateError } = await supabase
    .from("orders")
    .update({ paid_amount: Number(data!.paid_amount) + amount })
    .eq("id", id);
  check(updateError, "registrar el pago");
  refreshAll();
}

export async function updateOrderDetails(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      customer_name: text(formData, "customer_name"),
      due_at: toBogotaIso(text(formData, "due_date"), text(formData, "due_time")),
      notes: optionalText(formData, "notes"),
    })
    .eq("id", id);
  check(error, "guardar el pedido");
  refreshAll();
}

export async function deleteOrder(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  check(error, "borrar el pedido");
  refreshAll();
  redirect("/pedidos");
}
