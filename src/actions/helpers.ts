import { revalidatePath } from "next/cache";

export function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function optionalText(formData: FormData, key: string) {
  return text(formData, key) || null;
}

/** Acepta "2,5" y "2.5"; ignora puntos de miles en montos como "54.000". */
export function number(formData: FormData, key: string, { money = false } = {}) {
  let raw = text(formData, key).replace(/\s|\$/g, "");
  if (money) raw = raw.replace(/[.,]/g, "");
  else raw = raw.replace(",", ".");
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

export function check(error: { message: string } | null, what: string) {
  if (error) throw new Error(`No se pudo ${what}: ${error.message}`);
}

export function refreshAll() {
  revalidatePath("/", "layout");
}
