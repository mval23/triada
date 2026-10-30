"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { check, number, refreshAll, text } from "./helpers";

function ingredientFields(formData: FormData) {
  return {
    name: text(formData, "name"),
    unit: text(formData, "unit") || "g",
    quantity: Math.max(0, number(formData, "quantity")),
    min_quantity: Math.max(0, number(formData, "min_quantity")),
  };
}

export async function createIngredient(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").insert(ingredientFields(formData));
  check(error, "guardar el ingrediente");
  refreshAll();
  redirect("/stock");
}

export async function updateIngredient(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").update(ingredientFields(formData)).eq("id", id);
  check(error, "guardar el ingrediente");
  refreshAll();
  redirect("/stock");
}

export async function deleteIngredient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").delete().eq("id", id);
  check(error, "borrar el ingrediente");
  refreshAll();
  redirect("/stock");
}

/** Suma una compra al stock actual. */
export async function addPurchase(id: string, formData: FormData) {
  const amount = number(formData, "amount");
  if (amount <= 0) return;
  const supabase = await createClient();
  const { data, error } = await supabase.from("ingredients").select("quantity").eq("id", id).single();
  check(error, "leer el ingrediente");
  const { error: updateError } = await supabase
    .from("ingredients")
    .update({ quantity: Number(data!.quantity) + amount })
    .eq("id", id);
  check(updateError, "sumar la compra");
  refreshAll();
}
