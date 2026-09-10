/**
 * Тоҷикӣ бо кириллӣ ва бо ҳарфи лотинӣ (tojiki, moshin) як хел муқоиса мешавад.
 */

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

/** Матнро ба шакли муқоиса (лотинӣ) меорад: «тоҷикӣ» = «tojiki». */
export function foldTajik(input: string): string {
  let text = input.trim().toLowerCase().replace(/[ʼ'`´ʿʾʻ]/g, "'");
  let mapped = "";
  for (const ch of text) {
    mapped += CYR_TO_LATIN[ch] ?? ch;
  }
  return mapped
    .replace(/kh/g, "x")
    .replace(/gh/g, "g")
    .replace(/iy/g, "i")
    .replace(/ii/g, "i")
    .replace(/u'/g, "u")
    .replace(/o'/g, "o")
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

/** Кадом хат бештар аст: лотинӣ (tojiki) ё кириллӣ (тоҷикӣ). */
export function tajikReplyScript(text: string): TajikReplyScript {
  let cyr = 0;
  let lat = 0;
  for (const ch of text) {
    if (/[\u0400-\u04FF]/.test(ch)) cyr += 1;
    else if (/[a-zA-Z]/.test(ch)) lat += 1;
  }
  if (lat === 0 && cyr === 0) return "neutral";
  return lat > cyr ? "latin" : "cyrillic";
}
