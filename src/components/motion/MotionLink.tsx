"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { Link } from "@/i18n/navigation";

function press(node: HTMLElement | null) {
  if (!node) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.fromTo(node, { scale: 0.98 }, { scale: 1, duration: 0.18, ease: "power2.out", overwrite: "auto" });
}

export function MotionLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      onPointerDown={() => press(ref.current)}
    >
      {children}
    </Link>
  );
}

export function MotionButton({
  className,
  children,
  type = "button",
  onClick,
  disabled,
  ariaLabel,
}: {
  className?: string;
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type={type}
      className={className}
      disabled={disabled}
      aria-label={ariaLabel}
      onPointerDown={() => press(ref.current)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
