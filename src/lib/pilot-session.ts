import type { SessionPayload } from "@/types";
import type { PilotKind, PilotProfileRow } from "@/lib/store";

export type PilotSessionDraft = {
  kind: PilotKind;
  category: string;
  subcategory: string;
  product: string;
  region: string;
  volume: string;
  price: string;
  channels: string[];
  problem: string;
  shopUrl: string;
};

type PilotClaims = Pick<
  SessionPayload,
  "pkind" | "pproduct" | "pregion" | "pcat" | "psub" | "pvol" | "pprice" | "pch" | "pprob" | "pshop"
>;

/** Профилро дар JWT мегузорем — пас аз deploy /tmp холӣ шавад ҳам намепартоем. */
export function sessionPilotClaims(row: PilotSessionDraft | null | undefined): PilotClaims {
  if (!row) return {};
  const product = row.product.trim();
  const region = row.region.trim();
  if (!product && !region) return {};
  return {
    pkind: row.kind,
    pproduct: product,
    pregion: region,
    pcat: row.category,
    psub: row.subcategory,
    pvol: row.volume,
    pprice: row.price,
    pch: row.channels.join(","),
    pprob: row.problem,
    pshop: row.shopUrl,
  };
}

export function pilotDraftFromSession(payload: SessionPayload): PilotSessionDraft | null {
  const product = (payload.pproduct ?? "").trim();
  const region = (payload.pregion ?? "").trim();
  if (!product && !region) return null;
  return {
    kind: payload.pkind === "starting" ? "starting" : "has_business",
    category: payload.pcat ?? "",
    subcategory: payload.psub ?? "",
    product,
    region,
    volume: payload.pvol ?? "",
    price: payload.pprice ?? "",
    channels: (payload.pch ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    problem: payload.pprob ?? "",
    shopUrl: payload.pshop ?? "",
  };
}

export function profileRowFromDraft(userId: string, draft: PilotSessionDraft, id: string, createdAt: string): PilotProfileRow {
  return {
    id,
    userId,
    kind: draft.kind,
    category: draft.category,
    subcategory: draft.subcategory,
    product: draft.product,
    region: draft.region,
    volume: draft.volume,
    price: draft.price,
    channels: draft.channels,
    problem: draft.problem,
    shopUrl: draft.shopUrl,
    createdAt,
  };
}
