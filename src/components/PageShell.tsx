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
    <div className="gutter-x mx-auto w-full min-w-0 max-w-6xl space-y-6 overflow-x-clip py-4 md:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow text-primary">{eyebrow}</p> : null}
          <h1 className="display-2 mt-1">{title}</h1>
          {lead ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{lead}</p>
          ) : null}
        </div>
        {action ? <div className="w-full shrink-0 sm:w-auto [&>.btn]:w-full sm:[&>.btn]:w-auto">{action}</div> : null}
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
