export const PWA_OPEN_EVENT = "bp-pwa-open";
export const PWA_INSTALLED_EVENT = "bp-pwa-installed";
export const PWA_AVAILABLE_EVENT = "bp-pwa-available";

const INSTALLED_KEY = "bp_pwa_installed";

export function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/** Оё барнома аллакай насб шудааст (бе браузер ё пас аз скачат). */
export function isStandaloneApp(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

export function isPwaInstalled(): boolean {
  if (isStandaloneApp()) return true;
  try {
    return localStorage.getItem(INSTALLED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Пас аз насб — тугмаи Насб дигар намояд. */
export function markPwaInstalled(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(INSTALLED_KEY) === "1") return;
    localStorage.setItem(INSTALLED_KEY, "1");
  } catch {
    return;
  }
  window.dispatchEvent(new Event(PWA_INSTALLED_EVENT));
}

/** Chrome: барнома аллакай дар телефон аст, аммо ҳоло дар браузер ҳастед. */
export async function detectInstalledPwa(): Promise<boolean> {
  if (isPwaInstalled()) return true;
  const nav = window.navigator as Navigator & {
    getInstalledRelatedApps?: () => Promise<{ platform: string }[]>;
  };
  if (!nav.getInstalledRelatedApps) return false;
  try {
    const apps = await nav.getInstalledRelatedApps();
    if (apps.length > 0) {
      markPwaInstalled();
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/** Панели насбро кушоед ё prompt-и Chrome-ро занед. */
export function requestPwaInstall(): void {
  if (typeof window === "undefined") return;
  if (isPwaInstalled()) return;
  window.dispatchEvent(new Event(PWA_OPEN_EVENT));
}
