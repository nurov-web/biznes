/**
 * Аз JSON-и кушодаи ҳамон сайт рақам мегирад — бе тахмин.
 */

export type JsonMetrics = {
  sold: number | null;
  refused: number | null;
  complaints: number | null;
  reviews: number | null;
  rating: number | null;
  products: number | null;
  shops: number | null;
};

const SOLD_KEY =
  /^(sold|soldcount|soldqty|salescount|sales|orderscount|ordercount|purchasescount|purchasecount|buycount|completedorders|fulfilled|unitsold)$/i;
const REFUSED_KEY =
  /^(refused|refusecount|cancelled|canceled|cancelcount|cancellations|returned|returncount|returns|rejected|declined)$/i;
const COMPLAINT_KEY =
  /^(complaints|complaintcount|claims|claimcount|tickets|reports|disputes)$/i;
const REVIEW_KEY = /^(reviewcount|reviews|feedbacks|feedbackcount|ratingcount)$/i;
const PRODUCT_KEY = /^(products|productcount|itemcount|listings)$/i;
const SHOP_KEY = /^(sellers|shops|stores|vendors|sellercount)$/i;

function asInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const n = Math.round(value);
    if (n < 0 || n > 50_000_000) return null;
    return n;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const n = Number(value.trim());
    if (n < 0 || n > 50_000_000) return null;
    return n;
  }
  return null;
}

function take(current: number | null, next: number | null): number | null {
  if (next === null) return current;
  if (current === null) return next;
  return current + next;
}

function looksLikeProduct(row: Record<string, unknown>): boolean {
  return (
    (typeof row.name === "string" || typeof row.title === "string" || typeof row.slug === "string") &&
    (typeof row.price === "number" || typeof row.finalPrice === "number" || typeof row.stock === "number")
  );
}

function looksLikeOrder(row: Record<string, unknown>): boolean {
  if (row.moderationStatus !== undefined) return false;
  if (typeof row.orderNumber === "string" || typeof row.orderId === "string") return true;
  const status = row.status ?? row.orderStatus;
  if (typeof status !== "string" || !status) return false;
  return (
    "totalPrice" in row ||
    "grandTotal" in row ||
    "customerId" in row ||
    "paymentMethod" in row ||
    "payment" in row
  );
}

function looksLikeShop(row: Record<string, unknown>): boolean {
  return typeof row.shopName === "string" || typeof row.storeName === "string";
}

function orderBucket(status: string): "sold" | "refused" | "complaint" | null {
  const s = status.toLowerCase();
  if (/cancel|refus|return|reject|declin|отказ|бозгашт|отмен/.test(s)) return "refused";
  if (/complaint|claim|dispute|шикоят|жалоб/.test(s)) return "complaint";
  if (/deliver|complete|paid|done|fulfil|ship|success|sold|фурӯхт/.test(s)) return "sold";
  return null;
}

function walk(node: unknown, acc: JsonMetrics, depth: number): void {
  if (depth > 8 || node === null) return;
  if (Array.isArray(node)) {
    const productRows = node.filter(
      (row) => row && typeof row === "object" && looksLikeProduct(row as Record<string, unknown>),
    ).length;
    const shopRows = node.filter(
      (row) => row && typeof row === "object" && looksLikeShop(row as Record<string, unknown>),
    ).length;
    const orders = node.filter(
      (row) => row && typeof row === "object" && looksLikeOrder(row as Record<string, unknown>),
    );
    if (productRows > 0) {
      acc.products = acc.products === null ? productRows : Math.max(acc.products, productRows);
    }
    if (shopRows > 0) {
      acc.shops = acc.shops === null ? shopRows : Math.max(acc.shops, shopRows);
    }
    for (const raw of orders) {
      const row = raw as Record<string, unknown>;
      const bucket = orderBucket(String(row.status ?? row.orderStatus ?? ""));
      if (bucket === "sold") acc.sold = take(acc.sold, 1);
      if (bucket === "refused") acc.refused = take(acc.refused, 1);
      if (bucket === "complaint") acc.complaints = take(acc.complaints, 1);
    }
    for (const item of node) walk(item, acc, depth + 1);
    return;
  }
  if (typeof node !== "object") return;
  const rec = node as Record<string, unknown>;
  for (const [key, value] of Object.entries(rec)) {
    const n = asInt(value);
    if (n !== null) {
      if (SOLD_KEY.test(key)) acc.sold = take(acc.sold, n);
      else if (REFUSED_KEY.test(key)) acc.refused = take(acc.refused, n);
      else if (COMPLAINT_KEY.test(key)) acc.complaints = take(acc.complaints, n);
      else if (REVIEW_KEY.test(key) && !Array.isArray(value)) {
        acc.reviews = acc.reviews === null ? n : acc.reviews + n;
      } else if (PRODUCT_KEY.test(key) && !Array.isArray(value)) {
        acc.products = acc.products === null ? n : Math.max(acc.products, n);
      } else if (SHOP_KEY.test(key) && !Array.isArray(value)) {
        acc.shops = acc.shops === null ? n : Math.max(acc.shops, n);
      } else if (
        key === "total" &&
        Array.isArray(rec.items) &&
        rec.items.some((row) => row && typeof row === "object" && looksLikeProduct(row as Record<string, unknown>))
      ) {
        acc.products = acc.products === null ? n : Math.max(acc.products, n);
      }
    }
    if (REVIEW_KEY.test(key) && Array.isArray(value)) {
      acc.reviews = acc.reviews === null ? value.length : Math.max(acc.reviews, value.length);
    }
    if (key === "rating" && acc.rating === null) {
      const r = typeof value === "number" ? value : Number(value);
      if (Number.isFinite(r) && r >= 0 && r <= 5) acc.rating = Math.round(r * 10) / 10;
    }
    walk(value, acc, depth + 1);
  }
}

export function parseShopJson(data: unknown): JsonMetrics {
  const acc: JsonMetrics = {
    sold: null,
    refused: null,
    complaints: null,
    reviews: null,
    rating: null,
    products: null,
    shops: null,
  };
  walk(data, acc, 0);
  return acc;
}

export function mergeJsonMetrics(parts: JsonMetrics[]): JsonMetrics {
  const acc: JsonMetrics = {
    sold: null,
    refused: null,
    complaints: null,
    reviews: null,
    rating: null,
    products: null,
    shops: null,
  };
  for (const part of parts) {
    acc.sold = part.sold === null ? acc.sold : Math.max(acc.sold ?? 0, part.sold);
    acc.refused = part.refused === null ? acc.refused : Math.max(acc.refused ?? 0, part.refused);
    acc.complaints = part.complaints === null ? acc.complaints : Math.max(acc.complaints ?? 0, part.complaints);
    acc.reviews = part.reviews === null ? acc.reviews : Math.max(acc.reviews ?? 0, part.reviews);
    acc.products = part.products === null ? acc.products : Math.max(acc.products ?? 0, part.products);
    acc.shops = part.shops === null ? acc.shops : Math.max(acc.shops ?? 0, part.shops);
    if (acc.rating === null) acc.rating = part.rating;
  }
  return acc;
}
