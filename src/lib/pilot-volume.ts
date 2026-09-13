import { PILOT_UNITS } from "@/constants/pilot";

type PilotUnit = (typeof PILOT_UNITS)[number];

export type PilotVolume = {
  amount: number;
  unit: PilotUnit;
};

function isUnit(value: string): value is PilotUnit {
  return (PILOT_UNITS as readonly string[]).includes(value);
}

/** Дар анбор ҳаҷм ҳамчун «200 pcs» нигоҳ дошта мешавад. */
export function splitVolume(raw: string): PilotVolume {
  const [head = "", tail = ""] = raw.trim().split(/\s+/);
  const amount = Number(head.replace(/[^\d.-]/g, ""));
  return {
    amount: Number.isFinite(amount) ? amount : 0,
    unit: isUnit(tail) ? tail : "pcs",
  };
}

/** Даромади моҳона аз анкета: ҳаҷм × нарх. */
export function monthlyRevenue(volume: string, price: string): number {
  const amount = splitVolume(volume).amount;
  const unitPrice = Number(price.replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(unitPrice)) return 0;
  return Math.round(amount * unitPrice);
}
