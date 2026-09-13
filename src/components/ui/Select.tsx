"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
};

/** Рӯйхати коғазӣ — бе менюи кабуди Windows. */
export function Select({
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
  id,
}: Props) {
  const autoId = useId();
  const listId = `${autoId}-list`;
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: 280 });

  const selected = options.find((row) => row.value === value);
  const label = selected?.label ?? placeholder ?? "";

  useEffect(() => {
    setMounted(true);
  }, []);

  function place(): void {
    const node = btn.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const width = Math.min(Math.max(box.width, 196), window.innerWidth - 24);
    const spaceBelow = window.innerHeight - box.bottom - 12;
    const spaceAbove = box.top - 12;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxH = Math.min(520, Math.max(160, openUp ? spaceAbove : spaceBelow));
    const top = openUp ? Math.max(12, box.top - maxH - 6) : box.bottom + 6;
    let left = box.left;
    if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
    if (left < 12) left = 12;
    setPos({ top, left, width, maxH });
  }

  useEffect(() => {
    if (!open) return;
    const index = Math.max(
      0,
      options.findIndex((row) => row.value === value),
    );
    setActive(index);
    place();
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (root.current?.contains(target) || panel.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        btn.current?.focus();
      }
    };
    requestAnimationFrame(() => panel.current?.focus());
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, options, value]);

  useEffect(() => {
    const node = panel.current;
    if (!node || !open) return;
    if (reducedMotion()) {
      gsap.set(node, { opacity: 1, y: 0, scale: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { opacity: 0, y: 8, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: EASE },
      );
    }, node);
    return () => ctx.revert();
  }, [open]);

  function pick(next: string): void {
    onChange(next);
    setOpen(false);
    btn.current?.focus();
  }

  function move(delta: number): void {
    if (!options.length) return;
    setActive((prev) => (prev + delta + options.length) % options.length);
  }

  function onTriggerKey(event: ReactKeyboardEvent<HTMLButtonElement>): void {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function onListKey(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const row = options[active];
      if (row) pick(row.value);
    }
  }

  const menu = open ? (
    <div
      ref={panel}
      id={listId}
      role="listbox"
      tabIndex={-1}
      aria-activedescendant={`${listId}-${active}`}
      className="app-select-panel fixed z-[80]"
      style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxH }}
      onKeyDown={onListKey}
    >
      {options.map((row, index) => {
        const isOn = row.value === value;
        return (
          <button
            key={row.value || `empty-${index}`}
            id={`${listId}-${index}`}
            type="button"
            role="option"
            aria-selected={isOn}
            data-active={index === active ? "true" : "false"}
            className="app-select-option"
            onMouseEnter={() => setActive(index)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(row.value)}
          >
            <span className="min-w-0 flex-1 truncate">{row.label}</span>
            {isOn ? <Icon icon={Check} className="h-4 w-4 shrink-0 text-primary" /> : null}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div ref={root} className={`app-select w-full ${className ?? ""}`}>
      <button
        ref={btn}
        id={id}
        type="button"
        disabled={disabled}
        className="app-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
        onKeyDown={onTriggerKey}
      >
        <span className={`min-w-0 flex-1 truncate ${selected ? "" : "app-select-placeholder"}`}>
          {label}
        </span>
        <Icon
          icon={ChevronDown}
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {mounted && menu ? createPortal(menu, document.body) : menu}
    </div>
  );
}
