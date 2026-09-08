"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, BadgePercent, Boxes, FlaskConical, LayoutDashboard } from "lucide-react";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";

const TABS = ["dash", "price", "sim"] as const;
type Tab = (typeof TABS)[number];

const SERIES = [38, 44, 41, 52, 49, 61, 58, 67, 72, 69, 78, 84];

function sparkPath(values: number[], width: number, height: number): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 6) - 3;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function Ring({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const offset = circumference * (1 - score / 100);
    if (reducedMotion()) {
      gsap.set(node, { strokeDashoffset: offset });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { strokeDashoffset: circumference },
        { strokeDashoffset: offset, duration: 1.4, ease: EASE },
      );
    });
    return () => ctx.revert();
  }, [score, circumference]);

  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
      <circle cx="40" cy="40" r={radius} fill="none" stroke="#1e2942" strokeWidth="7" />
      <circle
        ref={ref}
        cx="40"
        cy="40"
        r={radius}
        fill="none"
        stroke="#5aa2f7"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
      />
    </svg>
  );
}

export function ProductPreview() {
  const t = useTranslations("preview");
  const [tab, setTab] = useState<Tab>("dash");
  const [paused, setPaused] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || reducedMotion()) return;
    const id = window.setInterval(() => {
      setTab((current) => TABS[(TABS.indexOf(current) + 1) % TABS.length]);
    }, 5200);
    return () => window.clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const node = bodyRef.current;
    if (!node || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        node.children,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.42, ease: EASE, stagger: 0.05 },
      );
    }, node);
    return () => ctx.revert();
  }, [tab]);

  const tabIcon = { dash: LayoutDashboard, price: BadgePercent, sim: FlaskConical };

  return (
    <div
      className="app-frame select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-hidden
    >
      {/* Сарлавҳаи тиреза */}
      <div className="flex items-center gap-3 border-b border-dark-border px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2b3854]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2b3854]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2b3854]" />
        </div>
        <p className="num text-[11px] text-dark-muted">businesspilot.tj / {t(`tab_${tab}`)}</p>
      </div>

      <div className="flex">
        {/* Панели чап */}
        <nav className="hidden w-12 shrink-0 flex-col items-center gap-1 border-r border-dark-border py-3 sm:flex">
          {TABS.map((id) => {
            const Glyph = tabIcon[id];
            return (
              <button
                key={id}
                type="button"
                tabIndex={-1}
                onClick={() => setTab(id)}
                className={`grid h-9 w-9 place-items-center rounded-lg transition-colors duration-200 ${
                  tab === id ? "bg-[#17243c] text-dark-accent" : "text-[#5b6b88] hover:text-dark-muted"
                }`}
              >
                <Glyph className="h-4 w-4" strokeWidth={1.75} />
              </button>
            );
          })}
          <span className="mt-1 grid h-9 w-9 place-items-center rounded-lg text-[#5b6b88]">
            <Boxes className="h-4 w-4" strokeWidth={1.75} />
          </span>
        </nav>

        <div ref={bodyRef} className="min-h-[19rem] flex-1 p-4 sm:p-5">
          {tab === "dash" ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-dark-muted">
                    {t("health")}
                  </p>
                  <p className="num mt-1 text-3xl font-semibold text-dark-text">
                    77<span className="text-base text-dark-muted">/100</span>
                  </p>
                </div>
                <Ring score={77} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { k: t("revenue"), v: "48 200" },
                  { k: t("profit"), v: "9 640" },
                  { k: t("margin"), v: "20%" },
                ].map((cell) => (
                  <div key={cell.k} className="rounded-lg border border-dark-border bg-[#0c1421] px-2.5 py-2">
                    <p className="truncate text-[10px] text-dark-muted">{cell.k}</p>
                    <p className="num mt-0.5 text-sm font-semibold text-dark-text">{cell.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-dark-border bg-[#0c1421] p-3">
                <svg viewBox="0 0 260 56" className="h-14 w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5aa2f7" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#5aa2f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${sparkPath(SERIES, 260, 56)} L260,56 L0,56 Z`}
                    fill="url(#spark)"
                  />
                  <path
                    d={sparkPath(SERIES, 260, 56)}
                    fill="none"
                    stroke="#5aa2f7"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-[#3a2a1a] bg-[#1a1206] p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#e8a33d]" strokeWidth={1.75} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-dark-text">{t("alertTitle")}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-dark-muted">{t("alertBody")}</p>
                </div>
              </div>
            </>
          ) : null}

          {tab === "price" ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.12em] text-dark-muted">{t("priceTitle")}</p>
              <div className="mt-3 overflow-hidden rounded-lg border border-dark-border">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#0c1421] text-dark-muted">
                    <tr>
                      <th className="px-2.5 py-2 font-medium">SKU</th>
                      <th className="px-2.5 py-2 font-medium">{t("cost")}</th>
                      <th className="px-2.5 py-2 font-medium">{t("now")}</th>
                      <th className="px-2.5 py-2 font-medium">{t("rec")}</th>
                    </tr>
                  </thead>
                  <tbody className="text-dark-text">
                    {[
                      ["Lenovo IdeaPad 3", "4 428", "5 200", "5 490"],
                      ["Powerbank 10000", "103", "129", "142"],
                      ["Кабел Type-C", "13", "19", "22"],
                    ].map((row) => (
                      <tr key={row[0]} className="border-t border-dark-border">
                        <td className="px-2.5 py-2">{row[0]}</td>
                        <td className="num px-2.5 py-2 text-dark-muted">{row[1]}</td>
                        <td className="num px-2.5 py-2 text-dark-muted">{row[2]}</td>
                        <td className="num px-2.5 py-2 font-semibold text-[#7bc47f]">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 rounded-lg border border-dark-border bg-[#0c1421] p-3">
                <p className="text-[11px] font-medium text-dark-accent">{t("whyTitle")}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-dark-muted">{t("whyBody")}</p>
              </div>
            </>
          ) : null}

          {tab === "sim" ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.12em] text-dark-muted">{t("simTitle")}</p>
              <div className="mt-3 space-y-3">
                {[
                  { k: t("simPrice"), v: "+4%", w: "62%" },
                  { k: t("simVolume"), v: "−3%", w: "44%" },
                  { k: t("simCost"), v: "+8%", w: "71%" },
                ].map((row) => (
                  <div key={row.k}>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-dark-muted">{row.k}</span>
                      <span className="num text-dark-text">{row.v}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#162034]">
                      <div className="h-full rounded-full bg-dark-accent" style={{ width: row.w }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-dark-border bg-[#0c1421] px-3 py-2.5">
                  <p className="text-[10px] text-dark-muted">{t("simProfit")}</p>
                  <p className="num mt-0.5 text-lg font-semibold text-[#7bc47f]">+1 240</p>
                </div>
                <div className="rounded-lg border border-dark-border bg-[#0c1421] px-3 py-2.5">
                  <p className="text-[10px] text-dark-muted">{t("survival")}</p>
                  <p className="num mt-0.5 text-lg font-semibold text-dark-text">
                    68<span className="text-xs text-dark-muted">/100</span>
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-dark-muted">{t("simNote")}</p>
            </>
          ) : null}
        </div>
      </div>

      {/* Ҷадвалҳо */}
      <div className="flex items-center gap-1 border-t border-dark-border px-3 py-2">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            tabIndex={-1}
            onClick={() => setTab(id)}
            className={`rounded-md px-2.5 py-1 text-[11px] transition-colors duration-200 ${
              tab === id ? "bg-[#17243c] text-dark-text" : "text-[#5b6b88] hover:text-dark-muted"
            }`}
          >
            {t(`tab_${id}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
