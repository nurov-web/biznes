import { setRequestLocale } from "next-intl/server";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";
import { Hero } from "@/components/landing/Hero";
import { CtaBand } from "@/components/landing/CtaBand";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col">
      <MarketingHeader />
      <main className="min-w-0 flex-1">
        <Hero />
        <CtaBand />
      </main>
      <MarketingFooter />
    </div>
  );
}
