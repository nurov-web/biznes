/** Санаи маҳаллӣ YYYY-MM-DD — бе UTC, то рӯзи соҳибкор хато нашавад. */
export function localDateKey(value = new Date()): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftDateKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function lastDays(count: number, from = new Date()): string[] {
  const today = localDateKey(from);
  return Array.from({ length: count }, (_, i) => shiftDateKey(today, i - (count - 1)));
}
