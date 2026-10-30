export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
};

export type RecipeIngredient = {
  ingredient_id: string;
  quantity: number;
};

export type Recipe = {
  id: string;
  name: string;
  description: string | null;
  yield: number;
  price: number;
  color: string;
  image_url: string | null;
  steps: string | null;
  recipe_ingredients: RecipeIngredient[];
};

export type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  recipe: Pick<Recipe, "id" | "name" | "color" | "image_url" | "yield"> | null;
};

export type OrderStatus = "pendiente" | "entregado";

export type Order = {
  id: string;
  customer_name: string;
  due_at: string | null;
  status: OrderStatus;
  paid_amount: number;
  notes: string | null;
  delivered_at: string | null;
  created_at: string;
  order_items: OrderItem[];
};

export type Debt = {
  id: string;
  person: string;
  amount: number;
  description: string | null;
  created_at: string;
  paid_at: string | null;
};
