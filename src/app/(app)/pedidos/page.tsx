import Link from "next/link";
import { markDelivered } from "@/actions/orders";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { PayChip } from "@/components/pay-chip";
import { SubmitButton } from "@/components/submit-button";
import { CookieThumb, EmptyState, PageHeader } from "@/components/ui";
import { getOrders, orderSummary, orderTotal } from "@/lib/data";
import { dayKey, formatDayLabel, formatMoney, formatTime } from "@/lib/format";
import type { Order } from "@/lib/types";

export default async function OrdersPage({ searchParams }: PageProps<"/pedidos">) {
  const { ver } = await searchParams;
  const delivered = ver === "entregados";
  const [pending, done] = await Promise.all([
    getOrders("pendiente"),
    delivered ? getOrders("entregado") : Promise.resolve([] as Order[]),
  ]);
  const orders = delivered ? done : pending;
  const groups = groupByDay(orders, delivered);

  return (
    <>
      <PageHeader
        title="Pedidos"
        action={
          <Link href="/pedidos/nuevo" className="btn-choco px-[18px]">
            <PlusIcon size={18} strokeWidth={2.4} />
            Nuevo
          </Link>
        }
      />

      <div role="tablist" aria-label="Estado" className="grid grid-cols-2 rounded-full bg-rosa p-1">
        <Link
          href="/pedidos"
          role="tab"
          aria-selected={!delivered}
          className={`flex h-10 items-center justify-center rounded-full text-sm ${!delivered ? "bg-choco font-bold text-crema" : "font-medium text-rosa-texto"}`}
        >
          Pendientes · {pending.length}
        </Link>
        <Link
          href="/pedidos?ver=entregados"
          role="tab"
          aria-selected={delivered}
          className={`flex h-10 items-center justify-center rounded-full text-sm ${delivered ? "bg-choco font-bold text-crema" : "font-medium text-rosa-texto"}`}
        >
          Entregados
        </Link>
      </div>

      {groups.length === 0 ? (
        <EmptyState>{delivered ? "Todavía no hay pedidos entregados." : "No hay pedidos pendientes."}</EmptyState>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="flex flex-col gap-2">
            <h2 className="font-display text-[19px] text-tinta">{group.label}</h2>
            {group.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </section>
        ))
      )}
    </>
  );
}

function OrderCard({ order }: { order: Order }) {
  const cover = order.order_items[0]?.recipe;
  return (
    <div className="tarjeta flex items-center gap-3 py-2.5 pr-2.5 pl-3">
      <Link href={`/pedidos/${order.id}`} className="flex min-w-0 grow items-center gap-3">
        <CookieThumb src={cover?.image_url ?? null} color={cover?.color ?? "#3F1208"} alt="" size={52} className="rounded-[14px]" />
        <span className="flex min-w-0 grow flex-col gap-[3px]">
          <span className="flex justify-between gap-2">
            <span className="truncate font-bold">{order.customer_name}</span>
            <span className="shrink-0 text-[15px] font-bold">{formatMoney(orderTotal(order))}</span>
          </span>
          <span className="truncate text-[13px] text-suave">{orderSummary(order)}</span>
          <span className="flex items-center gap-1.5">
            <PayChip order={order} />
            <span className="text-xs text-suave">
              {order.status === "entregado" ? "Entregado" : order.due_at ? formatTime(order.due_at) : ""}
            </span>
          </span>
        </span>
      </Link>
      {order.status === "pendiente" && (
        <form action={markDelivered.bind(null, order.id)}>
          <SubmitButton
            aria-label={`Marcar como entregado el pedido de ${order.customer_name}`}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-choco bg-crema disabled:opacity-50"
          >
            <CheckIcon />
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

function groupByDay(orders: Order[], delivered: boolean) {
  const groups: { key: string; label: string; orders: Order[] }[] = [];
  for (const order of orders) {
    const iso = delivered ? order.delivered_at : order.due_at;
    const key = iso ? dayKey(iso) : "sin-fecha";
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, label: iso ? formatDayLabel(iso) : "Sin fecha", orders: [] };
      groups.push(group);
    }
    group.orders.push(order);
  }
  return groups;
}
