import type { Order } from "./types";

export function orderTotal(order: Order) {
  return order.order_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
}

export function orderBalance(order: Order) {
  return Math.max(0, orderTotal(order) - order.paid_amount);
}

export function orderCookieCount(order: Order) {
  return order.order_items.reduce((sum, item) => sum + item.quantity, 0);
}

export function orderSummary(order: Order) {
  return order.order_items
    .map((item) => `${item.quantity} ${item.recipe?.name ?? "galleta"}`)
    .join(" · ");
}
