/** Парчами кӯтоҳ: ивази забон, на боридани нав. */
let localeSwapUntil = 0;

export function markLocaleSwap(): void {
  localeSwapUntil = Date.now() + 2500;
}

export function isLocaleSwap(): boolean {
  return Date.now() < localeSwapUntil;
}
