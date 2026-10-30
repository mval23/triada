import { createOrder } from "@/actions/orders";
import { PageHeader } from "@/components/ui";
import { getKnownPeople, getRecipes } from "@/lib/data";
import { todayKey } from "@/lib/format";
import { OrderForm } from "./order-form";

export default async function NewOrderPage() {
  const [recipes, people] = await Promise.all([getRecipes(), getKnownPeople()]);

  return (
    <>
      <PageHeader title="Nuevo pedido" back="/pedidos" />
      <OrderForm
        action={createOrder}
        people={people}
        today={todayKey()}
        flavors={recipes.map((r) => ({ id: r.id, name: r.name, price: r.price, color: r.color, image_url: r.image_url }))}
      />
    </>
  );
}
