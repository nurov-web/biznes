import { setRequestLocale } from "next-intl/server";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";
import { Hero } from "@/components/landing/Hero";
import { PurposeSteps } from "@/components/landing/PurposeSteps";
import { TrustBand } from "@/components/landing/TrustBand";
import { CtaBand } from "@/components/landing/CtaBand";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-background">
      <div className="hero-ink w-full min-w-0">
        <MarketingHeader tone="dark" />
        <Hero />
      </div>
      <main className="min-w-0 flex-1">
        <PurposeSteps />
        <TrustBand />
        <CtaBand />
      </main>
      <MarketingFooter />
    </div>
  );
}
