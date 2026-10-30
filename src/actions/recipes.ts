"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { check, number, optionalText, refreshAll, text } from "./helpers";

function recipeFields(formData: FormData) {
  return {
    name: text(formData, "name"),
    description: optionalText(formData, "description"),
    yield: Math.max(1, Math.round(number(formData, "yield")) || 12),
    price: Math.max(0, number(formData, "price", { money: true })),
    color: text(formData, "color") || "#3F1208",
    image_url: optionalText(formData, "image_url"),
    steps: optionalText(formData, "steps"),
  };
}

export async function createRecipe(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("recipes").insert(recipeFields(formData)).select("id").single();
  check(error, "crear la receta");
  refreshAll();
  redirect(`/recetas/${data!.id}/editar`);
}

export async function updateRecipe(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").update(recipeFields(formData)).eq("id", id);
  check(error, "guardar la receta");
  refreshAll();
  redirect(`/recetas/${id}`);
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error?.code === "23503") {
    throw new Error("Esta galleta tiene pedidos registrados, así que no se puede borrar.");
  }
  check(error, "borrar la receta");
  refreshAll();
  redirect("/recetas");
}

export async function setRecipeIngredient(recipeId: string, formData: FormData) {
  const ingredientId = text(formData, "ingredient_id");
  const quantity = number(formData, "quantity");
  if (!ingredientId || quantity <= 0) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("recipe_ingredients")
    .upsert({ recipe_id: recipeId, ingredient_id: ingredientId, quantity });
  check(error, "guardar el ingrediente de la receta");
  refreshAll();
}

export async function removeRecipeIngredient(recipeId: string, ingredientId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recipe_ingredients")
    .delete()
    .eq("recipe_id", recipeId)
    .eq("ingredient_id", ingredientId);
  check(error, "quitar el ingrediente");
  refreshAll();
}

/** Descuenta del stock lo que se usó en una o varias tandas. */
export async function bakeRecipe(recipeId: string, formData: FormData) {
  const batches = number(formData, "batches");
  if (batches <= 0) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("bake_recipe", { p_recipe: recipeId, p_batches: batches });
  check(error, "descontar la horneada");
  refreshAll();
}
