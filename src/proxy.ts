import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { ACCOUNT_COOKIE, SESSION_COOKIE } from "@/constants";
import { routing } from "@/i18n/routing";
import { localeFromPathname, stripLocalePrefix } from "@/lib/locale-path";

const intl = createIntlMiddleware(routing);

/** Саҳифаҳое, ки бе cookie намешаванд. */
const PROTECTED = [
  "/dashboard",
  "/suggestions",
  "/has-business",
  "/start-business",
  "/settings",
  "/profile",
] as const;

/**
 * Панелҳои кӯҳна (касса, анбор, CRM…). Маҳсули сайт курс ва нақшаи фурӯш аст —
 * то соҳибкор ду барномаи ҷудогонаро набинад, ҳама ба панел бармегарданд.
 */
const LEGACY = [
  "/crm",
  "/pos",
  "/inventory",
  "/finance",
  "/tasks",
  "/simulator",
  "/pricing",
  "/plan",
  "/market",
  "/learn",
  "/integrations",
  "/data",
  "/competitors",
  "/ai-analysis",
  "/agents",
  "/actions",
  "/store",
] as const;

function matches(bare: string, list: readonly string[]): boolean {
  return list.some((prefix) => bare === prefix || bare.startsWith(`${prefix}/`));
}

function isProtected(bare: string): boolean {
  return matches(bare, PROTECTED);
}

function hasSession(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(SESSION_COOKIE)?.value || request.cookies.get(ACCOUNT_COOKIE)?.value,
  );
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromPathname(pathname);
  const bare = stripLocalePrefix(pathname);

  if (bare === "/onboarding" || bare.startsWith("/onboarding/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/has-business`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (matches(bare, LEGACY)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isProtected(bare) && !hasSession(request)) {
    const url = request.nextUrl.clone();
    const gate = bare === "/has-business" || bare === "/start-business" ? "register" : "login";
    url.pathname = `/${locale}/${gate}`;
    url.search = "";
    url.searchParams.set("next", bare);
    return NextResponse.redirect(url);
  }

  return intl(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
