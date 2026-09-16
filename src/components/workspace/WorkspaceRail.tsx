"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { BrandLockup } from "@/components/ui/BrandLockup";
import {
  isNavActive,
  PRO_RAIL,
  SIMPLE_RAIL,
  type WorkspaceNavItem,
} from "@/constants/workspace";
import type { WorkspaceMode } from "@/lib/workspace-mode";

function RailLink({ item, pathname }: { item: WorkspaceNavItem; pathname: string }) {
  const t = useTranslations("workspace");
  const active = isNavActive(pathname, item.href);
  return (
    <Link href={item.href} className="rail-link" aria-current={active ? "page" : undefined}>
      <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
      {t(`nav.${item.key}`)}
    </Link>
  );
}

/** Менюи desktop — Simple кам, Pro пурра. */
export function WorkspaceRail({ mode }: { mode: WorkspaceMode }) {
  const t = useTranslations("workspace");
  const pathname = usePathname();

  return (
    <aside className="app-rail hidden w-60 shrink-0 md:flex md:flex-col">
      <Link href="/dashboard" className="flex items-center px-4 py-5 text-white" aria-label={t("nav.today")}>
        <BrandLockup size={28} dark />
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 pb-4">
        {mode === "simple"
          ? SIMPLE_RAIL.map((item) => <RailLink key={item.href} item={item} pathname={pathname} />)
          : PRO_RAIL.map((block) => (
              <div key={block.group} className="mb-2">
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-dark-muted">
                  {t(`group.${block.group}`)}
                </p>
                {block.items.map((item) => (
                  <RailLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            ))}
      </nav>
    </aside>
  );
}
