"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/PageShell";

type Task = { id: string; title: string; dueAt: string | null; done: boolean };

export default function TasksPage() {
  const t = useTranslations("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/tasks");
    const data = (await r.json()) as { tasks?: Task[] };
    setTasks(data.tasks ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueAt: dueAt || null }),
      });
      setTitle("");
      setDueAt("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggle(task: Task) {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, done: !task.done }),
    });
    await load();
  }

  const open = tasks.filter((task) => !task.done);
  const done = tasks.filter((task) => task.done);

  return (
    <PageShell title={t("title")}>
      <form onSubmit={onSubmit} className="card-raised flex flex-wrap items-end gap-3 p-5">
        <label className="grid min-w-56 flex-1 gap-1.5 text-sm font-medium">
          {t("add")}
          <input
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="grid w-44 gap-1.5 text-sm font-medium">
          {t("due")}
          <input
            className="input-field"
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          {t("add")}
        </button>
      </form>

      <ul className="space-y-2">
        {[...open, ...done].map((task) => (
          <li
            key={task.id}
            className="card-raised flex items-center gap-3 px-4 py-3 transition-colors duration-200"
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-[color:var(--primary)]"
              checked={task.done}
              onChange={() => void toggle(task)}
              aria-label={task.title}
            />
            <span className={`flex-1 text-sm ${task.done ? "text-muted-foreground line-through" : ""}`}>
              {task.title}
            </span>
            {task.dueAt ? (
              <span className="num text-xs text-muted-foreground">{task.dueAt.slice(0, 10)}</span>
            ) : null}
          </li>
        ))}
        {tasks.length === 0 ? (
          <li className="card-raised px-4 py-6 text-center text-sm text-muted-foreground">—</li>
        ) : null}
      </ul>
    </PageShell>
  );
}
