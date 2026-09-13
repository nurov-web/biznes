"use client";

import type { ReactNode } from "react";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

export function PilotFormShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-background">
      <MarketingHeader tone="light" />
      <main className="gutter-x mx-auto w-full min-w-0 max-w-lg flex-1 py-8 sm:py-10">{children}</main>
      <MarketingFooter />
    </div>
  );
}

export function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <ol className="mb-6 flex gap-2" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <li
          key={i}
          className={`h-0.5 flex-1 ${i + 1 <= step ? "bg-ink" : "bg-border"}`}
        />
      ))}
    </ol>
  );
}
