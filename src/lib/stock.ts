import type { Ingredient, Order, Recipe } from "./types";

export type StockStatus = "falta" | "poco" | "bien";

export type Need = { amount: number; recipes: string[] };

/** Cuánto de cada ingrediente piden los pedidos pendientes, según las recetas. */
export function neededForOrders(orders: Order[], recipes: Recipe[]) {
  const needs = new Map<string, Need>();
  for (const order of orders) {
    for (const item of order.order_items) {
      const recipe = recipes.find((r) => r.id === item.recipe?.id);
      if (!recipe) continue;
      const batches = item.quantity / recipe.yield;
      for (const ri of recipe.recipe_ingredients) {
        const need = needs.get(ri.ingredient_id) ?? { amount: 0, recipes: [] };
        need.amount += ri.quantity * batches;
        if (!need.recipes.includes(recipe.name)) need.recipes.push(recipe.name);
        needs.set(ri.ingredient_id, need);
      }
    }
  }
  return needs;
}

export function stockStatus(ingredient: Ingredient, needed = 0): StockStatus {
  if (ingredient.quantity <= 0) return "falta";
  if (needed > ingredient.quantity) return "falta";
  if (ingredient.quantity < ingredient.min_quantity) return "poco";
  return "bien";
}

/** Cantidad sugerida para comprar: lo que falta para el mínimo o para los pedidos. */
export function toBuy(ingredient: Ingredient, needed = 0) {
  return Math.max(0, Math.max(ingredient.min_quantity, needed) - ingredient.quantity);
}

export function recipesUsing(ingredientId: string, recipes: Recipe[]) {
  return recipes
    .filter((r) => r.recipe_ingredients.some((ri) => ri.ingredient_id === ingredientId))
    .map((r) => r.name);
}

/** Cuántas tandas completas alcanzan con el stock actual. null si la receta no tiene ingredientes anotados. */
export function batchesPossible(recipe: Recipe, byId: Map<string, Ingredient>) {
  if (recipe.recipe_ingredients.length === 0) return null;
  return Math.min(
    ...recipe.recipe_ingredients.map((ri) => {
      const stock = byId.get(ri.ingredient_id)?.quantity ?? 0;
      return Math.floor(stock / ri.quantity);
    }),
  );
}

export function missingFor(recipe: Recipe, byId: Map<string, Ingredient>) {
  return recipe.recipe_ingredients
    .map((ri) => byId.get(ri.ingredient_id))
    .filter((ing): ing is Ingredient => Boolean(ing))
    .filter((ing) => {
      const ri = recipe.recipe_ingredients.find((r) => r.ingredient_id === ing.id)!;
      return ing.quantity < ri.quantity;
    });
}

export function indexById(ingredients: Ingredient[]) {
  return new Map(ingredients.map((ing) => [ing.id, ing]));
}

export type ShoppingItem = {
  ingredient: Ingredient;
  status: StockStatus;
  amount: number;
  forRecipes: string[];
};

export function shoppingList(ingredients: Ingredient[], recipes: Recipe[], pending: Order[]) {
  const needs = neededForOrders(pending, recipes);
  const items: ShoppingItem[] = [];
  for (const ingredient of ingredients) {
    const need = needs.get(ingredient.id);
    const status = stockStatus(ingredient, need?.amount);
    if (status === "bien") continue;
    items.push({
      ingredient,
      status,
      amount: toBuy(ingredient, need?.amount),
      forRecipes: need?.recipes ?? recipesUsing(ingredient.id, recipes),
    });
  }
  return items.sort((a, b) => (a.status === b.status ? 0 : a.status === "falta" ? -1 : 1));
}
