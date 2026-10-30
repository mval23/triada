import { createIngredient } from "@/actions/stock";
import { PageHeader } from "@/components/ui";
import { IngredientForm } from "../ingredient-form";

export default function NewIngredientPage() {
  return (
    <>
      <PageHeader title="Nuevo ingrediente" back="/stock" />
      <IngredientForm action={createIngredient} submitLabel="Guardar" />
    </>
  );
}
