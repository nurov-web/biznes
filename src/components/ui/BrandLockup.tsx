import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/ui/BrandMark";

type Props = {
  size?: number;
  dark?: boolean;
  className?: string;
};

/** Нишона + ном: як ранг, бе ороиши кӯдакона. */
export function BrandLockup({ size = 22, dark = false, className = "" }: Props) {
  const t = useTranslations("nav");
  return (
    <span className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <span className={dark ? "text-white" : "text-primary"}>
        <BrandMark size={size} />
      </span>
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
