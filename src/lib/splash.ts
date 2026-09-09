import { SPLASH_SESSION_KEY } from "@/constants";

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
