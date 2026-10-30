"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { CookieThumb } from "@/components/ui";
import { formatMoney } from "@/lib/format";

type Flavor = { id: string; name: string; price: number; color: string; image_url: string | null };

export function OrderForm({
  action,
  flavors,
  people,
  today,
}: {
  action: (formData: FormData) => Promise<void>;
  flavors: Flavor[];
  people: string[];
  today: string;
}) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const count = Object.values(qty).reduce((sum, n) => sum + n, 0);
  const total = flavors.reduce((sum, f) => sum + (qty[f.id] ?? 0) * f.price, 0);

  function change(id: string, delta: number) {
    setQty((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + delta) }));
  }

  return (
    <form action={action} className="flex flex-col gap-3.5">
      <div className="caja flex flex-col gap-3.5">
        <label className="block">
          <span className="etiqueta">¿Para quién?</span>
          <input name="customer_name" required list="people" autoComplete="off" placeholder="Nombre" className="campo" />
          <datalist id="people">
            {people.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="etiqueta">Día de entrega</span>
            <input name="due_date" type="date" defaultValue={today} className="campo" />
          </label>
          <label className="block">
            <span className="etiqueta">Hora</span>
            <input name="due_time" type="time" className="campo" />
          </label>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="subtitulo text-tinta">Galletas</h2>
        <ul className="tarjeta flex flex-col px-3.5 py-1">
          {flavors.map((flavor) => {
            const n = qty[flavor.id] ?? 0;
            return (
              <li key={flavor.id} className="flex items-center gap-2.5 border-b border-dashed border-[#C9AFA9] py-2 last:border-b-0">
                <CookieThumb src={flavor.image_url} color={flavor.color} alt="" size={44} className="rounded-xl" />
                <span className="flex min-w-0 grow flex-col">
                  <span className="text-[15px] font-bold">{flavor.name}</span>
                  <span className="text-[13px] text-suave">
                    {flavor.price > 0 ? `${formatMoney(flavor.price)} c/u` : "sin precio"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => change(flavor.id, -1)}
                  aria-label={`Quitar una ${flavor.name}`}
                  className="size-10 shrink-0 cursor-pointer rounded-full border-2 border-choco bg-crema text-xl font-bold"
                >
                  −
                </button>
                <span className="w-7 text-center font-display text-xl" aria-live="polite">
                  {n}
                </span>
                <button
                  type="button"
                  onClick={() => change(flavor.id, 1)}
                  aria-label={`Agregar una ${flavor.name}`}
                  className="size-10 shrink-0 cursor-pointer rounded-full bg-choco text-xl font-bold text-crema"
                >
                  +
                </button>
                <input type="hidden" name={`qty_${flavor.id}`} value={n} />
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex items-center justify-between rounded-3xl bg-choco px-[18px] py-4 text-crema">
        <span className="flex flex-col gap-0.5 text-[13px]">
          <span className="font-medium">Total</span>
          <span>
            {count} {count === 1 ? "galleta" : "galletas"}
          </span>
        </span>
        <span className="font-display text-[32px]">{formatMoney(total)}</span>
      </div>

      <div className="caja flex flex-col gap-3.5">
        <label className="block">
          <span className="etiqueta">¿Ya pagó algo?</span>
          <input name="paid_amount" inputMode="numeric" placeholder="$0" className="campo" />
        </label>
        <label className="block">
          <span className="etiqueta">Notas</span>
          <textarea name="notes" rows={2} placeholder="Domicilio, dirección, empaque de regalo…" className="campo" />
        </label>
      </div>

      <SubmitButton className="btn-grande" pendingText="Guardando…" disabled={count === 0}>
        Guardar pedido
      </SubmitButton>
    </form>
  );
}
