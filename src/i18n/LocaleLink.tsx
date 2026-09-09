"use client";

import { forwardRef, type ComponentProps } from "react";
import { useClientLocaleOptional } from "@/components/i18n/I18nClientProvider";
import { IntlLink } from "@/i18n/navigation-base";

type Props = ComponentProps<typeof IntlLink>;

/**
 * Пас аз ивази забон бе навигатсия, линкҳо ҳамон locale-и ҷориро нигоҳ медоранд.
 */
export const Link = forwardRef<HTMLAnchorElement, Props>(function LocaleLink(
  { locale, ...props },
  ref,
) {
  const current = useClientLocaleOptional();
  return <IntlLink ref={ref} locale={locale ?? current} {...props} />;
});
