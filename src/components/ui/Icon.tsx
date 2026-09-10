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
      className={`grid h-9 w-9 place-items-center rounded-[4px] border border-border bg-muted text-foreground ${className ?? ""}`}
    >
      <Icon icon={icon} className="h-5 w-5" />
    </span>
  );
}
