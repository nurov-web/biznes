import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleTransition } from "@/components/motion/LocaleTransition";
import { DocumentLang } from "@/components/motion/DocumentLang";
import { I18nClientProvider } from "@/components/i18n/I18nClientProvider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safe = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const messages = (await import(`../../../messages/${safe}.json`)).default as {
    meta: { title: string; description: string };
  };
  return {
    title: messages.meta.title,
    description: messages.meta.description,
  };
}

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
