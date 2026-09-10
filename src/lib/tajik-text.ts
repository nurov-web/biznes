/**
 * Тоҷикӣ бо кириллӣ ва бо ҳарфи лотинӣ (tojiki, moshin) як хел муқоиса мешавад.
 */

import type { Locale } from "@/lib/locale-query";

const CYR_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  ғ: "gh",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  ӣ: "i",
  й: "y",
  к: "k",
  қ: "q",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ӯ: "u",
  ф: "f",
  х: "x",
  ҳ: "h",
  ч: "ch",
  ҷ: "j",
  ш: "sh",
  ъ: "",
  э: "e",
  ю: "yu",
  я: "ya",
  ы: "i",
  ь: "",
  ц: "s",
  щ: "sh",
};

/** Калимаҳои маъмули тоҷикӣ бо ҳарфи англисӣ — ИИ инро англисӣ нагирад. */
const LATIN_TAJIK_STEMS = [
  "agar",
  "agur",
  "yagon",
  "chizi",
  "chize",
  "digar",
  "injo",
  "meguy",
  "mefahm",
  "mekun",
  "menavis",
  "memon",
  "anbor",
  "moshin",
  "faida",
  "foida",
  "narx",
  "magoza",
  "magaza",
  "tanzim",
  "mizoq",
  "mizoj",
  "kassa",
  "bozor",
  "raqib",
  "savol",
  "tojiki",
  "shumo",
  "kuned",
  "shrift",
  "anglisi",
  "tavre",
  "fahmad",
  "hama",
  "furush",
  "xarid",
  "kharid",
  "sohib",
  "lotfan",
  "rahmat",
  "chand",
  "imet",
  "mekhoh",
  "mekham",
  "libos",
  "xurok",
  "tamir",
  "xizmat",
  "hizmat",
  "soxtmon",
  "kishovarz",
  "dushanbe",
  "khujand",
  "xujand",
  "bokhtar",
  "kulob",
];

/** Матнро ба шакли муқоиса (лотинӣ) меорад: «тоҷикӣ» = «tojiki». */
export function foldTajik(input: string): string {
  let text = input.trim().toLowerCase().replace(/[ʼ'`´ʿʾʻ]/g, "'");
  let mapped = "";
  for (const ch of text) {
    mapped += CYR_TO_LATIN[ch] ?? ch;
  }
  return mapped
    .replace(/dzh/g, "j")
    .replace(/kh/g, "x")
    .replace(/gh/g, "g")
    .replace(/h/g, "x")
    .replace(/iy/g, "i")
    .replace(/ii/g, "i")
    .replace(/u'/g, "u")
    .replace(/o'/g, "o")
    .replace(/agur/g, "agar")
    .replace(/[^a-z0-9]+/g, "");
}

export function tajikIncludes(haystack: string, needle: string): boolean {
  const n = foldTajik(needle);
  if (!n) return true;
  return foldTajik(haystack).includes(n);
}

export function tajikEquals(left: string, right: string): boolean {
  return foldTajik(left) === foldTajik(right);
}

export type TajikReplyScript = "latin" | "cyrillic" | "neutral";

function letterCounts(text: string): { cyr: number; lat: number } {
  let cyr = 0;
  let lat = 0;
  for (const ch of text) {
    if (/[\u0400-\u04FF]/.test(ch)) cyr += 1;
    else if (/[a-zA-Z]/.test(ch)) lat += 1;
  }
  return { cyr, lat };
}

/** Кадом хат бештар аст: лотинӣ (tojiki) ё кириллӣ (тоҷикӣ). */
export function tajikReplyScript(text: string): TajikReplyScript {
  const { cyr, lat } = letterCounts(text);
  if (lat === 0 && cyr === 0) return "neutral";
  return lat > cyr ? "latin" : "cyrillic";
}

/** Оё матн тоҷикии бо ҳарфи англисӣ навишта аст (на забони англисӣ). */
export function looksLikeLatinTajik(text: string): boolean {
  const { cyr, lat } = letterCounts(text);
  if (lat === 0 || cyr > lat) return false;
  const folded = foldTajik(text);
  let hits = 0;
  for (const stem of LATIN_TAJIK_STEMS) {
    if (folded.includes(foldTajik(stem))) hits += 1;
    if (hits >= 2) return true;
  }
  return hits >= 1 && lat >= 8;
}

/**
 * Барои ИИ: дар /tg ҳарфи лотинӣ = тоҷикӣ.
 * Дар /ru ва /en ҳам, агар калимаҳои тоҷикӣ бошанд.
 */
export function ownerReplyScript(text: string, locale: Locale): TajikReplyScript {
  const raw = tajikReplyScript(text);
  if (raw === "cyrillic") return "cyrillic";
  if (looksLikeLatinTajik(text)) return "latin";
  if (locale === "tg" && raw === "latin") return "latin";
  return raw;
}

const LATIN_TAJIK_GLOSS =
  "agar/agur=if, yo=or, yagon=some, chizi=thing, digar=other, injo=here, meguyad=says, mefahmad=understands, anbor=warehouse, moshin=car, narx=price, faida=profit, magoza=shop, mizoqon=customers, kassa=till, savol=question, ham=also, tavre kun=make it so, shrift=script, anglisi=English, tojiki=Tajik, kuned=do, furush=sale, xarid=buy";

/** Матни соҳибро барои Claude қайд мекунад, ки ин тоҷикӣ аст, на англисӣ. */
export function wrapOwnerMessage(raw: string | undefined): string {
  const text = raw?.trim() ?? "";
  if (!text) return "Owner message: (empty).";
  const script = tajikReplyScript(text);
  if (script === "latin" || looksLikeLatinTajik(text)) {
    return [
      "OWNER TEXT — spoken Tajik typed with English keyboard letters. This is NOT English. Do not read it as English words or English typos.",
      `Phonetics: ${LATIN_TAJIK_GLOSS}.`,
      `«${text}»`,
    ].join("\n");
  }
  if (script === "cyrillic") {
    return `Owner message (Tajik Cyrillic):\n«${text}»`;
  }
  return `Owner message:\n«${text}»`;
}

export const LATIN_TAJIK_LLM_RULE = [
  "Tajik owners type Tajik with an English keyboard (tojiki, agur, chizi, anbor). That is Tajik, never English.",
  "Do not map those words to English lookalikes. Answer the Tajik meaning.",
  `Glossary: ${LATIN_TAJIK_GLOSS}.`,
  "If the owner used Latin letters, write the whole answer in Latin Tajik — no Cyrillic letters.",
].join(" ");
