"use client";

/**
 * Компоненти танзими миқдори мол (Quantity Control).
 * Тугмаҳои калон ≥48px барои ивази зуди миқдор.
 */
import { useTranslations } from "next-intl";
import { Minus, Plus } from "lucide-react";

type QtyControlProps = {
  quantity: number;
  maxQuantity: number;
  onChangeQuantity: (newQty: number) => void;
  disabled?: boolean;
};

export function QtyControl({
  quantity,
  maxQuantity,
  onChangeQuantity,
  disabled = false,
}: QtyControlProps) {
  const t = useTranslations("pos");

  const canDecrease = quantity > 1 && !disabled;
  const canIncrease = quantity < maxQuantity && !disabled;

  function handleDecrease() {
    if (canDecrease) {
      onChangeQuantity(quantity - 1);
    }
  }

  function handleIncrease() {
    if (canIncrease) {
      onChangeQuantity(quantity + 1);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      onChangeQuantity(1);
    } else if (val > maxQuantity) {
      onChangeQuantity(maxQuantity);
    } else {
      onChangeQuantity(val);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="pos-qty-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {t("qtyLabel")}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={!canDecrease}
          className="grid h-12 w-12 min-h-12 min-w-12 shrink-0 place-items-center border border-border bg-card text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          aria-label={t("qtyMinus")}
        >
          <Minus className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>

        <input
          id="pos-qty-input"
          type="number"
          min={1}
          max={maxQuantity}
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
          className="input-field h-12 min-h-12 w-20 text-center text-lg font-semibold"
        />

        <button
          type="button"
          onClick={handleIncrease}
          disabled={!canIncrease}
          className="grid h-12 w-12 min-h-12 min-w-12 shrink-0 place-items-center border border-border bg-card text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          aria-label={t("qtyPlus")}
        >
          <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
