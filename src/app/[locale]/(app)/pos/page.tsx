"use client";

/**
 * Саҳифаи кассаи POS (Point of Sale) барои телефони фурӯшанда.
 * Кор бе пайвасти мағозаи онлайн (дукони оффлайн дар Тоҷикистон).
 */
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Link } from "@/i18n/navigation";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { ConfirmBar } from "@/components/pos/ConfirmBar";
import { PosEmptyState } from "@/components/pos/PosEmptyState";
import { CustomerPick, type PosCustomer } from "@/components/pos/CustomerPick";
import type { ProductRow } from "@/lib/store";

export default function PosPage() {
  const t = useTranslations("pos");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [customers, setCustomers] = useState<PosCustomer[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerId, setCustomerId] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
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
      const data = (await res.json()) as { products?: ProductRow[]; customers?: PosCustomer[] };
      setProducts(data.products ?? []);
      setCustomers(data.customers ?? []);
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

    if (customerId === "new" && !walkInName.trim()) {
      setError(t("customerRequired"));
      return;
    }

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
          customerId: customerId && customerId !== "new" ? customerId : null,
          customerName: customerId === "new" ? walkInName.trim() : undefined,
          customerPhone: customerId === "new" ? walkInPhone.trim() : undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        remaining?: number;
        customerName?: string | null;
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

      const remaining = data.remaining ?? Math.max(0, selectedProduct.quantity - soldQty);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === selectedProduct.id) {
            return { ...p, quantity: remaining };
          }
          return p;
        }),
      );

      const who = data.customerName ? t("saleTo", { name: data.customerName }) : "";
      setSuccessMsg(`${t("saleSuccess", { qty: soldQty, name: productName })}${who ? ` · ${who}` : ""}`);

      if (customerId === "new") {
        setWalkInName("");
        setWalkInPhone("");
        setCustomerId("");
        void loadProducts();
      }

      if (remaining <= 0) {
        setSelectedProduct(null);
        setQuantity(1);
      } else {
        setSelectedProduct((prev) => (prev ? { ...prev, quantity: remaining } : null));
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
            className="flex flex-col gap-3 rounded-xl border border-success/40 bg-[#e7f6ee] p-4 text-sm font-semibold text-success shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <div>
                <p>{successMsg}</p>
                <p className="mt-1 font-normal text-muted-foreground">{t("saleWhere")}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Link href="/crm" className="btn btn-ghost min-h-12">
                {t("toCrm")}
              </Link>
              <Link href="/inventory" className="btn btn-ghost min-h-12">
                {t("toStock")}
              </Link>
              <Link href="/dashboard" className="btn btn-primary min-h-12">
                {t("toDash")}
              </Link>
            </div>
          </div>
        )}

        <CustomerPick
          customers={customers}
          customerId={customerId}
          walkInName={walkInName}
          walkInPhone={walkInPhone}
          onCustomerId={setCustomerId}
          onWalkInName={setWalkInName}
          onWalkInPhone={setWalkInPhone}
        />

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
