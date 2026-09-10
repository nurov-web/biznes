"use client";

import { Check, Lock } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/i18n/navigation";

export type PathLesson = {
  id: string;
  title: string;
  xp: number;
  done: boolean;
  locked: boolean;
};

export type PathUnit = {
  id: string;
  title: string;
  lead: string;
  recommended?: boolean;
  lessons: PathLesson[];
};

export function LearnPath({
  units,
  nextLessonId,
  unitLabel,
  xpLabel,
  recLabel,
}: {
  units: PathUnit[];
  nextLessonId: string | null;
  unitLabel: string;
  xpLabel: string;
  recLabel: string;
}) {
  return (
    <div className="space-y-10">
      {units.map((unit, ui) => (
        <section key={unit.id}>
          <header className="mb-5">
            <p className="eyebrow text-primary">
              {unitLabel} {ui + 1}
              {unit.recommended ? ` · ${recLabel}` : ""}
            </p>
            <h2 className="display-3 mt-1">{unit.title}</h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">{unit.lead}</p>
          </header>
          <ol className="relative space-y-4 pl-2">
            <span
              className="absolute bottom-6 left-[1.4rem] top-6 w-px bg-border"
              aria-hidden
            />
            {unit.lessons.map((lesson, i) => {
              const current = lesson.id === nextLessonId;
              const offset = i % 2 === 0 ? "" : "sm:ml-10";
              const inner = (
                <>
                  <span
                    className={`relative z-[1] grid h-11 w-11 shrink-0 place-items-center rounded-full border text-sm ${
                      lesson.done
                        ? "border-transparent bg-primary text-on-primary"
                        : current
                          ? "border-primary bg-card text-primary shadow-[0_0_0_6px_rgb(21_101_192/0.12)]"
                          : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {lesson.done ? (
                      <Icon icon={Check} className="h-4 w-4" />
                    ) : lesson.locked ? (
                      <Icon icon={Lock} className="h-4 w-4" />
                    ) : (
                      <span className="num">{i + 1}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{lesson.title}</span>
                    <span className="num mt-0.5 block text-xs text-muted-foreground">
                      {lesson.xp} {xpLabel}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={lesson.id} className={offset}>
                  {lesson.locked ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-muted-foreground">
                      {inner}
                    </div>
                  ) : (
                    <Link
                      href={`/learn/${lesson.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-transparent px-2 py-2 transition-colors duration-200 hover:border-border hover:bg-muted/50"
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
