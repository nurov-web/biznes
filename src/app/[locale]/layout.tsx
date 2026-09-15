import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleTransition } from "@/components/motion/LocaleTransition";
import { DocumentLang } from "@/components/motion/DocumentLang";
import { I18nClientProvider } from "@/components/i18n/I18nClientProvider";
import { BusinessChat } from "@/components/chat/BusinessChat";
import { SiteIntro } from "@/components/motion/SiteIntro";
import { InstallApp } from "@/components/pwa/InstallApp";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { siteOrigin } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safe = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const messages = (await import(`../../../messages/${safe}.json`)).default as {
    meta: { title: string; description: string; siteName: string };
  };
  const origin = siteOrigin();
  const ogLocale = safe === "tg" ? "tg_TJ" : safe === "ru" ? "ru_RU" : "en_US";
  return {
    metadataBase: new URL(origin),
    title: messages.meta.title,
    description: messages.meta.description,
    alternates: {
      canonical: `/${safe}`,
      languages: {
        tg: "/tg",
        ru: "/ru",
        en: "/en",
        "x-default": "/tg",
      },
    },
    openGraph: {
      title: messages.meta.title,
      description: messages.meta.description,
      locale: ogLocale,
      type: "website",
      url: `/${safe}`,
      siteName: messages.meta.siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: messages.meta.title,
      description: messages.meta.description,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: messages.meta.siteName,
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
    },
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
  const messages = await getMessages();
  return (
    <I18nClientProvider locale={locale} messages={messages}>
      <DocumentLang />
      <LocaleTransition>{children}</LocaleTransition>
      <SiteIntro />
      <BusinessChat />
      <InstallApp />
      <PwaRegister />
    </I18nClientProvider>
  );
}
