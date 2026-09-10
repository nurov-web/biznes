import { Link } from "@/i18n/navigation";

/** Ҳолати холӣ: як паём ва як амал. */
export function ModuleEmpty({
  title,
  lead,
  href,
  cta,
}: {
  title: string;
  lead: string;
  href?: string;
  cta?: string;
}) {
  return (
    <article className="card-raised p-6">
      <h2 className="display-3">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{lead}</p>
      {href && cta ? (
        <Link href={href} className="btn btn-primary mt-4 min-h-12">
          {cta}
        </Link>
      ) : null}
    </article>
  );
}
