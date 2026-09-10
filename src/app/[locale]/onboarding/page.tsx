"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { StartChoice } from "@/components/onboarding/StartChoice";
import { ExistingBusinessFlow } from "@/components/onboarding/ExistingBusinessFlow";
import { NewBusinessFlow } from "@/components/onboarding/NewBusinessFlow";
import { LanguageSwitch } from "@/components/LanguageSwitch";

type Path = "choice" | "running" | "idea";

export default function OnboardingPage() {
  const router = useRouter();
  const [path, setPath] = useState<Path>("choice");

  useEffect(() => {
    let cancelled = false;
    const pull = () => fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
    void pull()
      .then(async (r) => {
        if (r.status !== 401) return r;
        await new Promise((done) => setTimeout(done, 350));
        return pull();
      })
      .then((r) => {
        if (!cancelled && r.status === 401) router.replace("/login");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="gutter-x mx-auto max-w-3xl py-8 sm:py-10">
      <div className="mb-6 flex justify-end">
        <LanguageSwitch />
      </div>
      {path === "choice" ? <StartChoice onPick={setPath} /> : null}
      {path === "running" ? <ExistingBusinessFlow onBack={() => setPath("choice")} /> : null}
      {path === "idea" ? <NewBusinessFlow onBack={() => setPath("choice")} /> : null}
    </div>
  );
}
