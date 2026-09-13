import { setRequestLocale } from "next-intl/server";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingHeader } from "@/components/MarketingHeader";
import { Hero } from "@/components/landing/Hero";
import { WhatItDoes } from "@/components/landing/WhatItDoes";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { HonestBit } from "@/components/landing/HonestBit";
import { LandingFaq } from "@/components/landing/LandingFaq";

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
        <WhatItDoes />
        <HowItWorks />
        <HonestBit />
        <LandingFaq />
      </main>
      <MarketingFooter />
    </div>
  );
}
