import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

/** Саҳифаи 404 бо забони ҷорӣ. */
export async function NotFoundScreen() {
  const t = await getTranslations("errors");
  const locale = await getLocale();
  return (
    <main className="gutter-x mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center py-16">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="display-2 mt-2">{t("notFoundTitle")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("notFoundLead")}</p>
      <Link href={`/${locale}`} className="btn btn-primary mt-8 min-h-12 w-fit">
        {t("notFoundHome")}
      </Link>
    </main>
  );
}
