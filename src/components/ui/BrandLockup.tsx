import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/ui/BrandMark";

type Props = {
  size?: number;
  dark?: boolean;
  className?: string;
};

/** Нишона + ном: акс + калимаи Business. */
export function BrandLockup({ size = 28, dark = false, className = "" }: Props) {
  const t = useTranslations("nav");
  return (
    <span className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <BrandMark size={size} />
      <span
        className={`truncate text-[15px] font-medium tracking-tight ${
          dark ? "text-white" : "text-foreground"
        }`}
      >
        {t("brand")}
      </span>
    </span>
  );
}
