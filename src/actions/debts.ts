"use server";

import { createClient } from "@/lib/supabase/server";
import { check, number, optionalText, refreshAll, text } from "./helpers";

export async function createDebt(formData: FormData) {
  const amount = number(formData, "amount", { money: true });
  if (amount <= 0) throw new Error("Escribe cuánto debe.");
  const supabase = await createClient();
  const { error } = await supabase.from("debts").insert({
    person: text(formData, "person"),
    amount,
    description: optionalText(formData, "description"),
  });
  check(error, "anotar la deuda");
  refreshAll();
}

export async function markDebtPaid(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("debts").update({ paid_at: new Date().toISOString() }).eq("id", id);
  check(error, "marcar la deuda como pagada");
  refreshAll();
}

/** Salda todo lo que debe una persona: sus deudas sueltas y el saldo de sus pedidos entregados. */
export async function settlePerson(debtIds: string[], orderIds: string[]) {
  const supabase = await createClient();
  if (debtIds.length > 0) {
    const { error } = await supabase.from("debts").update({ paid_at: new Date().toISOString() }).in("id", debtIds);
    check(error, "marcar las deudas como pagadas");
  }
  for (const id of orderIds) {
    const { data, error } = await supabase.from("order_items").select("quantity, unit_price").eq("order_id", id);
    check(error, "leer el pedido");
    const total = (data ?? []).reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
    const { error: updateError } = await supabase.from("orders").update({ paid_amount: total }).eq("id", id);
    check(updateError, "marcar el pedido como pagado");
  }
  refreshAll();
}
