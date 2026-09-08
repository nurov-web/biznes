import type { LucideIcon } from "lucide-react";

export function Icon({
  icon: Glyph,
  className,
  strokeWidth = 1.75,
}: {
  icon: LucideIcon;
  className?: string;
  strokeWidth?: number;
}) {
  return <Glyph className={className} strokeWidth={strokeWidth} aria-hidden />;
}

export function IconWell({
  icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={`grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-800 ${className ?? ""}`}
    >
      <Icon icon={icon} className="h-5 w-5" />
    </span>
  );
}
