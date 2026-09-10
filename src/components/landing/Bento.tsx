"use client";

import { useTranslations } from "next-intl";
import { BadgePercent, Boxes, ChartLine, CircuitBoard, FlaskConical, Users } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { IconWell } from "@/components/ui/Icon";

function MiniBars() {
  const bars = [42, 68, 55, 82, 61, 91];
  return (
    <div className="mt-5 flex h-16 items-end gap-1" aria-hidden>
      {bars.map((h, i) => (
        <div key={i} className="flex-1 bg-muted" style={{ height: `${h}%` }}>
          <div className="h-full w-full bg-ink" style={{ opacity: 0.12 + h / 180 }} />
        </div>
      ))}
    </div>
  );
}

function MiniPriceRow() {
  const t = useTranslations("landing");
  return (
    <div className="mt-5 divide-y divide-border border border-border" aria-hidden>
      {[
        [t("bBuy"), "4 428"],
        [t("bNow"), "5 200"],
        [t("bRec"), "5 490"],
      ].map(([label, value], i) => (
        <div key={label} className="flex items-center justify-between px-3 py-2 text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className={`num ${i === 2 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
            {value} TJS
          </span>
        </div>
      ))}
    </div>
  );
}

export function Bento() {
  const t = useTranslations("landing");

  return (
    <section className="border-y border-border bg-surface">
      <div className="gutter-x mx-auto w-full min-w-0 max-w-6xl py-16 md:py-20">
        <Reveal>
          <p className="eyebrow">{t("bentoEyebrow")}</p>
          <h2 className="display-2 mt-3 max-w-2xl text-balance">{t("bentoTitle")}</h2>
        </Reveal>

        <Reveal stagger className="mt-9 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-3">
          <article className="bg-card p-4 sm:p-6 lg:col-span-2">
            <IconWell icon={CircuitBoard} />
            <h3 className="display-3 mt-4">{t("f5")}</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{t("f5d")}</p>
          </article>

          <article className="bg-card p-4 sm:p-6">
            <IconWell icon={BadgePercent} />
            <h3 className="display-3 mt-4">{t("f3")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("f3d")}</p>
            <MiniPriceRow />
          </article>

          <article className="bg-card p-4 sm:p-6">
            <IconWell icon={ChartLine} />
            <h3 className="display-3 mt-4">{t("f1")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("f1d")}</p>
            <MiniBars />
          </article>

          <article className="bg-card p-4 sm:p-6">
            <IconWell icon={FlaskConical} />
            <h3 className="display-3 mt-4">{t("f4")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("f4d")}</p>
            <ul className="mt-5 space-y-1.5 text-xs text-muted-foreground" aria-hidden>
              {[t("crashA"), t("crashB"), t("crashC"), t("crashD")].map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </article>

          <article className="bg-card p-4 sm:p-6">
            <IconWell icon={Users} />
            <h3 className="display-3 mt-4">{t("agentsTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("agentsBody")}</p>
          </article>

          <article className="bg-card p-4 sm:p-6 lg:col-span-3">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-lg">
                <IconWell icon={Boxes} />
                <h3 className="display-3 mt-4">{t("f2")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("f2d")}</p>
              </div>
              <ul className="grid min-w-0 flex-1 grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3" aria-hidden>
                {["CSV / Excel", "POS", "Webhook"].map((name) => (
                  <li key={name} className="bg-card px-3 py-2 text-xs text-muted-foreground">
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
