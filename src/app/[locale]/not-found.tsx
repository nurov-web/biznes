import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <main className="gutter-x mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center py-16">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="display-2 mt-2">{t("notFoundTitle")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("notFoundLead")}</p>
      <Link href="/" className="btn btn-primary mt-8 min-h-12 w-fit">
        {t("notFoundHome")}
      </Link>
    </main>
  );
}
