"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

type Turn = { role: "user" | "assistant"; content: string };

/** Чат дар як ҷо — дар ҳамаи саҳифаҳо. Танҳо саволи бизнес. */
export function BusinessChat() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const id = window.setTimeout(() => field.current?.focus(), 80);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
    };
  }, [open]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, open]);

  async function send(raw: string): Promise<void> {
    const question = raw.trim();
    if (!question || busy) return;
    const next: Turn[] = [...turns, { role: "user", content: question }];
    setTurns(next);
    setText("");
    setBusy(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: next }),
      });
      if (response.status === 429) {
        setTurns([...next, { role: "assistant", content: t("rate") }]);
        return;
      }
      if (!response.ok) {
        setTurns([...next, { role: "assistant", content: t("error") }]);
        return;
      }
      const data = (await response.json()) as { answer?: string };
      setTurns([...next, { role: "assistant", content: data.answer?.trim() || t("error") }]);
    } catch {
      setTurns([...next, { role: "assistant", content: t("error") }]);
    } finally {
      setBusy(false);
    }
  }

  const hints = [t("hintPrice"), t("hintStock"), t("hintCash")];

  const sheet = open ? (
    <div className="bp-chat" role="dialog" aria-modal="true" aria-label={t("title")}>
      <div ref={panel} className="bp-chat-panel">
        <header className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{t("title")}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t("lead")}</p>
          </div>
          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          >
            <Icon icon={X} className="h-5 w-5" />
          </button>
        </header>
        <div ref={list} className="bp-chat-list">
          {turns.length === 0 ? (
            <div className="grid gap-2 px-1">
              {hints.map((hint) => (
                <button
                  key={hint}
                  type="button"
                  className="bp-chat-hint"
                  onClick={() => void send(hint)}
                >
                  {hint}
                </button>
              ))}
            </div>
          ) : (
            turns.map((turn, index) => (
              <p
                key={`${turn.role}-${index}`}
                className={turn.role === "user" ? "bp-chat-bubble-user" : "bp-chat-bubble-ai"}
              >
                {turn.content}
              </p>
            ))
          )}
          {busy ? <p className="bp-chat-bubble-ai text-muted-foreground">{t("thinking")}</p> : null}
        </div>
        <form
          className="flex items-end gap-2 border-t border-border px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            void send(text);
          }}
        >
          <textarea
            ref={field}
            className="input-field min-h-12 max-h-28 flex-1 resize-none py-3"
            rows={1}
            value={text}
            placeholder={t("placeholder")}
            disabled={busy}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(text);
              }
            }}
            onChange={(event) => setText(event.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary grid h-12 w-12 shrink-0 place-items-center p-0"
            disabled={busy || !text.trim()}
            aria-label={t("send")}
          >
            <Icon icon={ArrowUp} className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  ) : null;

  if (!mounted) {
    return (
      <button type="button" className="bp-chat-fab no-print" aria-label={t("open")} disabled>
        <Icon icon={MessageCircle} className="h-5 w-5" />
      </button>
    );
  }

  return (
    <>
      {open ? null : (
        <button
          type="button"
          className="bp-chat-fab no-print"
          aria-label={t("open")}
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          <Icon icon={MessageCircle} className="h-5 w-5" />
        </button>
      )}
      {sheet ? createPortal(sheet, document.body) : null}
    </>
  );
}
