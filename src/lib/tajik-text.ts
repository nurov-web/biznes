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
  "fahm",
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
  "sait",
  "saitro",
  "knopka",
  "navis",
  "naviset",
  "mebar",
  "shavad",
  "kuned",
  "kardan",
  "doram",
  "dored",
  "hast",
  "nest",
  "lotin",
  "kirill",
  "vale",
  "ammo",
  "chunki",
  "baroi",
  "bisyor",
  "kam",
  "pul",
  "somoni",
  "tjs",
  "non",
  "telefon",
  "dukon",
  "dokon",
  "kor",
  "koram",
  "biznes",
  "mahsulot",
  "narxro",
  "foida",
  "zarar",
  "anbor",
  "mijoz",
  "xaridor",
  "haridor",
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
  if (!n) return false;
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

/** Номҳои хориҷӣ ва рақамҳо хатро омехта ҳисоб намекунанд. */
const FOREIGN_TOKENS =
  /\b(telegram|instagram|whatsapp|facebook|tiktok|youtube|viber|imo|olx|somon|alif|excel|pdf|sms|wi-?fi|usd|cny|tjs|kg|ton|pcs|ok|ssd|hdd|cpu|gpu|ram|usb|hdmi|nvme|sata|macbook|iphone|ipad)\b/gi;

function escapeWord(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Калимаҳои худи соҳиб (маҳсулот, шаҳр) хато ҳисоб намешаванд. */
function stripOwnWords(text: string, allow: string[]): string {
  const words = allow
    .flatMap((row) => row.split(/[^\p{L}\p{N}]+/u))
    .map((row) => row.trim())
    .filter((row) => row.length >= 2)
    .map(escapeWord);
  if (words.length === 0) return text;
  return text.replace(new RegExp(words.join("|"), "gi"), " ");
}

/**
 * Матни ИИ бояд бо як хат бошад: ё кириллӣ, ё лотинӣ.
 * «narxi 1 somoni кам аст» — хатои хониш, ба соҳиб нишон дода намешавад.
 */
export function hasMixedScript(text: string, allow: string[] = []): boolean {
  const clean = stripOwnWords(text.replace(/https?:\/\/\S+/g, " ").replace(FOREIGN_TOKENS, " "), allow);
  const { cyr, lat } = letterCounts(clean);
  const total = cyr + lat;
  if (total < 12) return false;
  return Math.min(cyr, lat) / total > 0.08;
}

/** Оё матн тоҷикии бо ҳарфи англисӣ навишта аст (на забони англисӣ). */
export function looksLikeLatinTajik(text: string): boolean {
  const { cyr, lat } = letterCounts(text);
  if (lat === 0 || cyr > lat) return false;
  const folded = foldTajik(text);
  for (const stem of LATIN_TAJIK_STEMS) {
    if (folded.includes(foldTajik(stem))) return true;
  }
  return false;
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
  return "neutral";
}

const LATIN_TAJIK_GLOSS =
  "agar/agur=if, yo=or, yagon=some, chizi=thing, digar=other, injo=here, meguyad=says, mefahmad=understands, anbor=warehouse, moshin=car, narx=price, faida/foida=profit, magoza=shop, dukon=shop, mizoqon=customers, kassa=till, savol=question, ham=also, tavre kun=make it so, shrift=script, anglisi=English letters, tojiki=Tajik, kuned/kun=do, furush=sale, xarid=buy, saitro=the site, knopka=button, naviset=write, shavad=should become, vale/ammo=but, baroi=for, bisyor=many, kam=little, pul=money, non=bread, mahsulot=product, xaridor=buyer, kor=work, nest=there is not, hast=there is, lotfan=please";

/** Матни соҳибро барои ИИ қайд мекунад, ки ин тоҷикӣ аст, на англисӣ. */
export function wrapOwnerMessage(raw: string | undefined, locale: Locale = "tg"): string {
  const text = raw?.trim() ?? "";
  if (!text) return "Owner message: (empty).";
  const script = ownerReplyScript(text, locale);
  if (script === "latin") {
    return [
      "OWNER TEXT — spoken Tajik typed with an English keyboard (Latin letters). This is NOT English. Do not read it as English words or English typos.",
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
  "Tajik owners type Tajik with an English keyboard (tojiki, narx, non, kulob, saitro tavre kun). That is Tajik, never English.",
  "On locale tg, ANY message written with a–z is Latin Tajik unless it is clearly a foreign brand or URL.",
  "Do not map those words to English lookalikes. Answer the Tajik meaning.",
  `Glossary: ${LATIN_TAJIK_GLOSS}.`,
  "If the owner used Latin letters, write the whole answer in Latin Tajik — no Cyrillic, no English prose.",
].join(" ");
