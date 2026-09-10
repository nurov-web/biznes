import { redirect } from "next/navigation";

export default async function RedirectStore({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/store`);
}
