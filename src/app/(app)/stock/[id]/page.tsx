import { notFound } from "next/navigation";
import { addPurchase, deleteIngredient, updateIngredient } from "@/actions/stock";
import { SubmitButton } from "@/components/submit-button";
import { PageHeader } from "@/components/ui";
import { getIngredient, getRecipes } from "@/lib/data";
import { recipesUsing } from "@/lib/stock";
import { IngredientForm } from "../ingredient-form";

export default async function IngredientPage({ params }: PageProps<"/stock/[id]">) {
  const { id } = await params;
  const [ingredient, recipes] = await Promise.all([getIngredient(id), getRecipes()]);
  if (!ingredient) notFound();
  const usedIn = recipesUsing(ingredient.id, recipes);

  return (
    <>
      <PageHeader title={ingredient.name} back="/stock" />

      <form action={addPurchase.bind(null, ingredient.id)} className="tarjeta flex flex-col gap-3 p-4">
        <label htmlFor="amount" className="subtitulo">
          Sumar una compra
        </label>
        <div className="flex items-center gap-2">
          <input id="amount" name="amount" inputMode="decimal" placeholder="Cantidad" required className="campo w-32" />
          <span className="font-medium">{ingredient.unit}</span>
          <SubmitButton className="btn-choco ml-auto" pendingText="Sumando…">
            Sumar
          </SubmitButton>
        </div>
      </form>

      <IngredientForm action={updateIngredient.bind(null, ingredient.id)} ingredient={ingredient} submitLabel="Guardar cambios" />

      {usedIn.length > 0 && <p className="text-sm text-suave">Se usa en: {usedIn.join(", ")}.</p>}

      <form action={deleteIngredient.bind(null, ingredient.id)}>
        <SubmitButton
          className="btn-borde w-full"
          confirm={`¿Borrar ${ingredient.name}? También se quitará de las recetas que lo usan.`}
        >
          Borrar ingrediente
        </SubmitButton>
      </form>
    </>
  );
}
