"use client";

import { Copy, Check, RotateCw } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { ChatRichText } from "@/components/chat/ChatRichText";

type Turn = { role: "user" | "assistant"; content: string };

export function ChatMessage({
  turn,
  lastAssistant,
  copied,
  copyLabel,
  copiedLabel,
  regenLabel,
  onCopy,
  onRegen,
}: {
  turn: Turn;
  lastAssistant: boolean;
  copied: boolean;
  copyLabel: string;
  copiedLabel: string;
  regenLabel: string;
  onCopy: () => void;
  onRegen: () => void;
}) {
  const user = turn.role === "user";
  return (
    <article className={user ? "bp-chat-row bp-chat-row-user" : "bp-chat-row"}>
      <div className={user ? "bp-chat-bubble-user" : "bp-chat-bubble-ai"}>
        {user ? turn.content : <ChatRichText text={turn.content} />}
      </div>
      {user ? null : (
        <div className="bp-chat-actions">
          <button type="button" className="bp-chat-iconbtn" aria-label={copyLabel} onClick={onCopy}>
            <Icon icon={copied ? Check : Copy} className="h-4 w-4" />
            <span>{copied ? copiedLabel : copyLabel}</span>
          </button>
          {lastAssistant ? (
            <button type="button" className="bp-chat-iconbtn" aria-label={regenLabel} onClick={onRegen}>
              <Icon icon={RotateCw} className="h-4 w-4" />
              <span>{regenLabel}</span>
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}
