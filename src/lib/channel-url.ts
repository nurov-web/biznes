import { CHANNEL_KINDS, type ChannelKind } from "@/constants/channels";
import { isBlockedHost, normalizeStoreUrl } from "@/lib/store-url";

export { CHANNEL_KINDS, type ChannelKind };

function asHttps(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 300) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProto);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isBlockedHost(url.hostname)) return null;
    url.hash = "";
    url.username = "";
    url.password = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** Силкаи канал: t.me, Instagram, сайт. Офлайн — матн. */
export function normalizeChannelUrl(kind: ChannelKind, raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (kind === "offline") {
    return trimmed.slice(0, 120);
  }

  if (kind === "telegram") {
    const stripped = trimmed.replace(/^@/, "");
    const fromUrl = stripped.replace(/^https?:\/\//i, "").replace(/^(www\.)?(t\.me|telegram\.me)\//i, "");
    const name = (fromUrl.split(/[/?#]/)[0] ?? "").trim();
    if (/^[a-zA-Z0-9_]{3,32}$/.test(name)) {
      return `https://t.me/${name}`;
    }
    return asHttps(trimmed);
  }

  if (kind === "instagram") {
    const handle = trimmed
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .split(/[/?#]/)[0];
    if (handle && /^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
      return `https://instagram.com/${handle}`;
    }
    return asHttps(trimmed);
  }

  return normalizeStoreUrl(trimmed) ?? asHttps(trimmed);
}
