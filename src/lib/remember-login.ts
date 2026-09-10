/** Калиди Gmail дар браузер — бе парол. */
export const REMEMBER_LOGIN_KEY = "bp_saved_login";

export function saveRememberedLogin(login: string): void {
  const value = login.trim();
  if (!value || typeof window === "undefined") return;
  try {
    localStorage.setItem(REMEMBER_LOGIN_KEY, value);
  } catch {
    /* холӣ */
  }
}

export function readRememberedLogin(): string {
  if (typeof window === "undefined") return "";
  try {
    const local = localStorage.getItem(REMEMBER_LOGIN_KEY)?.trim() ?? "";
    if (local) return local;
  } catch {
    /* холӣ */
  }
  const match = document.cookie.match(/(?:^|; )bp_login=([^;]*)/);
  if (!match?.[1]) return "";
  try {
    return decodeURIComponent(match[1]).trim();
  } catch {
    return "";
  }
}
