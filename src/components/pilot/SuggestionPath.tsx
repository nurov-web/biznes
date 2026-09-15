"use client";

type Props = {
  steps: string[];
  heading?: string;
};

/** Қадамҳо: рақам + як ҷумла. */
export function SuggestionPath({ steps, heading }: Props) {
  if (steps.length === 0) return null;
  return (
    <div className="mt-3">
      {heading ? <p className="mb-2 text-xs font-medium text-muted-foreground">{heading}</p> : null}
      <ol className="grid gap-2">
        {steps.map((text, index) => (
          <li key={`${index}-${text.slice(0, 24)}`} className="flex items-start gap-2.5">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary"
              aria-hidden
            >
              {index + 1}
            </span>
            <p className="min-w-0 text-sm leading-snug text-foreground">{text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
