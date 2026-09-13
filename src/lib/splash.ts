import { LOGOUT_FLAG, SPLASH_SESSION_KEY } from "@/constants";

/** Оё интро дар ин ҷаласа аллакай намоиш шуд. */
export function hasPlayedEntrySplash(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(SPLASH_SESSION_KEY) === "1";
  } catch {
    return true;
  }
}

export function markEntrySplashPlayed(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
  } catch {
    /* нигоҳдории маҳаллӣ дастрас нест */
  }
}

/** Пас аз баромад — дафъаи ояндаи вуруд дубора интро. */
export function clearEntrySplash(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SPLASH_SESSION_KEY);
  } catch {
    /* нигоҳдории маҳаллӣ дастрас нест */
  }
}

export function markLoggedOut(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LOGOUT_FLAG, "1");
  } catch {
    /* холӣ */
  }
}

/** Агар ҳоло баромада бошанд, худкор вуруд накунем. */
export function consumeLoggedOut(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const yes = window.sessionStorage.getItem(LOGOUT_FLAG) === "1";
    if (yes) window.sessionStorage.removeItem(LOGOUT_FLAG);
    return yes;
  } catch {
    return false;
  }
}
