import { setRequestLocale } from "next-intl/server";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";
import { Hero } from "@/components/landing/Hero";
import { Metrics } from "@/components/landing/Metrics";
import { TrustBand } from "@/components/landing/TrustBand";
import { Bento } from "@/components/landing/Bento";
import { Pipeline } from "@/components/landing/Pipeline";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { CtaBand } from "@/components/landing/CtaBand";

type Props = { params: Promise<{ locale: string }> };

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col">
      <MarketingHeader />
      <main className="min-w-0 flex-1">
        <Hero />
        <Metrics />
        <TrustBand />
        <Bento />
        <Pipeline />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <MarketingFooter />
    </div>
  );
}
