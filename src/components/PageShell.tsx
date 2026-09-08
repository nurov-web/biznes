import type { ReactNode } from "react";

export function PageShell({
  title,
  lead,
  eyebrow,
  action,
  children,
}: {
  title: string;
  lead?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow text-primary">{eyebrow}</p> : null}
          <h1 className="display-2 mt-1">{title}</h1>
          {lead ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{lead}</p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

export function LoadState({ loading, error, empty }: { loading: boolean; error: boolean; empty?: string }) {
  if (loading) return <p className="p-6 text-sm text-muted-foreground">{empty || "…"}</p>;
  if (error) return <p className="p-6 text-sm text-destructive">{empty || "Error"}</p>;
  return null;
}
