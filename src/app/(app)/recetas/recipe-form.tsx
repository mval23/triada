import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";
import type { Recipe } from "@/lib/types";

const COLORS = ["#4A2A1E", "#E9C949", "#D8C3A5", "#2F2F35", "#8E1B2C", "#C98A3A", "#3F1208", "#7A8F3C"];

const PHOTOS = [
  { value: "", label: "Sin foto (solo color)" },
  { value: "/galletas/dark-chocolate.png", label: "Dark chocolate" },
  { value: "/galletas/lemon-cream-pie.png", label: "Lemon cream pie" },
  { value: "/galletas/mashmellow.png", label: "Mashmellow" },
  { value: "/galletas/oreo.png", label: "Oreo" },
  { value: "/galletas/red-velvet.png", label: "Red velvet" },
  { value: "/galletas/triada-cookies.png", label: "Triada cookies" },
];

export function RecipeForm({
  action,
  recipe,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  recipe?: Recipe;
  submitLabel: string;
}) {
  const color = recipe?.color ?? COLORS[0];
  return (
    <form action={action} className="caja flex flex-col gap-4">
      <Field label="Nombre">
        <input name="name" required defaultValue={recipe?.name} className="campo" placeholder="Ej. Red velvet" />
      </Field>
      <Field label="Descripción">
        <textarea name="description" rows={3} defaultValue={recipe?.description ?? ""} className="campo" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rinde (galletas)">
          <input name="yield" inputMode="numeric" defaultValue={String(recipe?.yield ?? 12)} className="campo" />
        </Field>
        <Field label="Precio por galleta">
          <input
            name="price"
            inputMode="numeric"
            defaultValue={recipe?.price ? String(recipe.price) : ""}
            placeholder="$"
            className="campo"
          />
        </Field>
      </div>
      <fieldset>
        <legend className="etiqueta">Color</legend>
        <div className="flex flex-wrap gap-2.5">
          {[...new Set([color, ...COLORS])].map((c) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="color" value={c} defaultChecked={c === color} className="peer sr-only" />
              <span
                className="block size-11 rounded-full border-2 border-white ring-2 ring-transparent peer-checked:ring-choco peer-focus-visible:ring-poco"
                style={{ background: c }}
              />
              <span className="sr-only">{c}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Foto">
        <select name="image_url" defaultValue={recipe?.image_url ?? ""} className="campo">
          {PHOTOS.map((photo) => (
            <option key={photo.value} value={photo.value}>
              {photo.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Preparación">
        <textarea
          name="steps"
          rows={8}
          defaultValue={recipe?.steps ?? ""}
          className="campo"
          placeholder={"1. Batir la mantequilla con el azúcar…\n2. …"}
        />
      </Field>
      <SubmitButton className="btn-grande" pendingText="Guardando…">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
