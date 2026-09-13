import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

/** Ҷараёни кӯҳна → анкетаи нав. */
export default async function OnboardingRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/has-business`);
}
