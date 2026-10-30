import { notFound } from "next/navigation";
import Link from "next/link";
import { deleteRecipe, removeRecipeIngredient, setRecipeIngredient, updateRecipe } from "@/actions/recipes";
import { SubmitButton } from "@/components/submit-button";
import { PageHeader } from "@/components/ui";
import { getIngredients, getRecipe } from "@/lib/data";
import { formatQty } from "@/lib/format";
import { indexById } from "@/lib/stock";
import { RecipeForm } from "../../recipe-form";

export default async function EditRecipePage({ params }: PageProps<"/recetas/[id]/editar">) {
  const { id } = await params;
  const [recipe, ingredients] = await Promise.all([getRecipe(id), getIngredients()]);
  if (!recipe) notFound();

  const byId = indexById(ingredients);
  const used = new Set(recipe.recipe_ingredients.map((ri) => ri.ingredient_id));
  const available = ingredients.filter((ing) => !used.has(ing.id));

  return (
    <>
      <PageHeader title="Editar receta" back={`/recetas/${recipe.id}`} />

      <section className="tarjeta flex flex-col gap-3 p-4">
        <h2 className="subtitulo">Ingredientes</h2>
        <p className="text-sm text-suave">Las cantidades son para una tanda ({recipe.yield} galletas).</p>

        {recipe.recipe_ingredients.length > 0 && (
          <ul className="flex flex-col">
            {recipe.recipe_ingredients.map((ri) => {
              const ingredient = byId.get(ri.ingredient_id);
              if (!ingredient) return null;
              return (
                <li key={ri.ingredient_id} className="flex items-center gap-2 border-b border-dashed border-[#C9AFA9] py-2">
                  <span className="grow text-[15px] font-medium">{ingredient.name}</span>
                  <span className="text-[15px] font-bold text-rosa-texto">{formatQty(ri.quantity, ingredient.unit)}</span>
                  <form action={removeRecipeIngredient.bind(null, recipe.id, ri.ingredient_id)}>
                    <SubmitButton
                      className="flex size-11 cursor-pointer items-center justify-center rounded-full text-lg font-bold"
                      aria-label={`Quitar ${ingredient.name}`}
                    >
                      ×
                    </SubmitButton>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        {available.length > 0 ? (
          <form action={setRecipeIngredient.bind(null, recipe.id)} className="flex flex-col gap-2 rounded-2xl bg-rosa p-3">
            <label className="etiqueta mb-0" htmlFor="ingredient_id">
              Agregar ingrediente
            </label>
            <select id="ingredient_id" name="ingredient_id" className="campo" required defaultValue="">
              <option value="" disabled>
                Elige uno…
              </option>
              {available.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unit})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="ri-quantity">
                Cantidad por tanda
              </label>
              <input id="ri-quantity" name="quantity" inputMode="decimal" placeholder="Cantidad" required className="campo grow" />
              <SubmitButton className="btn-choco" pendingText="…">
                Agregar
              </SubmitButton>
            </div>
          </form>
        ) : (
          <p className="text-sm">Ya usaste todos los ingredientes del stock.</p>
        )}
        <Link href="/stock/nuevo" className="text-sm font-bold underline">
          ¿No está el ingrediente? Créalo en Stock
        </Link>
      </section>

      <RecipeForm action={updateRecipe.bind(null, recipe.id)} recipe={recipe} submitLabel="Guardar receta" />

      <form action={deleteRecipe.bind(null, recipe.id)}>
        <SubmitButton className="btn-borde w-full" confirm={`¿Borrar la receta ${recipe.name}?`}>
          Borrar receta
        </SubmitButton>
      </form>
    </>
  );
}
