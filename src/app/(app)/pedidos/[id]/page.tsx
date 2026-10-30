import Link from "next/link";
import { notFound } from "next/navigation";
import { addPayment, deleteOrder, markDelivered, markPending } from "@/actions/orders";
import { CheckIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { CookieThumb, PageHeader } from "@/components/ui";
import { getOrder, orderBalance, orderTotal } from "@/lib/data";
import { formatDayLabel, formatMoney, formatTime } from "@/lib/format";

export default async function OrderPage({ params }: PageProps<"/pedidos/[id]">) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const total = orderTotal(order);
  const balance = orderBalance(order);
  const delivered = order.status === "entregado";

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="min-w-0 grow">
          <PageHeader title={order.customer_name} back="/pedidos" />
        </div>
        <span className={`chip shrink-0 ${delivered ? "bg-[#E3F1E4] text-[#1E5A2B]" : "bg-poco text-choco"}`}>
          {delivered ? "Entregado" : "Pendiente"}
        </span>
      </div>
      {order.due_at && (
        <p className="-mt-2 pl-14 text-sm text-suave">
          {formatDayLabel(order.due_at)} · {formatTime(order.due_at)}
        </p>
      )}

      <div className="tarjeta flex flex-col px-3.5 pt-1.5 pb-3">
        {order.order_items.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 py-2.5 ${index === order.order_items.length - 1 ? "border-b-2 border-choco" : "border-b border-dashed border-[#C9AFA9]"}`}
          >
            <CookieThumb
              src={item.recipe?.image_url ?? null}
              color={item.recipe?.color ?? "#3F1208"}
              alt=""
              size={44}
              className="rounded-xl"
            />
            <span className="grow text-[15px] font-bold">
              {item.quantity} × {item.recipe?.name ?? "Galleta"}
            </span>
            <span className="text-[15px] font-bold">{formatMoney(item.quantity * item.unit_price)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2.5 text-[15px]">
          <span>Total</span>
          <span className="font-display text-xl">{formatMoney(total)}</span>
        </div>
        <div className="flex justify-between pt-1 text-[15px] text-suave">
          <span>Pagado</span>
          <span>{formatMoney(order.paid_amount)}</span>
        </div>
        <div className="flex justify-between pt-1 text-[15px] font-bold">
          <span>Falta por pagar</span>
          <span>{formatMoney(balance)}</span>
        </div>
      </div>

      {order.notes && (
        <p className="rounded-[20px] bg-rosa px-4 py-3 text-sm whitespace-pre-line text-rosa-texto">
          <strong>Notas:</strong> {order.notes}
        </p>
      )}

      {balance > 0 && (
        <form action={addPayment.bind(null, order.id)} className="flex flex-col gap-2 rounded-3xl bg-rosa px-4 py-3.5">
          <label htmlFor="amount" className="text-sm font-bold">
            Registrar pago
          </label>
          <div className="flex gap-2">
            <input id="amount" name="amount" inputMode="numeric" defaultValue={String(balance)} className="campo min-w-0 grow" />
            <SubmitButton className="btn-choco" pendingText="…">
              Guardar
            </SubmitButton>
          </div>
        </form>
      )}

      {delivered ? (
        <form action={markPending.bind(null, order.id)}>
          <SubmitButton className="btn-borde w-full">Devolver a pendientes</SubmitButton>
        </form>
      ) : (
        <form action={markDelivered.bind(null, order.id)}>
          <SubmitButton className="btn-grande" pendingText="Guardando…">
            <CheckIcon size={22} />
            Marcar entregado
          </SubmitButton>
        </form>
      )}

      <div className="flex gap-2.5">
        <Link href={`/pedidos/${order.id}/editar`} className="btn-borde grow">
          Editar
        </Link>
        <form action={deleteOrder.bind(null, order.id)} className="flex grow">
          <SubmitButton className="btn-borde grow" confirm={`¿Borrar el pedido de ${order.customer_name}?`}>
            Borrar pedido
          </SubmitButton>
        </form>
      </div>
    </>
  );
}
