"use client";

import { useTranslations } from "next-intl";
import { BadgePercent, Boxes, ChartLine, CircuitBoard, FlaskConical, Users } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { IconWell } from "@/components/ui/Icon";

function MiniBars() {
  const bars = [42, 68, 55, 82, 61, 91];
  return (
    <div className="mt-5 flex h-20 items-end gap-1.5" aria-hidden>
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[3px] bg-primary/15"
          style={{ height: `${h}%` }}
        >
          <div className="h-full w-full rounded-t-[3px] bg-primary/70" style={{ opacity: h / 130 }} />
        </div>
      ))}
    </div>
  );
}

function MiniPriceRow() {
  const t = useTranslations("landing");
  return (
    <div className="mt-5 space-y-2" aria-hidden>
      {[
        [t("bBuy"), "4 428", "text-muted-foreground"],
        [t("bNow"), "5 200", "text-muted-foreground"],
        [t("bRec"), "5 490", "text-success font-semibold"],
      ].map(([label, value, cls]) => (
        <div key={label} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className={`num ${cls}`}>{value} TJS</span>
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
          <p className="eyebrow text-primary">{t("bentoEyebrow")}</p>
          <h2 className="display-2 mt-3 max-w-2xl text-balance">{t("bentoTitle")}</h2>
        </Reveal>

        <Reveal stagger className="mt-9 grid gap-4 lg:grid-cols-3">
          <article className="card-raised hover-lift p-4 sm:p-6 lg:col-span-2">
            <IconWell icon={CircuitBoard} />
            <h3 className="display-3 mt-4">{t("f5")}</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{t("f5d")}</p>
            <ol className="mt-5 flex flex-wrap gap-1.5">
              {["Analyze", "Explain", "Simulate", "Recommend", "Learn"].map((s) => (
                <li key={s} className="chip num text-xs">
                  {s}
                </li>
              ))}
            </ol>
          </article>

          <article className="card-raised hover-lift p-4 sm:p-6">
            <IconWell icon={BadgePercent} />
            <h3 className="display-3 mt-4">{t("f3")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("f3d")}</p>
            <MiniPriceRow />
          </article>

          <article className="card-raised hover-lift p-4 sm:p-6">
            <IconWell icon={ChartLine} />
            <h3 className="display-3 mt-4">{t("f1")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("f1d")}</p>
            <MiniBars />
          </article>

          <article className="card-raised hover-lift p-4 sm:p-6">
            <IconWell icon={FlaskConical} />
            <h3 className="display-3 mt-4">{t("f4")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("f4d")}</p>
            <div className="mt-5 flex flex-wrap gap-1.5" aria-hidden>
              {[t("crashA"), t("crashB"), t("crashC"), t("crashD")].map((c) => (
                <span key={c} className="chip text-xs">
                  {c}
                </span>
              ))}
            </div>
          </article>

          <article className="card-raised hover-lift p-4 sm:p-6">
            <IconWell icon={Users} />
            <h3 className="display-3 mt-4">{t("agentsTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("agentsBody")}</p>
            <div className="mt-5 flex flex-wrap gap-1.5" aria-hidden>
              {["CEO", "CFO", "Marketing", "Sales", "Inventory", "Market", "Risk"].map((a) => (
                <span key={a} className="chip text-xs">
                  {a}
                </span>
              ))}
            </div>
          </article>

          <article className="card-raised hover-lift p-4 sm:p-6 lg:col-span-3">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-lg">
                <IconWell icon={Boxes} />
                <h3 className="display-3 mt-4">{t("f2")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("f2d")}</p>
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3" aria-hidden>
                {["CSV / Excel", "Shopify", "WooCommerce", "Stripe", "PayPal", "POS"].map((name, i) => (
                  <div
                    key={name}
                    className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs"
                  >
                    <span className="truncate">{name}</span>
                    <span className={i === 0 ? "text-success" : "text-muted-foreground"}>
                      {i === 0 ? t("bLive") : t("bQueued")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
