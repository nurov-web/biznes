type Props = {
  title: string;
  items: { id: string; message: string }[];
};

/** Сводка ошибок формы — фокус после submit (WCAG). */
export function FormErrorSummary({ title, items }: Props) {
  if (items.length === 0) return null;
  return (
    <div
      id="form-errors"
      role="alert"
      tabIndex={-1}
      className="rounded-xl border border-destructive/30 bg-destructive/10 p-4"
    >
      <h2 className="text-sm font-semibold text-destructive">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="underline">
              {item.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
