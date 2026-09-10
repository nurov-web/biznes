import { redirect } from "next/navigation";

/** Саҳифаҳои зиёдатӣ — ба кори дӯкон бармегардонем. */
export default async function HiddenRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard`);
}
