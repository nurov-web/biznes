export const CHANNEL_KINDS = ["telegram", "instagram", "website", "app", "offline"] as const;
export type ChannelKind = (typeof CHANNEL_KINDS)[number];
