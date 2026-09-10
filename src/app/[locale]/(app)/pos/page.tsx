"use client";

/**
 * Саҳифаи кассаи POS (Point of Sale) барои телефони фурӯшанда.
 * Кор бе пайвасти мағозаи онлайн (дукони оффлайн дар Тоҷикистон).
 */
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { ConfirmBar } from "@/components/pos/ConfirmBar";
import { PosEmptyState } from "@/components/pos/PosEmptyState";
import type { ProductRow } from "@/lib/store";

export default function PosPage() {
  const t = useTranslations("pos");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pos");
      if (!res.ok) {
        throw new Error("FETCH_FAILED");
      }
      const data = (await res.json()) as { products?: ProductRow[] };
      setProducts(data.products ?? []);
    } catch {
      setError(t("saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  function handleSelectProduct(product: ProductRow) {
    setError(null);
    setSuccessMsg(null);
    if (selectedProduct?.id === product.id) {
      setSelectedProduct(null);
      setQuantity(1);
      return;
    }
    setSelectedProduct(product);
    setQuantity(1);
  }

  async function handleConfirmSale() {
    if (!selectedProduct || quantity <= 0) return;

    setBusy(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        if (data.error === "insufficient_stock") {
          setError(t("insufficientStock"));
        } else if (data.error === "not_found") {
          setError(t("notFound"));
        } else if (data.error === "validation") {
          setError(t("invalidQuantity"));
        } else {
          setError(t("saveFailed"));
        }
        return;
      }

      // Муваффақият: остатокро дар анбор нав мекунем
      const productName = `${selectedProduct.brand} ${selectedProduct.model}`.trim();
      const soldQty = quantity;

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === selectedProduct.id) {
            return { ...p, quantity: Math.max(0, p.quantity - soldQty) };
          }
          return p;
        }),
      );

      // Паёми муваффақият
      setSuccessMsg(t("saleSuccess", { qty: soldQty, name: productName }));

      // Агар остаток 0 шуд, интихобро холӣ мекунем, вагарна 1 мемонем
      const nextStock = selectedProduct.quantity - soldQty;
      if (nextStock <= 0) {
        setSelectedProduct(null);
        setQuantity(1);
      } else {
        setSelectedProduct((prev) => (prev ? { ...prev, quantity: nextStock } : null));
        setQuantity(1);
      }
    } catch {
      setError(t("saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <PageShell title={t("title")} lead={t("subtitle")}>
        <div className="flex min-h-[280px] items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            role="status"
            aria-label={t("selling")}
          />
        </div>
      </PageShell>
    );
  }

  if (products.length === 0) {
    return (
      <PageShell title={t("title")} lead={t("subtitle")}>
        <PosEmptyState />
      </PageShell>
    );
  }

  return (
    <PageShell title={t("title")} lead={t("subtitle")}>
      <div className="space-y-6">
        {/* Баннери огоҳӣ ҳангоми хатогӣ */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive shadow-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        {/* Баннери огоҳӣ ҳангоми муваффақият */}
        {successMsg && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-success/40 bg-[#e7f6ee] p-4 text-sm font-semibold text-success shadow-sm"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Сеткаи молҳо */}
        <ProductGrid
          products={products}
          selectedProductId={selectedProduct?.id ?? null}
          onSelectProduct={handleSelectProduct}
        />

        {/* Панели тасдиқ ва тугмаи фурӯхтам */}
        <ConfirmBar
          selectedProduct={selectedProduct}
          quantity={quantity}
          onChangeQuantity={setQuantity}
          onConfirmSale={handleConfirmSale}
          busy={busy}
        />
      </div>
    </PageShell>
  );
}
