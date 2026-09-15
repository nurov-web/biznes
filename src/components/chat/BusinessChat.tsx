"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { MessageCircle, SquarePen, X } from "lucide-react";
import { Icon, IconWell } from "@/components/ui/Icon";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatMessage } from "@/components/chat/ChatMessage";

type Turn = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "bp-chat-turns";

function loadTurns(): Turn[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is Turn => {
      if (!row || typeof row !== "object") return false;
      const rec = row as Record<string, unknown>;
      return (rec.role === "user" || rec.role === "assistant") && typeof rec.content === "string";
    });
  } catch {
    return [];
  }
}

/** Чат дар ҳамаи саҳифаҳо — ИИ ҷавоб медиҳад. */
export function BusinessChat() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const [seen, setSeen] = useState(true);
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    setTurns(loadTurns());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns.slice(-20)));
    } catch {
      return;
    }
  }, [turns, mounted]);

  useEffect(() => {
    if (!open) return;
    const apply = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--vvh", `${Math.round(h)}px`);
    };
    apply();
    window.visualViewport?.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    return () => {
      window.visualViewport?.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      document.documentElement.style.removeProperty("--vvh");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSeen(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const id = window.setTimeout(() => field.current?.focus(), 80);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(id);
    };
  }, [open]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, open]);

  const ask = useCallback(
    async (history: Turn[]) => {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: history }),
      });
      if (response.status === 429) return t("rate");
      if (!response.ok) return t("error");
      const data = (await response.json()) as { answer?: string };
      return data.answer?.trim() || t("error");
    },
    [locale, t],
  );

  async function send(raw: string): Promise<void> {
    const question = raw.trim();
    if (!question || busy) return;
    const next: Turn[] = [...turns, { role: "user", content: question }];
    setTurns(next);
    setText("");
    setBusy(true);
    try {
      const answer = await ask(next);
      setTurns([...next, { role: "assistant", content: answer }]);
      if (!open) setSeen(false);
    } catch {
      setTurns([...next, { role: "assistant", content: t("error") }]);
    } finally {
      setBusy(false);
    }
  }

  async function regen(): Promise<void> {
    if (busy) return;
    let cut = turns.length;
    for (let i = turns.length - 1; i >= 0; i -= 1) {
      if (turns[i]?.role === "assistant") {
        cut = i;
        break;
      }
    }
    const history = turns.slice(0, cut);
    if (history.length === 0 || history[history.length - 1]?.role !== "user") return;
    setTurns(history);
    setBusy(true);
    try {
      const answer = await ask(history);
      setTurns([...history, { role: "assistant", content: answer }]);
    } catch {
      setTurns([...history, { role: "assistant", content: t("error") }]);
    } finally {
      setBusy(false);
    }
  }

  function copy(index: number, content: string) {
    void navigator.clipboard.writeText(content).then(() => {
      setCopiedAt(index);
      window.setTimeout(() => setCopiedAt(null), 1600);
    });
  }

  function reset() {
    setTurns([]);
    setText("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
  }

  function close() {
    setOpen(false);
    window.setTimeout(() => opener.current?.focus(), 40);
  }

  const hints = [t("hintPrice"), t("hintStock"), t("hintCash")];
  const follows = [t("follow1"), t("follow2"), t("follow3")];
  const lastAssistant = turns.length > 0 && turns[turns.length - 1]?.role === "assistant";

  const sheet = open ? (
    <div className="bp-chat-overlay" onClick={close}>
      <div
        ref={panel}
        className="bp-chat-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="bp-chat-head">
          <IconWell icon={MessageCircle} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{t("title")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{busy ? t("thinking") : t("online")}</p>
          </div>
          <button type="button" className="bp-chat-iconbtn" aria-label={t("newChat")} onClick={reset} disabled={busy}>
            <Icon icon={SquarePen} className="h-4 w-4" />
          </button>
          <button type="button" className="bp-chat-iconbtn" aria-label={t("close")} onClick={close}>
            <Icon icon={X} className="h-4 w-4" />
          </button>
        </header>
        <div ref={list} className="bp-chat-list">
          {turns.length === 0 ? (
            <div className="grid gap-2">
              <div className="bp-chat-bubble-ai">
                <p>{t("hello")}</p>
              </div>
              {hints.map((hint) => (
                <button key={hint} type="button" className="bp-chat-hint" disabled={busy} onClick={() => void send(hint)}>
                  {hint}
                </button>
              ))}
            </div>
          ) : (
            turns.map((turn, index) => (
              <ChatMessage
                key={`${turn.role}-${index}`}
                turn={turn}
                lastAssistant={!busy && lastAssistant && index === turns.length - 1}
                copied={copiedAt === index}
                copyLabel={t("copy")}
                copiedLabel={t("copied")}
                regenLabel={t("regen")}
                onCopy={() => copy(index, turn.content)}
                onRegen={() => void regen()}
              />
            ))
          )}
          {busy ? (
            <div className="bp-chat-bubble-ai bp-chat-wait" role="status">
              <span className="bp-chat-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              {t("thinking")}
            </div>
          ) : null}
          {!busy && lastAssistant ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {follows.map((hint) => (
                <button key={hint} type="button" className="bp-chat-hint bp-chat-hint-sm" onClick={() => void send(hint)}>
                  {hint}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <ChatComposer
          field={field}
          text={text}
          busy={busy}
          placeholder={t("placeholder")}
          sendLabel={t("send")}
          onChange={setText}
          onSend={() => void send(text)}
        />
      </div>
    </div>
  ) : null;

  if (open && sheet) {
    if (mounted && typeof document !== "undefined") {
      return createPortal(sheet, document.body);
    }
    return sheet;
  }

  return (
    <button
      ref={opener}
      type="button"
      className="bp-chat-fab no-print"
      aria-label={t("open")}
      aria-expanded={false}
      onClick={() => setOpen(true)}
    >
      <Icon icon={MessageCircle} className="pointer-events-none h-5 w-5" />
      <span className="sr-only">{t("badge")}</span>
      {seen ? null : <span className="bp-chat-dot" aria-hidden />}
    </button>
  );
}
