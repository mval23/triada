// Todo se muestra en hora de Colombia, sin importar dónde corra el servidor.
export const TIME_ZONE = "America/Bogota";
const BOGOTA_OFFSET = "-05:00";

const pesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatMoney(value: number) {
  return pesos.format(value).replace(/\s/g, "");
}

export function formatQty(value: number, unit: string) {
  const n = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(value);
  return `${n} ${unit}`;
}

export function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date(iso));
}

export function todayKey() {
  return dayKey(new Date().toISOString());
}

/** El día (YYYY-MM-DD, hora de Bogotá) dentro de `days` días. */
export function dayKeyFromToday(days: number) {
  return dayKey(new Date(Date.now() + days * 86_400_000).toISOString());
}

export function olderThanDays(iso: string, days: number) {
  return Date.now() - Date.parse(iso) > days * 86_400_000;
}

export function formatDayLabel(iso: string) {
  const key = dayKey(iso);
  const today = todayKey();
  const tomorrow = dayKey(new Date(Date.now() + 86_400_000).toISOString());
  const label = new Intl.DateTimeFormat("es-CO", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
  if (key === today) return `Hoy · ${label}`;
  if (key === tomorrow) return `Mañana · ${label}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatLongToday() {
  const label = new Intl.DateTimeFormat("es-CO", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function daysAgo(iso: string) {
  const days = Math.round(
    (Date.parse(todayKey()) - Date.parse(dayKey(iso))) / 86_400_000,
  );
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}

/** Une los campos de fecha y hora de un formulario en un instante con zona de Bogotá. */
export function toBogotaIso(date: string, time: string) {
  if (!date) return null;
  return new Date(`${date}T${time || "12:00"}:00${BOGOTA_OFFSET}`).toISOString();
}

export function bogotaDateInput(iso: string | null) {
  return iso ? dayKey(iso) : "";
}

export function bogotaTimeInput(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}
