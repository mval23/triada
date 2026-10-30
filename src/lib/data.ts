import { orderBalance } from "./orders";
import { createClient } from "./supabase/server";
import type { Debt, Ingredient, Order, OrderStatus, Recipe } from "./types";

export { orderBalance, orderCookieCount, orderSummary, orderTotal } from "./orders";

const ORDER_SELECT =
  "id, customer_name, due_at, status, paid_amount, notes, delivered_at, created_at, order_items(id, quantity, unit_price, recipe:recipes(id, name, color, image_url, yield))";

function fail(message: string): never {
  throw new Error(`No se pudo leer de la base de datos: ${message}`);
}

function toIngredient(row: Ingredient): Ingredient {
  return { ...row, quantity: Number(row.quantity), min_quantity: Number(row.min_quantity) };
}

function toRecipe(row: Recipe): Recipe {
  return {
    ...row,
    recipe_ingredients: (row.recipe_ingredients ?? []).map((ri) => ({
      ingredient_id: ri.ingredient_id,
      quantity: Number(ri.quantity),
    })),
  };
}

export async function getIngredients(): Promise<Ingredient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name, unit, quantity, min_quantity")
    .order("name");
  if (error) fail(error.message);
  return (data as Ingredient[]).map(toIngredient);
}

export async function getIngredient(id: string): Promise<Ingredient | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name, unit, quantity, min_quantity")
    .eq("id", id)
    .maybeSingle();
  if (error) fail(error.message);
  return data ? toIngredient(data as Ingredient) : null;
}

export async function getRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*, recipe_ingredients(ingredient_id, quantity)")
    .order("created_at");
  if (error) fail(error.message);
  return (data as Recipe[]).map(toRecipe);
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*, recipe_ingredients(ingredient_id, quantity)")
    .eq("id", id)
    .maybeSingle();
  if (error) fail(error.message);
  return data ? toRecipe(data as Recipe) : null;
}

export async function getOrders(status: OrderStatus): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase.from("orders").select(ORDER_SELECT).eq("status", status);
  query =
    status === "pendiente"
      ? query.order("due_at", { ascending: true, nullsFirst: false })
      : query.order("delivered_at", { ascending: false }).limit(60);
  const { data, error } = await query;
  if (error) fail(error.message);
  return data as unknown as Order[];
}

export async function getOrder(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
  if (error) fail(error.message);
  return data as unknown as Order | null;
}

/** Pedidos entregados que todavía no se han pagado completos. */
export async function getUnpaidDeliveredOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("status", "entregado")
    .order("delivered_at", { ascending: true });
  if (error) fail(error.message);
  return (data as unknown as Order[]).filter((order) => orderBalance(order) > 0);
}

export async function getOpenDebts(): Promise<Debt[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .is("paid_at", null)
    .order("created_at");
  if (error) fail(error.message);
  return data as Debt[];
}

export async function getKnownPeople(): Promise<string[]> {
  const supabase = await createClient();
  const [orders, debts] = await Promise.all([
    supabase.from("orders").select("customer_name").order("created_at", { ascending: false }).limit(200),
    supabase.from("debts").select("person").order("created_at", { ascending: false }).limit(200),
  ]);
  const names = [
    ...(orders.data ?? []).map((row) => row.customer_name as string),
    ...(debts.data ?? []).map((row) => row.person as string),
  ];
  return [...new Set(names.map((name) => name.trim()).filter(Boolean))];
}

