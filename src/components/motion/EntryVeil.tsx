"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

/** Пардаи торик ҳангоми гузариш аз вуруд ба панел — бе флеши сафед. */
export function EntryVeil() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 z-[200] section-dark" aria-hidden />;
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] section-dark" aria-hidden />,
    document.body,
  );
}
