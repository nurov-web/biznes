/** Аломати бренд: B-и 3D бо барқ. */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- нишонаи хурд аз /public, бе оптимизатор
    <img
      src="/icon-192.png"
      alt=""
      width={size}
      height={size}
      draggable={false}
      className="shrink-0 rounded-md object-cover"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
