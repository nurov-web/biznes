/** Аломати бренд: дафтар + хати болорав — на ҳарфи BP. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className="shrink-0"
      aria-hidden
    >
      <rect width="32" height="32" rx="9" fill="#1565c0" />
      <path
        d="M8.5 21.5 13.2 16.2 17.1 19.1 23.5 11"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23.5" cy="11" r="1.7" fill="#fff" />
      <path
        d="M8.5 24.2h15"
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
