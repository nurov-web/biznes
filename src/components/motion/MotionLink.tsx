"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export function MotionLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className}>
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
  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
