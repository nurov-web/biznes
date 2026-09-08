type Point = { day: string; value: number };

/** Диаграммаи сутунӣ бе китобхонаи беруна. */
export function SalesChart({ points, label }: { points: Point[]; label: string }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const empty = points.every((p) => p.value === 0);

  return (
    <figure className="card-raised p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="display-3">{label}</span>
        <span className="num text-sm text-muted-foreground">
          {Math.round(points.reduce((s, p) => s + p.value, 0)).toLocaleString("ru-RU")} TJS
        </span>
      </figcaption>
      <div className="mt-5 flex h-32 items-end gap-1.5" role="img" aria-label={label}>
        {points.map((p) => (
          <div key={p.day} className="group flex h-full flex-1 flex-col justify-end gap-1.5">
            <div
              className={`w-full rounded-t-md transition-[height,background-color] duration-500 ${
                empty ? "bg-muted" : "bg-primary/85 group-hover:bg-primary"
              }`}
              style={{ height: `${empty ? 4 : Math.max(4, (p.value / max) * 100)}%` }}
              title={`${p.day}: ${Math.round(p.value)} TJS`}
            />
            <span className="num text-center text-[10px] text-muted-foreground">{p.day}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
