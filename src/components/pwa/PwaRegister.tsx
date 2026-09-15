"use client";

import { useEffect } from "react";

/** Service worker-ро як бор ба қайд мегирад. */
export function PwaRegister() {
  useEffect(() => {
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
    if (window.matchMedia("(display-mode: standalone)").matches) {
      document.documentElement.classList.add("bp-standalone");
    }
  }, []);
  return null;
}
