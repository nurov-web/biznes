/** Аломати бренд: ҳарфи геометри B — Business. */
export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M7 4v16M7 4h6.2a4.4 4.4 0 0 1 0 8.8H7M7 12.8h7.1A4.6 4.6 0 0 1 14.1 20H7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
