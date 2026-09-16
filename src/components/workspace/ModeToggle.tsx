"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  readWorkspaceMode,
  writeWorkspaceMode,
  WORKSPACE_MODE_EVENT,
  type WorkspaceMode,
} from "@/lib/workspace-mode";

/** Содда барои соҳиб, Pro барои рақами зиёд. */
export function ModeToggle() {
  const t = useTranslations("workspace");
  const [mode, setMode] = useState<WorkspaceMode>("simple");

  useEffect(() => {
    const sync = () => setMode(readWorkspaceMode());
    sync();
    window.addEventListener(WORKSPACE_MODE_EVENT, sync);
    return () => window.removeEventListener(WORKSPACE_MODE_EVENT, sync);
  }, []);

  function pick(next: WorkspaceMode) {
    writeWorkspaceMode(next);
    setMode(next);
  }

  return (
    <div className="inline-flex rounded-xl border border-white/15 p-0.5" role="group" aria-label={t("modeAria")}>
      <button
        type="button"
        className={`min-h-10 rounded-lg px-3 text-xs font-medium ${
          mode === "simple" ? "bg-white/15 text-white" : "text-dark-muted"
        }`}
        aria-pressed={mode === "simple"}
        onClick={() => pick("simple")}
      >
        {t("simple")}
      </button>
      <button
        type="button"
        className={`min-h-10 rounded-lg px-3 text-xs font-medium ${
          mode === "pro" ? "bg-white/15 text-white" : "text-dark-muted"
        }`}
        aria-pressed={mode === "pro"}
        onClick={() => pick("pro")}
      >
        {t("pro")}
      </button>
    </div>
  );
}
