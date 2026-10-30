import { createRecipe } from "@/actions/recipes";
import { PageHeader } from "@/components/ui";
import { RecipeForm } from "../recipe-form";

export default function NewRecipePage() {
  return (
    <>
      <PageHeader title="Nueva receta" back="/recetas" />
      <RecipeForm action={createRecipe} submitLabel="Crear y anotar ingredientes" />
    </>
  );
}
