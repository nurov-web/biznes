"use client";

import { forwardRef, type ComponentProps } from "react";
import { IntlLink } from "@/i18n/navigation-base";

type Props = ComponentProps<typeof IntlLink>;

/**
 * Пас аз ивази забон бе навигатсия, линкҳо ҳамон locale-и ҷориро нигоҳ медоранд.
 */
export const Link = forwardRef<HTMLAnchorElement, Props>(function LocaleLink(
  { locale, ...props },
  ref,
) {
  if (locale) {
    return <IntlLink ref={ref} locale={locale} {...props} />;
  }
  return <IntlLink ref={ref} {...props} />;
});
