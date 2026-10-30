import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import { PlusIcon } from "@/components/icons";
import { CookieThumb } from "@/components/ui";
import {
  getIngredients,
  getOpenDebts,
  getOrders,
  getRecipes,
  getUnpaidDeliveredOrders,
  orderBalance,
  orderCookieCount,
  orderSummary,
  orderTotal,
} from "@/lib/data";
import {
  dayKey,
  dayKeyFromToday,
  formatDayLabel,
  formatLongToday,
  formatMoney,
  formatTime,
  todayKey,
} from "@/lib/format";
import { shoppingList } from "@/lib/stock";

export default async function HomePage() {
  const [pending, ingredients, recipes, unpaid, debts] = await Promise.all([
    getOrders("pendiente"),
    getIngredients(),
    getRecipes(),
    getUnpaidDeliveredOrders(),
    getOpenDebts(),
  ]);

  const weekEnd = dayKeyFromToday(7);
  const thisWeek = pending.filter((order) => !order.due_at || dayKey(order.due_at) <= weekEnd);
  const cookies = thisWeek.reduce((sum, order) => sum + orderCookieCount(order), 0);

  const owed = unpaid.reduce((sum, order) => sum + orderBalance(order), 0) + debts.reduce((s, d) => s + d.amount, 0);
  const people = new Set([
    ...unpaid.map((order) => order.customer_name.trim().toLowerCase()),
    ...debts.map((debt) => debt.person.trim().toLowerCase()),
  ]).size;

  const shopping = shoppingList(ingredients, recipes, pending);
  const today = todayKey();
  const next = pending.find((order) => order.due_at && dayKey(order.due_at) >= today) ?? pending[0];
  const nextCover = next?.order_items[0]?.recipe;

  return (
    <>
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-suave">{formatLongToday()}</span>
          <h1 className="titulo text-4xl">¡Hola, Triada!</h1>
        </div>
        <Image src="/logo-marron.png" alt="Triada" width={64} height={66} priority />
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/pedidos" className="flex flex-col gap-1 rounded-3xl bg-choco p-4 text-crema">
          <span className="text-[13px] font-medium">Pedidos esta semana</span>
          <span className="font-display text-[40px] leading-none">{thisWeek.length}</span>
          <span className="text-[13px]">
            {cookies} {cookies === 1 ? "galleta" : "galletas"} por hornear
          </span>
        </Link>
        <Link href="/deudas" className="flex flex-col gap-1 rounded-3xl bg-rosa p-4 text-rosa-texto">
          <span className="text-[13px] font-medium">Te deben</span>
          <span className="font-display text-[30px] leading-[1.15]">{formatMoney(owed)}</span>
          <span className="text-[13px]">
            {people === 0 ? "nadie, ¡qué bien!" : `entre ${people} ${people === 1 ? "persona" : "personas"}`}
          </span>
        </Link>
      </div>

      <section className="caja flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="subtitulo">Te falta comprar</h2>
          <span className="text-[13px] font-bold">
            {shopping.length} de {ingredients.length}
          </span>
        </div>
        {shopping.length === 0 ? (
          <p className="text-[15px]">Tienes todo lo necesario para los pedidos pendientes.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {shopping.slice(0, 6).map((item) => (
              <span
                key={item.ingredient.id}
                className={`rounded-full px-3.5 py-[7px] text-sm font-medium ${item.status === "falta" ? "bg-choco text-crema" : "bg-crema text-rosa-texto"}`}
              >
                {item.ingredient.name}
                {item.status === "poco" ? " (poco)" : ""}
              </span>
            ))}
            {shopping.length > 6 && (
              <span className="rounded-full px-1 py-[7px] text-sm font-medium">+{shopping.length - 6} más</span>
            )}
          </div>
        )}
        <Link href="/stock?vista=compras" className="self-start text-sm font-bold text-choco">
          Ver lista de compras →
        </Link>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="subtitulo text-tinta">Próximo pedido</h2>
        {next ? (
          <Link href={`/pedidos/${next.id}`} className="tarjeta flex items-center gap-3.5 px-4 py-3.5">
            <CookieThumb src={nextCover?.image_url ?? null} color={nextCover?.color ?? "#3F1208"} alt="" />
            <div className="flex min-w-0 grow flex-col gap-0.5">
              <span className="font-bold">
                {next.customer_name}
                {next.due_at && ` · ${formatDayLabel(next.due_at).split(" · ")[0]} ${formatTime(next.due_at)}`}
              </span>
              <span className="truncate text-sm text-suave">{orderSummary(next)}</span>
              <span className="text-[13px] font-bold text-rosa-texto">
                {orderBalance(next) > 0
                  ? `Pendiente de pago · ${formatMoney(orderBalance(next))}`
                  : `Pagado · ${formatMoney(orderTotal(next))}`}
              </span>
            </div>
          </Link>
        ) : (
          <p className="caja text-[15px]">No hay pedidos pendientes.</p>
        )}
      </section>

      <Link href="/pedidos/nuevo" className="btn-grande mt-2">
        <PlusIcon size={22} />
        Nuevo pedido
      </Link>

      <form action={signOut} className="mt-2 text-center">
        <button type="submit" className="cursor-pointer text-sm font-medium text-suave underline">
          Cerrar sesión
        </button>
      </form>
    </>
  );
}
