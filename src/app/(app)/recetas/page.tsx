import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { CookieThumb, EmptyState, PageHeader, RoundAction } from "@/components/ui";
import { getIngredients, getRecipes } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { batchesPossible, indexById, missingFor } from "@/lib/stock";

export default async function RecipesPage() {
  const [recipes, ingredients] = await Promise.all([getRecipes(), getIngredients()]);
  const byId = indexById(ingredients);

  return (
    <>
      <PageHeader
        title="Recetas"
        action={
          <RoundAction href="/recetas/nueva" label="Nueva receta">
            <PlusIcon size={22} />
          </RoundAction>
        }
      />

      {recipes.length === 0 ? (
        <EmptyState>Todavía no hay recetas. Crea la primera con el botón +.</EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {recipes.map((recipe) => {
            const batches = batchesPossible(recipe, byId);
            const missing = missingFor(recipe, byId);
            const status =
              batches === null
                ? { text: "Sin ingredientes anotados", className: "bg-crema text-rosa-texto" }
                : batches > 0
                  ? { text: `Alcanza para ${batches} ${batches === 1 ? "tanda" : "tandas"}`, className: "bg-[#E3F1E4] text-[#1E5A2B]" }
                  : { text: `Falta ${missing.map((i) => i.name.toLowerCase()).join(", ")}`, className: "bg-choco text-crema" };
            return (
              <Link key={recipe.id} href={`/recetas/${recipe.id}`} className="tarjeta flex flex-col overflow-hidden">
                <div className="flex h-[100px] items-center justify-center" style={{ background: recipe.color }}>
                  <CookieThumb
                    src={recipe.image_url}
                    color={recipe.color}
                    alt=""
                    size={84}
                    className="rounded-full border-[3px] border-white"
                  />
                </div>
                <div className="flex grow flex-col gap-1.5 border-t-2 border-choco p-3">
                  <span className="font-display text-[17px] leading-tight text-tinta">{recipe.name}</span>
                  <span className="text-[13px] text-suave">
                    Rinde {recipe.yield}
                    {recipe.price > 0 ? ` · ${formatMoney(recipe.price)}` : " · sin precio"}
                  </span>
                  <span className={`chip mt-auto self-start py-1 text-xs ${status.className}`}>{status.text}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
