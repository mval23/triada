import Link from "next/link";
import { addPurchase } from "@/actions/stock";
import { MessageIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { EmptyState, PageHeader, RoundAction, StatusChip } from "@/components/ui";
import { getIngredients, getOrders, getRecipes } from "@/lib/data";
import { formatQty } from "@/lib/format";
import { neededForOrders, shoppingList, stockStatus, type StockStatus } from "@/lib/stock";

const BAR_COLORS: Record<StockStatus, string> = { falta: "bg-choco", poco: "bg-[#B86A1E]", bien: "bg-rosa-texto" };

export default async function StockPage({ searchParams }: PageProps<"/stock">) {
  const params = await searchParams;
  const vista = params.vista === "compras" ? "compras" : "stock";
  const filtro = typeof params.f === "string" ? params.f : "todo";
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";

  const [ingredients, recipes, pending] = await Promise.all([getIngredients(), getRecipes(), getOrders("pendiente")]);
  const needs = neededForOrders(pending, recipes);
  const rows = ingredients.map((ingredient) => ({
    ingredient,
    status: stockStatus(ingredient, needs.get(ingredient.id)?.amount),
  }));
  const counts = {
    todo: rows.length,
    falta: rows.filter((r) => r.status === "falta").length,
    poco: rows.filter((r) => r.status === "poco").length,
  };

  return (
    <>
      <PageHeader
        title="Stock"
        action={
          <RoundAction href="/stock/nuevo" label="Agregar ingrediente">
            <PlusIcon size={22} />
          </RoundAction>
        }
      />

      <div role="tablist" aria-label="Vista" className="grid grid-cols-2 rounded-full bg-rosa p-1">
        <Tab href="/stock" active={vista === "stock"}>
          Ingredientes
        </Tab>
        <Tab href="/stock?vista=compras" active={vista === "compras"}>
          Lista de compras
        </Tab>
      </div>

      {vista === "compras" ? (
        <ShoppingView items={shoppingList(ingredients, recipes, pending)} />
      ) : (
        <>
          <form action="/stock" className="flex h-12 items-center gap-2.5 rounded-full border-2 border-choco bg-white px-4">
            <SearchIcon className="shrink-0 text-rosa-texto" />
            <label className="sr-only" htmlFor="q">
              Buscar ingrediente
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Buscar ingrediente"
              className="grow bg-transparent text-[15px] outline-none"
            />
            {filtro !== "todo" && <input type="hidden" name="f" value={filtro} />}
          </form>

          <div className="flex gap-2">
            {(["todo", "falta", "poco"] as const).map((f) => (
              <Link
                key={f}
                href={f === "todo" ? "/stock" : `/stock?f=${f}`}
                className={`flex h-9 items-center rounded-full border-2 border-choco px-4 text-sm ${filtro === f ? "bg-choco font-bold text-crema" : "font-medium"}`}
              >
                {f === "todo" ? "Todo" : f === "falta" ? "Falta" : "Poco"} · {counts[f]}
              </Link>
            ))}
          </div>

          <StockList
            rows={rows.filter(
              (r) => (filtro === "todo" || r.status === filtro) && (!q || r.ingredient.name.toLowerCase().includes(q)),
            )}
          />
        </>
      )}
    </>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={`flex h-10 items-center justify-center rounded-full text-sm ${active ? "bg-choco font-bold text-crema" : "font-medium text-rosa-texto"}`}
    >
      {children}
    </Link>
  );
}

function StockList({ rows }: { rows: { ingredient: Awaited<ReturnType<typeof getIngredients>>[number]; status: StockStatus }[] }) {
  if (rows.length === 0) return <EmptyState>No hay ingredientes para mostrar.</EmptyState>;
  return (
    <ul className="flex flex-col rounded-[28px] bg-rosa px-4 py-1.5">
      {rows.map(({ ingredient, status }) => {
        const reference = Math.max(ingredient.min_quantity, ingredient.quantity, 1);
        const percent = ingredient.min_quantity > 0 ? Math.min(100, (ingredient.quantity / reference) * 100) : ingredient.quantity > 0 ? 100 : 0;
        return (
          <li key={ingredient.id} className="border-b border-rosa-linea last:border-b-0">
            <Link href={`/stock/${ingredient.id}`} className="flex items-center gap-3 py-2.5">
              <div className="flex min-w-0 grow flex-col gap-[5px]">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[15px] font-bold text-choco">{ingredient.name}</span>
                  <span className="shrink-0 text-[13px] text-rosa-texto">
                    {formatQty(ingredient.quantity, ingredient.unit)}
                    {ingredient.min_quantity > 0 && ` · mín. ${formatQty(ingredient.min_quantity, ingredient.unit)}`}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-crema">
                  <div className={`h-full rounded-full ${BAR_COLORS[status]}`} style={{ width: `${Math.max(percent, 3)}%` }} />
                </div>
              </div>
              <StatusChip status={status} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ShoppingView({ items }: { items: ReturnType<typeof shoppingList> }) {
  if (items.length === 0) {
    return <EmptyState>No te falta nada. Todo el stock está por encima del mínimo.</EmptyState>;
  }

  const message = [
    "Lista de compras Triada:",
    ...items.map((item) =>
      item.amount > 0
        ? `- ${item.ingredient.name}: ${formatQty(item.amount, item.ingredient.unit)}`
        : `- ${item.ingredient.name}`,
    ),
  ].join("\n");

  return (
    <>
      <p className="text-[13px] text-suave">Calculada con los mínimos de cada ingrediente y los pedidos pendientes.</p>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item.ingredient.id} className="caja flex flex-col gap-2.5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] font-bold text-choco">{item.ingredient.name}</span>
                {item.forRecipes.length > 0 && (
                  <span className="text-[13px]">para {item.forRecipes.join(", ")}</span>
                )}
              </div>
              <StatusChip status={item.status} />
            </div>
            <form action={addPurchase.bind(null, item.ingredient.id)} className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`buy-${item.ingredient.id}`}>
                Cantidad comprada de {item.ingredient.name}
              </label>
              <input
                id={`buy-${item.ingredient.id}`}
                name="amount"
                inputMode="decimal"
                defaultValue={item.amount > 0 ? String(Math.ceil(item.amount)) : ""}
                placeholder="Cantidad"
                className="campo min-h-11 w-28 py-2"
              />
              <span className="text-sm font-medium">{item.ingredient.unit}</span>
              <SubmitButton className="btn-choco ml-auto min-h-11 px-4 text-sm" pendingText="Sumando…">
                Ya compré
              </SubmitButton>
            </form>
          </li>
        ))}
      </ul>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noreferrer"
        className="btn-borde"
      >
        <MessageIcon />
        Compartir por WhatsApp
      </a>
    </>
  );
}
