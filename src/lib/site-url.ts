/** Суроғаи ҷамъиятии сайт — барои sitemap, Open Graph, robots. */
const FALLBACK = "https://biznes-mu.vercel.app";

export function siteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }
  return FALLBACK;
}

export function isSecureCookie(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}
