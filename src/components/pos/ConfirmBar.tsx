"use client";

/**
 * Панели тасдиқи фурӯш (Confirm Bar).
 * Тугмаи асосии «Фурӯхтам» бо ранги primary (#1565c0) ва андозаи ≥48px.
 */
import { useTranslations } from "next-intl";
import { Banknote, Loader2 } from "lucide-react";
import type { ProductRow } from "@/lib/store";
import { getProductSellPrice } from "@/components/pos/ProductGrid";
import { QtyControl } from "@/components/pos/QtyControl";

type ConfirmBarProps = {
  selectedProduct: ProductRow | null;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
  onConfirmSale: () => void;
  busy: boolean;
};

export function ConfirmBar({
  selectedProduct,
  quantity,
  onChangeQuantity,
  onConfirmSale,
  busy,
}: ConfirmBarProps) {
  const t = useTranslations("pos");

  const unitPrice = selectedProduct ? getProductSellPrice(selectedProduct) : 0;
  const totalPrice = unitPrice * quantity;
  const canSell = selectedProduct !== null && selectedProduct.quantity >= quantity && quantity > 0 && !busy;

  return (
    <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 border-t border-border bg-card/95 p-4 shadow-lg backdrop-blur-md md:bottom-0 md:rounded-2xl md:border md:shadow-md">
      {selectedProduct ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {selectedProduct.brand} {selectedProduct.model}
              </p>
              <p className="text-2xl font-extrabold text-foreground">
                {t("total", { total: totalPrice.toLocaleString("ru-RU") })}
              </p>
            </div>

            <QtyControl
              quantity={quantity}
              maxQuantity={selectedProduct.quantity}
              onChangeQuantity={onChangeQuantity}
              disabled={busy}
            />
          </div>

          <button
            type="button"
            onClick={onConfirmSale}
            disabled={!canSell}
            className="btn flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-8 text-base font-bold text-on-primary shadow-md transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto min-w-[200px]"
          >
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                <span>{t("selling")}</span>
              </>
            ) : (
              <>
                <Banknote className="h-5 w-5" strokeWidth={2} aria-hidden />
                <span>{t("sellButton")}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex min-h-[52px] items-center justify-center text-sm font-medium text-muted-foreground">
          {t("selectProductTip")}
        </div>
      )}
    </div>
  );
}
