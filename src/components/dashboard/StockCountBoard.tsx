"use client";

import { useTranslations } from "next-intl";
import { money } from "@/hooks/useIntelligence";

type Price = { sku: string; trueCost: number; currentSell: number; marginPct: number };
type Stock = { sku: string; quantity: number; status: "ok" | "low" | "dead" | "over" };

/** Чӣ тавр мол ҳисоб мешавад — бо рақами худи дӯкон. */
export function StockCountBoard({ prices, inventory }: { prices: Price[]; inventory: Stock[] }) {
  const t = useTranslations("stockCount");
  const qty = new Map(inventory.map((row) => [row.sku, row]));

  return (
    <section className="card-raised overflow-hidden">
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <h2 className="display-3">{t("title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("lead")}</p>
      </div>
      {prices.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground sm:px-6">{t("empty")}</p>
      ) : (
        <div className="table-scroll overflow-x-auto">
          <table className="table-intel">
            <thead>
              <tr>
                <th>{t("sku")}</th>
                <th>{t("qty")}</th>
                <th>{t("buy")}</th>
                <th>{t("sell")}</th>
                <th>{t("one")}</th>
                <th>{t("tag")}</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => {
                const stock = qty.get(p.sku);
                const piece = p.currentSell - p.trueCost;
                const tag =
                  p.marginPct < 8 ? t("tagExpensive") : p.marginPct >= 25 ? t("tagCheap") : t("tagOk");
                const sleep = stock?.status === "dead" ? t("tagStuck") : tag;
                return (
                  <tr key={p.sku}>
                    <td className="font-medium">{p.sku}</td>
                    <td className="num">{stock?.quantity ?? 0}</td>
                    <td className="num">{money(p.trueCost)}</td>
                    <td className="num">{money(p.currentSell)}</td>
                    <td className="num">{money(piece)}</td>
                    <td>{sleep}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
