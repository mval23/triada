import { orderBalance } from "@/lib/orders";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

export function PayChip({ order }: { order: Order }) {
  const balance = orderBalance(order);
  if (balance === 0) {
    return <span className="chip bg-[#E3F1E4] px-2.5 py-[3px] text-xs text-[#1E5A2B]">Pagó</span>;
  }
  if (order.paid_amount > 0) {
    return <span className="chip bg-poco px-2.5 py-[3px] text-xs text-choco">Abonó {formatMoney(order.paid_amount)}</span>;
  }
  return <span className="chip bg-choco px-2.5 py-[3px] text-xs text-crema">Debe {formatMoney(balance)}</span>;
}
