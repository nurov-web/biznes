/** «Надорам / нет» — номи мол нест. */

const EMPTY_GOODS =
  /^(надорам|не\s*дорам|нету|нет|нест|не\s*имею|nadaram|nedoram|nest|none|n\/?a|no|-|—|–|маҳсулот\s*нест|чизе\s*нест|мол\s*нест|нет\s*товара|не\s*дорам\s*мол|mol\s*nest|chizi\s*nest)$/i;

export function namedGoods(raw: string): string {
  const s = raw.trim().replace(/^["«»„“]+|["«»„“]+$/g, "");
  if (s.length < 2) return "";
  const compact = s.toLowerCase().replace(/\s+/g, " ").trim();
  if (EMPTY_GOODS.test(compact)) return "";
  if (/(надорам|не дорам|нету|нест|nadaram|nedoram|nest)$/i.test(compact) && compact.split(" ").length <= 5) {
    return "";
  }
  return s;
}
