"use client";

import { useEffect } from "react";
import { getDeferredPrompt, isStandaloneApp, PWA_AVAILABLE_EVENT } from "@/lib/pwa";

/** Service worker-ро як бор ба қайд мегирад. */
export function PwaRegister() {
  useEffect(() => {
    if (isStandaloneApp()) {
      document.documentElement.classList.add("bp-standalone");
    }
    if (getDeferredPrompt()) {
      window.dispatchEvent(new Event(PWA_AVAILABLE_EVENT));
    }
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((rows) => {
        rows.forEach((row) => {
          void row.unregister();
        });
      });
      return;
    }
    void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
  }, []);
  return null;
}
