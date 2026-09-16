"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

type Props = {
  stages: string[];
  running: boolean;
  title: string;
};

/** Марҳилаҳои фаҳмо — бе номи модели ИИ. */
export function ThinkingStages({ stages, running, title }: Props) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!running) {
      setDone(0);
      return;
    }
    setDone(0);
    const timers: number[] = [];
    stages.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => {
          setDone(index + 1);
        }, 450 * (index + 1)),
      );
    });
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
    // stages ҳамчун матн — на reference.
  }, [running, stages.join("|")]);

  if (!running) return null;

  return (
    <div className="card-raised p-5" role="status" aria-live="polite">
      <p className="text-sm font-medium">{title}</p>
      <ol className="mt-4 grid gap-2">
        {stages.map((label, index) => {
          const ready = index < done;
          return (
            <li key={label} className="flex items-center gap-2 text-sm">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  ready ? "bg-success text-white" : "bg-muted text-muted-foreground"
                }`}
                aria-hidden
              >
                {ready ? <Check className="h-3.5 w-3.5" strokeWidth={2.25} /> : index + 1}
              </span>
              <span className={ready ? "text-foreground" : "text-muted-foreground"}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
