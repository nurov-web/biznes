import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleTransition } from "@/components/motion/LocaleTransition";
import { DocumentLang } from "@/components/motion/DocumentLang";
import { I18nClientProvider } from "@/components/i18n/I18nClientProvider";

export const metadata: Metadata = {
  title: "BusinessPilot AI",
  description: "AI + CRM + inventory for Tajikistan entrepreneurs",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <I18nClientProvider locale={locale}>
      <DocumentLang />
      <LocaleTransition>{children}</LocaleTransition>
    </I18nClientProvider>
  );
}
