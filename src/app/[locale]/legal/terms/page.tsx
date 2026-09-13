import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <MarketingHeader />
      <main className="gutter-x mx-auto w-full max-w-2xl flex-1 py-12">
        <h1 className="display-2">{t("termsTitle")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("termsLead")}</p>
        <ul className="mt-8 grid gap-4 text-sm leading-relaxed">
          <li>{t("terms1")}</li>
          <li>{t("terms2")}</li>
          <li>{t("terms3")}</li>
        </ul>
      </main>
      <MarketingFooter />
    </div>
  );
}
