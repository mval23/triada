import { notFound, redirect } from "next/navigation";
import { updateOrderDetails } from "@/actions/orders";
import { SubmitButton } from "@/components/submit-button";
import { Field, PageHeader } from "@/components/ui";
import { getOrder } from "@/lib/data";
import { bogotaDateInput, bogotaTimeInput } from "@/lib/format";

export default async function EditOrderPage({ params }: PageProps<"/pedidos/[id]/editar">) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  async function save(formData: FormData) {
    "use server";
    await updateOrderDetails(id, formData);
    redirect(`/pedidos/${id}`);
  }

  return (
    <>
      <PageHeader title="Editar pedido" back={`/pedidos/${order.id}`} />
      <form action={save} className="caja flex flex-col gap-3.5">
        <Field label="¿Para quién?">
          <input name="customer_name" required defaultValue={order.customer_name} className="campo" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Día de entrega">
            <input name="due_date" type="date" defaultValue={bogotaDateInput(order.due_at)} className="campo" />
          </Field>
          <Field label="Hora">
            <input name="due_time" type="time" defaultValue={bogotaTimeInput(order.due_at)} className="campo" />
          </Field>
        </div>
        <Field label="Notas">
          <textarea name="notes" rows={3} defaultValue={order.notes ?? ""} className="campo" />
        </Field>
        <p className="text-[13px]">Para cambiar las galletas, borra el pedido y créalo de nuevo.</p>
        <SubmitButton className="btn-grande" pendingText="Guardando…">
          Guardar cambios
        </SubmitButton>
      </form>
    </>
  );
}
