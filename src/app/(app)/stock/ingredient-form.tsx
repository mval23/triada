import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";
import type { Ingredient } from "@/lib/types";

const UNITS = ["g", "kg", "ml", "l", "und", "cdta", "paquete"];

export function IngredientForm({
  action,
  ingredient,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  ingredient?: Ingredient;
  submitLabel: string;
}) {
  return (
    <form action={action} className="caja flex flex-col gap-4">
      <Field label="Nombre">
        <input name="name" required defaultValue={ingredient?.name} className="campo" placeholder="Ej. Mantequilla" />
      </Field>
      <Field label="Unidad">
        <select name="unit" defaultValue={ingredient?.unit ?? "g"} className="campo">
          {UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tienes">
          <input
            name="quantity"
            inputMode="decimal"
            defaultValue={ingredient ? String(ingredient.quantity) : "0"}
            className="campo"
          />
        </Field>
        <Field label="Mínimo">
          <input
            name="min_quantity"
            inputMode="decimal"
            defaultValue={ingredient ? String(ingredient.min_quantity) : "0"}
            className="campo"
          />
        </Field>
      </div>
      <p className="text-[13px]">Cuando tengas menos que el mínimo, aparecerá en la lista de compras.</p>
      <SubmitButton className="btn-grande" pendingText="Guardando…">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
