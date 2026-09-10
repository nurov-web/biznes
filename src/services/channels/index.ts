/**
 * Каналҳои бизнес: Telegram, Instagram, сайт, барнома, дӯкони офлайн.
 * Фармоиш худ намеояд — танҳо силка барои ҳисобот ва ёд.
 */
import { newId, nowIso, withDb, type ChannelKind, type ChannelLinkRow } from "@/lib/store";
import { normalizeChannelUrl } from "@/lib/channel-url";

export async function listChannels(businessId: string): Promise<ChannelLinkRow[]> {
  return withDb((db) => db.channelLinks.filter((row) => row.businessId === businessId));
}

export async function upsertChannel(
  businessId: string,
  kind: ChannelKind,
  raw: string,
): Promise<{ ok: true; row: ChannelLinkRow } | { ok: false; error: "bad_url" }> {
  const url = normalizeChannelUrl(kind, raw);
  if (!url) return { ok: false, error: "bad_url" };
  return withDb((db) => {
    const existing = db.channelLinks.find((row) => row.businessId === businessId && row.kind === kind);
    if (existing) {
      existing.url = url;
      return { ok: true as const, row: existing };
    }
    const row: ChannelLinkRow = {
      id: newId(),
      businessId,
      kind,
      url,
      createdAt: nowIso(),
    };
    db.channelLinks.push(row);
    return { ok: true as const, row };
  });
}

export async function removeChannel(businessId: string, id: string): Promise<boolean> {
  return withDb((db) => {
    const i = db.channelLinks.findIndex((row) => row.id === id && row.businessId === businessId);
    if (i < 0) return false;
    db.channelLinks.splice(i, 1);
    return true;
  });
}
