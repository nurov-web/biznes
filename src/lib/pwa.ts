export const PWA_OPEN_EVENT = "bp-pwa-open";

/** Оё барнома аллакай насб шудааст (бе браузер). */
export function isStandaloneApp(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

/** Панели насбро кушоед ё prompt-и Chrome-ро занед. */
export function requestPwaInstall(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PWA_OPEN_EVENT));
}
