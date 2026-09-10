/** Аломати бренд — ҳарф, на нишонаи бозӣ. */
export function BrandMark({ size = 32 }: { size?: number }) {
  const px = `${size}px`;
  const text = size >= 32 ? "text-[11px]" : "text-[10px]";
  return (
    <span
      className={`grid shrink-0 place-items-center bg-ink font-semibold tracking-tight text-white ${text}`}
      style={{ width: px, height: px, borderRadius: 4 }}
      aria-hidden
    >
      BP
    </span>
  );
}
