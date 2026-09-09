import type { ReactNode } from "react";

/** Қуттии устувор — бе key, то ивази забон дарахтро нест накунад. */
export function LocaleTransition({ children }: { children: ReactNode }) {
  return <div className="w-full min-w-0 overflow-x-clip">{children}</div>;
}
