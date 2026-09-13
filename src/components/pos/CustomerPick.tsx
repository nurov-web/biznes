"use client";

import { useTranslations } from "next-intl";

export type PosCustomer = { id: string; name: string; phone: string };

type Props = {
  customers: PosCustomer[];
  customerId: string;
  walkInName: string;
  walkInPhone: string;
  onCustomerId: (id: string) => void;
  onWalkInName: (name: string) => void;
  onWalkInPhone: (phone: string) => void;
};

/** Интихоби мизоҷ дар касса — фурӯш ба CRM меравад. */
export function CustomerPick({
  customers,
  customerId,
  walkInName,
  walkInPhone,
  onCustomerId,
  onWalkInName,
  onWalkInPhone,
}: Props) {
  const t = useTranslations("pos");
  const isNew = customerId === "new";

  return (
    <div className="card-raised grid gap-3 p-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium">
        {t("customer")}
        <select
          className="input-field min-h-12"
          value={customerId}
          onChange={(e) => onCustomerId(e.target.value)}
        >
          <option value="">{t("walkIn")}</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.phone ? `${c.name} · ${c.phone}` : c.name}
            </option>
          ))}
          <option value="new">{t("newCustomer")}</option>
        </select>
      </label>
      {isNew ? (
        <>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("customerName")}
            <input
              className="input-field min-h-12"
              value={walkInName}
              onChange={(e) => onWalkInName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
            {t("customerPhone")}
            <input
              className="input-field min-h-12"
              value={walkInPhone}
              onChange={(e) => onWalkInPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+992"
            />
          </label>
        </>
      ) : (
        <p className="self-end text-sm leading-relaxed text-muted-foreground">{t("customerHint")}</p>
      )}
    </div>
  );
}
