"use client";

import { useEffect, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { ArrowUp } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export function ChatComposer({
  field,
  text,
  busy,
  placeholder,
  sendLabel,
  onChange,
  onSend,
}: {
  field: RefObject<HTMLTextAreaElement | null>;
  text: string;
  busy: boolean;
  placeholder: string;
  sendLabel: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [text, field]);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSend();
  }

  function onKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <form className="bp-chat-composer" onSubmit={submit}>
      <textarea
        ref={field}
        className="bp-chat-input"
        rows={1}
        value={text}
        placeholder={placeholder}
        disabled={busy}
        maxLength={2000}
        onKeyDown={onKey}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="submit"
        className="bp-chat-send"
        disabled={busy || !text.trim()}
        aria-label={sendLabel}
      >
        <Icon icon={ArrowUp} className="h-5 w-5" />
      </button>
    </form>
  );
}
