"use client";

import { useEffect } from "react";

/** Service worker-ро як бор ба қайд мегирад. */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const host = window.location.hostname;
    const local = host === "localhost" || host === "127.0.0.1";
    if (process.env.NODE_ENV !== "production" && !local) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
    if (window.matchMedia("(display-mode: standalone)").matches) {
      document.documentElement.classList.add("bp-standalone");
    }
  }, []);
  return null;
}
