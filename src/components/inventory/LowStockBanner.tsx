"use client";

import { PackageMinus } from "lucide-react";
import { IconWell } from "@/components/ui/Icon";

/** Молҳои каммонда — аз ҳадди LOW_STOCK_THRESHOLD. */
export function LowStockBanner({
  names,
  title,
  lead,
}: {
  names: string[];
  title: string;
  lead: string;
}) {
  if (names.length === 0) return null;
  return (
    <article className="card-raised flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5" role="status">
      <IconWell icon={PackageMinus} />
      <div className="min-w-0 flex-1">
        <h2 className="display-3">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{lead}</p>
        <p className="mt-2 text-sm font-medium">{names.join(" · ")}</p>
      </div>
    </article>
  );
}
