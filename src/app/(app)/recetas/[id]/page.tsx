import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bakeRecipe } from "@/actions/recipes";
import { AlertIcon, BackIcon, CheckIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { getIngredients, getRecipe } from "@/lib/data";
import { formatMoney, formatQty } from "@/lib/format";
import { batchesPossible, indexById, missingFor } from "@/lib/stock";

export default async function RecipePage({ params }: PageProps<"/recetas/[id]">) {
  const { id } = await params;
  const [recipe, ingredients] = await Promise.all([getRecipe(id), getIngredients()]);
  if (!recipe) notFound();

  const byId = indexById(ingredients);
  const batches = batchesPossible(recipe, byId);
  const missing = missingFor(recipe, byId);
  const lines = recipe.recipe_ingredients
    .map((ri) => ({ ri, ingredient: byId.get(ri.ingredient_id) }))
    .filter((line) => line.ingredient);

  return (
    <>
      <div className="relative -mx-5 -mt-7 flex h-[210px] items-center justify-center border-b-2 border-choco bg-white">
        {recipe.image_url ? (
          <Image src={recipe.image_url} alt={recipe.name} width={190} height={180} className="h-[180px] w-[190px] object-contain" priority />
        ) : (
          <span aria-hidden="true" className="size-36 rounded-full" style={{ background: recipe.color }} />
        )}
        <Link
          href="/recetas"
          aria-label="Volver"
          className="absolute top-5 left-4 flex size-11 items-center justify-center rounded-full border-2 border-choco bg-crema"
        >
          <BackIcon />
        </Link>
        <Link
          href={`/recetas/${recipe.id}/editar`}
          className="absolute top-5 right-4 flex h-11 items-center rounded-full border-2 border-choco bg-crema px-4 text-sm font-bold"
        >
          Editar
        </Link>
      </div>

      <div className="flex items-end justify-between gap-2">
        <h1 className="titulo">{recipe.name}</h1>
        <span className="shrink-0 text-right text-sm font-bold text-rosa-texto">
          Rinde {recipe.yield}
          {recipe.price > 0 && (
            <>
              <br />
              {formatMoney(recipe.price)} c/u
            </>
          )}
        </span>
      </div>

      {recipe.description && <p className="caja text-[15px] font-medium">{recipe.description}</p>}

      {batches === null ? (
        <div className="flex items-center gap-3 rounded-[22px] bg-choco px-4 py-3.5 text-crema">
          <AlertIcon size={24} className="shrink-0" />
          <span className="grow text-[15px]">Anota los ingredientes para saber si te alcanza el stock.</span>
        </div>
      ) : batches === 0 ? (
        <div className="flex items-center gap-3 rounded-[22px] bg-choco px-4 py-3.5 text-crema">
          <AlertIcon size={24} className="shrink-0" />
          <div className="flex grow flex-col gap-0.5">
            <span className="text-[15px] font-bold">No alcanza para una tanda</span>
            <span className="text-[13px]">Falta {missing.map((i) => i.name.toLowerCase()).join(", ")}</span>
          </div>
          <Link href="/stock?vista=compras" className="flex h-10 shrink-0 items-center rounded-full bg-crema px-3 text-[13px] font-bold text-choco">
            A compras
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-[22px] bg-rosa px-4 py-3.5 text-rosa-texto">
          <CheckIcon size={24} className="shrink-0" />
          <span className="grow text-[15px] font-bold">
            Alcanza para {batches} {batches === 1 ? "tanda" : "tandas"} ({batches * recipe.yield} galletas)
          </span>
        </div>
      )}

      <section className="flex flex-col gap-1">
        <h2 className="subtitulo text-tinta">Ingredientes</h2>
        {lines.length === 0 ? (
          <p className="text-[15px] text-suave">Todavía no hay ingredientes anotados.</p>
        ) : (
          <ul className="flex flex-col">
            {lines.map(({ ri, ingredient }) => {
              const enough = ingredient!.quantity >= ri.quantity;
              return (
                <li key={ri.ingredient_id} className="flex items-center gap-3 border-b border-dashed border-[#C9AFA9] py-2">
                  <span
                    aria-hidden="true"
                    className={`size-3 shrink-0 rounded-full ${enough ? "bg-rosa-texto" : "border-2 border-choco"}`}
                  />
                  <span className="grow text-[15px] font-medium">
                    {ingredient!.name}
                    {!enough && <span className="ml-1.5 text-[13px] font-bold">· falta</span>}
                  </span>
                  <span className="text-[15px] font-bold text-rosa-texto">{formatQty(ri.quantity, ingredient!.unit)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="subtitulo text-tinta">Preparación</h2>
        {recipe.steps ? (
          <p className="text-[15px] leading-relaxed whitespace-pre-line">{recipe.steps}</p>
        ) : (
          <p className="text-[15px] text-suave">
            Todavía no está escrita. <Link href={`/recetas/${recipe.id}/editar`} className="font-bold underline">Escribirla</Link>
          </p>
        )}
      </section>

      {lines.length > 0 && (
        <form action={bakeRecipe.bind(null, recipe.id)} className="tarjeta flex flex-col gap-3 p-4">
          <h2 className="subtitulo">Registrar horneada</h2>
          <p className="text-sm text-suave">Descuenta del stock los ingredientes usados.</p>
          <div className="flex items-center gap-2">
            <label htmlFor="batches" className="sr-only">
              Número de tandas
            </label>
            <input id="batches" name="batches" inputMode="decimal" defaultValue="1" className="campo w-20 text-center" />
            <span className="font-medium">tanda(s)</span>
            <SubmitButton
              className="btn-choco ml-auto"
              pendingText="Descontando…"
              confirm="¿Descontar del stock los ingredientes de esta horneada?"
            >
              Descontar
            </SubmitButton>
          </div>
        </form>
      )}
    </>
  );
}
