import { createDebt, settlePerson } from "@/actions/debts";
import { MessageIcon, PlusIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { EmptyState, PageHeader } from "@/components/ui";
import { getKnownPeople, getOpenDebts, getUnpaidDeliveredOrders, orderBalance, orderSummary } from "@/lib/data";
import { daysAgo, formatMoney, olderThanDays, TIME_ZONE } from "@/lib/format";

type Entry = { kind: "debt" | "order"; id: string; amount: number; date: string; text: string };
type Person = { name: string; total: number; oldest: string; entries: Entry[] };

const shortDate = new Intl.DateTimeFormat("es-CO", { timeZone: TIME_ZONE, day: "numeric", month: "short" });

export default async function DebtsPage() {
  const [debts, orders, known] = await Promise.all([getOpenDebts(), getUnpaidDeliveredOrders(), getKnownPeople()]);

  const entries: (Entry & { person: string })[] = [
    ...debts.map((debt) => ({
      kind: "debt" as const,
      id: debt.id,
      person: debt.person,
      amount: debt.amount,
      date: debt.created_at,
      text: debt.description ?? "Deuda anotada",
    })),
    ...orders.map((order) => {
      const date = order.delivered_at ?? order.created_at;
      return {
        kind: "order" as const,
        id: order.id,
        person: order.customer_name,
        amount: orderBalance(order),
        date,
        text: `Pedido del ${shortDate.format(new Date(date))} · ${orderSummary(order)}`,
      };
    }),
  ];

  const people = new Map<string, Person>();
  for (const entry of entries) {
    const key = entry.person.trim().toLowerCase();
    const person = people.get(key) ?? { name: entry.person.trim(), total: 0, oldest: entry.date, entries: [] };
    person.total += entry.amount;
    if (entry.date < person.oldest) person.oldest = entry.date;
    person.entries.push(entry);
    people.set(key, person);
  }
  const list = [...people.values()].sort((a, b) => a.oldest.localeCompare(b.oldest));
  const total = list.reduce((sum, p) => sum + p.total, 0);

  return (
    <>
      <PageHeader title="Quién debe" />

      <div className="flex flex-col gap-1 rounded-[28px] bg-choco px-5 py-[18px] text-crema">
        <span className="text-sm font-medium">Por cobrar</span>
        <span className="font-display text-[44px] leading-none">{formatMoney(total)}</span>
        <span className="text-sm">
          {list.length === 0
            ? "Nadie te debe nada."
            : `${list.length} ${list.length === 1 ? "persona" : "personas"} · la más antigua ${daysAgo(list[0].oldest)}`}
        </span>
      </div>

      <details className="group">
        <summary className="btn-borde w-full list-none [&::-webkit-details-marker]:hidden">
          <PlusIcon size={18} strokeWidth={2.4} />
          Anotar deuda
        </summary>
        <form action={createDebt} className="mt-3 flex flex-col gap-2.5 rounded-3xl bg-rosa px-4 py-3.5">
          <div className="grid grid-cols-[3fr_2fr] gap-2">
            <input name="person" required list="people" autoComplete="off" aria-label="Quién debe" placeholder="Nombre" className="campo" />
            <input name="amount" required inputMode="numeric" aria-label="Cuánto debe" placeholder="$" className="campo" />
          </div>
          <input name="description" aria-label="De qué es la deuda" placeholder="¿De qué? (opcional)" className="campo" />
          <datalist id="people">
            {known.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <SubmitButton className="btn-choco" pendingText="Anotando…">
            Anotar
          </SubmitButton>
        </form>
      </details>

      {list.length === 0 ? (
        <EmptyState>Cuando un pedido entregado quede sin pagar o anotes una deuda, aparecerá aquí.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {list.map((person) => (
            <PersonCard key={person.name.toLowerCase()} person={person} />
          ))}
        </ul>
      )}
    </>
  );
}

function PersonCard({ person }: { person: Person }) {
  const old = olderThanDays(person.oldest, 7);
  const detail =
    person.entries.length === 1
      ? `${person.entries[0].text} · ${daysAgo(person.oldest)}`
      : `${person.entries.length} cuentas · desde ${daysAgo(person.oldest)}`;
  const message = `Hola ${person.name}, te recuerdo que quedó pendiente ${formatMoney(person.total)} de tus galletas Triada. ¡Gracias!`;
  const debtIds = person.entries.filter((e) => e.kind === "debt").map((e) => e.id);
  const orderIds = person.entries.filter((e) => e.kind === "order").map((e) => e.id);

  return (
    <li className="flex flex-col gap-2 rounded-3xl bg-rosa py-3 pr-3 pl-3.5 text-rosa-texto">
      <div className="flex items-center gap-3">
        <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-choco font-display text-lg text-crema">
          {person.name.charAt(0).toUpperCase()}
        </span>
        <span className="flex min-w-0 grow flex-col">
          <span className="font-bold text-choco">{person.name}</span>
          <span className={`truncate text-[13px] ${old ? "font-bold text-choco" : ""}`}>{detail}</span>
        </span>
        <span className="font-display text-xl whitespace-nowrap text-choco">{formatMoney(person.total)}</span>
      </div>
      <div className="flex gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 grow items-center justify-center gap-1.5 rounded-full border-2 border-choco text-sm font-bold text-choco"
        >
          <MessageIcon size={16} />
          Recordar
        </a>
        <form action={settlePerson.bind(null, debtIds, orderIds)} className="flex grow">
          <SubmitButton
            className="h-10 grow cursor-pointer rounded-full bg-choco text-sm font-bold text-crema disabled:opacity-50"
            confirm={`¿${person.name} ya pagó ${formatMoney(person.total)}?`}
          >
            Ya pagó
          </SubmitButton>
        </form>
      </div>
    </li>
  );
}
