export const STORE_PLATFORMS = ["shopify", "woocommerce", "custom", "instagram"] as const;
export type StorePlatform = (typeof STORE_PLATFORMS)[number];
