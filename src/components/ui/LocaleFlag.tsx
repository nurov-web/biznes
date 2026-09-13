import type { ReactNode } from "react";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  locale: AppLocale;
};

/** Парчамҳои SVG — на эмодзи, то дар Windows ҳам ҳамвор бошанд. */
export function LocaleFlag({ locale }: Props) {
  return (
    <span className="locale-flag" aria-hidden>
      {locale === "tg" ? <FlagTj /> : locale === "ru" ? <FlagRu /> : <FlagGb />}
    </span>
  );
}

function FlagFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 22 15" width="24" height="16" className="block overflow-hidden rounded-[2px]">
      {children}
    </svg>
  );
}

function FlagTj() {
  return (
    <FlagFrame>
      <rect width="22" height="15" fill="#fff" />
      <rect width="22" height="4" fill="#CC0000" />
      <rect y="11" width="22" height="4" fill="#006600" />
      <g fill="#F8C300">
        <circle cx="8.2" cy="6.15" r="0.55" />
        <circle cx="9.6" cy="5.45" r="0.55" />
        <circle cx="11" cy="5.15" r="0.55" />
        <circle cx="12.4" cy="5.45" r="0.55" />
        <circle cx="13.8" cy="6.15" r="0.55" />
        <path d="M9.15 8.05h3.7c0 .85-3.7.85-3.7 0z" />
        <path d="M8.85 7.35h4.3v.55H8.85z" />
        <path d="M11 6.45 11.35 7.3h.95l-.75.52.28.88L11 8.2l-.83.5.28-.88-.75-.52h.95z" />
      </g>
    </FlagFrame>
  );
}

function FlagRu() {
  return (
    <FlagFrame>
      <rect width="22" height="5" fill="#fff" />
      <rect y="5" width="22" height="5" fill="#0039A6" />
      <rect y="10" width="22" height="5" fill="#D52B1E" />
    </FlagFrame>
  );
}

function FlagGb() {
  return (
    <FlagFrame>
      <rect width="22" height="15" fill="#012169" />
      <path stroke="#fff" strokeWidth="2.4" d="M0 0 22 15M22 0 0 15" />
      <path stroke="#C8102E" strokeWidth="1.2" d="M0 0 22 15M22 0 0 15" />
      <path stroke="#fff" strokeWidth="4" d="M11 0v15M0 7.5h22" />
      <path stroke="#C8102E" strokeWidth="2.2" d="M11 0v15M0 7.5h22" />
    </FlagFrame>
  );
}
