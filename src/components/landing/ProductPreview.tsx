"use client";

import { useTranslations } from "next-intl";

/** Намунаи дафтар дар равзана — на рақами дурӯғи дӯкони кас. */
export function ProductPreview() {
  const t = useTranslations("preview");
  const tiles = [
    { n: "01", title: t("p1t"), text: t("p1d") },
    { n: "02", title: t("p2t"), text: t("p2d") },
    { n: "03", title: t("p3t"), text: t("p3d") },
  ];

  return (
    <div
      className="w-full max-w-full overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#151b26] shadow-[var(--shadow-xl)] select-none"
      aria-hidden
    >
      <div className="flex min-w-0 items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-dark-muted">
          {t("window")}
        </p>
        <p className="hidden text-[11px] text-dark-muted sm:block">{t("sample")}</p>
      </div>
      <div className="space-y-3 bg-[#f6f4ef] p-4">
        <ul className="grid gap-2 sm:grid-cols-3">
          {tiles.map((tile) => (
            <li key={tile.n} className="rounded-2xl border border-[#e2ddd4] bg-[#fffcf7] px-3 py-3">
              <p className="font-mono text-[11px] text-primary">{tile.n}</p>
              <p className="mt-1.5 text-sm font-semibold text-ink">{tile.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tile.text}</p>
            </li>
          ))}
        </ul>
        <p className="rounded-2xl bg-primary px-4 py-3 text-center text-sm font-medium text-on-primary">
          {t("flow")}
        </p>
      </div>
    </div>
  );
}
