export const PWA_OPEN_EVENT = "bp-pwa-open";
export const PWA_INSTALLED_EVENT = "bp-pwa-installed";
export const PWA_AVAILABLE_EVENT = "bp-pwa-available";
export const PWA_REMOVED_EVENT = "bp-pwa-removed";

const INSTALLED_KEY = "bp_pwa_installed";

export type PwaPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PwaBoot = { prompt: PwaPromptEvent | null };

declare global {
  interface Window {
    __bpPwa?: PwaBoot;
  }
}

/**
 * Пеш аз React: Chrome beforeinstallprompt-ро намегузорад гум шавад.
 * Агар Chrome боз пешниҳод кунад — барнома нест, тугма бояд баргардад.
 */
export const PWA_BOOT_SCRIPT =
  '(function(){try{window.__bpPwa=window.__bpPwa||{prompt:null};window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__bpPwa.prompt=e;try{localStorage.removeItem("bp_pwa_installed")}catch(r){}window.dispatchEvent(new Event("bp-pwa-available"))});window.addEventListener("appinstalled",function(){window.__bpPwa.prompt=null;try{localStorage.setItem("bp_pwa_installed","1")}catch(r){}window.dispatchEvent(new Event("bp-pwa-installed"))});}catch(r){}})();';

function boot(): PwaBoot {
  if (!window.__bpPwa) window.__bpPwa = { prompt: null };
  return window.__bpPwa;
}

export function getDeferredPrompt(): PwaPromptEvent | null {
  if (typeof window === "undefined") return null;
  return boot().prompt;
}

export function rememberDeferredPrompt(event: PwaPromptEvent): void {
  event.preventDefault();
  boot().prompt = event;
  clearInstalledFlag();
  window.dispatchEvent(new Event(PWA_AVAILABLE_EVENT));
}

function dropDeferredPrompt(): void {
  if (typeof window === "undefined") return;
  boot().prompt = null;
}

export function isIosSafari(): boolean {
  return isIosDevice();
}

/** iPhone/iPad — насб танҳо аз Share → Add to Home Screen. */
export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  if (/iphone|ipod/i.test(ua)) return true;
  if (/ipad/i.test(ua)) return true;
  return window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
}

/** Telegram, Instagram, Facebook — насби PWA кор намекунад. */
export function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /FBAN|FBAV|Instagram|Line\/|Twitter|Snapchat|TikTok|Bytedance|Telegram|WhatsApp/i.test(ua);
}

/** Оё ҳоло дохили барномаи насбшуда ҳастед (на браузер). */
export function isStandaloneApp(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: minimal-ui)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

function storageInstalled(): boolean {
  try {
    return localStorage.getItem(INSTALLED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Тугмаро нишон диҳем? Не — агар дохили барнома бошем ё Chrome бигӯяд насб шудааст. */
export function shouldOfferInstall(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandaloneApp()) return false;
  if (getDeferredPrompt()) return true;
  if (isIosDevice()) return true;
  return !storageInstalled();
}

export function isPwaInstalled(): boolean {
  return !shouldOfferInstall();
}

/** Пас аз скачат — тугма нест. */
export function markPwaInstalled(): void {
  if (typeof window === "undefined") return;
  dropDeferredPrompt();
  let changed = true;
  try {
    if (localStorage.getItem(INSTALLED_KEY) === "1") changed = false;
    else localStorage.setItem(INSTALLED_KEY, "1");
  } catch {
    /* UI still updates */
  }
  if (changed) window.dispatchEvent(new Event(PWA_INSTALLED_EVENT));
}

/** Chrome боз пешниҳод кард ё барнома нест шуд — тугма боз. */
export function clearInstalledFlag(): void {
  if (typeof window === "undefined") return;
  let had = false;
  try {
    had = localStorage.getItem(INSTALLED_KEY) === "1";
    localStorage.removeItem(INSTALLED_KEY);
  } catch {
    return;
  }
  if (had) window.dispatchEvent(new Event(PWA_REMOVED_EVENT));
}

/** Chrome: барнома дар телефон ҳаст ё нест шуд. */
export async function detectInstalledPwa(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (isStandaloneApp()) {
    markPwaInstalled();
    return true;
  }
  if (getDeferredPrompt()) {
    clearInstalledFlag();
    return false;
  }
  if (isIosDevice()) return false;
  const nav = window.navigator as Navigator & {
    getInstalledRelatedApps?: () => Promise<{ platform: string }[]>;
  };
  if (!nav.getInstalledRelatedApps) return storageInstalled();
  try {
    const apps = await nav.getInstalledRelatedApps();
    if (apps.length > 0) {
      markPwaInstalled();
      return true;
    }
    clearInstalledFlag();
    return false;
  } catch {
    return storageInstalled();
  }
}

export function subscribeInstallButton(listener: (show: boolean) => void): () => void {
  const emit = () => listener(shouldOfferInstall());
  const refresh = () => {
    emit();
    void detectInstalledPwa().then(emit);
  };
  refresh();
  window.addEventListener(PWA_AVAILABLE_EVENT, emit);
  window.addEventListener(PWA_INSTALLED_EVENT, emit);
  window.addEventListener(PWA_REMOVED_EVENT, emit);
  window.addEventListener("appinstalled", emit);
  window.addEventListener("pageshow", refresh);
  document.addEventListener("visibilitychange", refresh);
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", emit);
  return () => {
    window.removeEventListener(PWA_AVAILABLE_EVENT, emit);
    window.removeEventListener(PWA_INSTALLED_EVENT, emit);
    window.removeEventListener(PWA_REMOVED_EVENT, emit);
    window.removeEventListener("appinstalled", emit);
    window.removeEventListener("pageshow", refresh);
    document.removeEventListener("visibilitychange", refresh);
    media.removeEventListener("change", emit);
  };
}

export type PwaInstallResult = "installed" | "prompted" | "guide";

/** Тугмаи Скачат: prompt-и Chrome, вагарна дастур. */
export async function requestPwaInstall(): Promise<PwaInstallResult> {
  if (typeof window === "undefined") return "guide";
  if (isStandaloneApp()) return "installed";
  const event = getDeferredPrompt();
  if (event) {
    await event.prompt();
    const choice = await event.userChoice;
    dropDeferredPrompt();
    if (choice.outcome === "accepted") {
      markPwaInstalled();
      return "installed";
    }
    return "prompted";
  }
  window.dispatchEvent(new Event(PWA_OPEN_EVENT));
  return "guide";
}

/** Аз Telegram/Instagram ба Chrome. */
export function openInSystemBrowser(): void {
  if (typeof window === "undefined") return;
  const { href, host, pathname, search, hash } = window.location;
  if (/android/i.test(window.navigator.userAgent)) {
    const fallback = encodeURIComponent(href);
    window.location.href = `intent://${host}${pathname}${search}${hash}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}
