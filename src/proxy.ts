import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { ACCOUNT_COOKIE, SESSION_COOKIE } from "@/constants";
import { routing } from "@/i18n/routing";
import { localeFromPathname, stripLocalePrefix } from "@/lib/locale-path";

const intl = createIntlMiddleware(routing);

/** Саҳифаҳои воқеии кор — бе cookie нест. */
const PROTECTED = [
  "/dashboard",
  "/suggestions",
  "/settings",
  "/profile",
  "/crm",
  "/pos",
  "/inventory",
  "/finance",
  "/tasks",
  "/plan",
  "/learn",
  "/integrations",
  "/agents",
  "/business",
  "/diagnosis",
  "/strategy",
  "/architecture",
  "/analytics",
  "/store",
  "/data",
  "/market",
  "/competitors",
  "/pricing",
  "/simulator",
  "/actions",
  "/ai-analysis",
] as const;

function matches(bare: string, list: readonly string[]): boolean {
  return list.some((prefix) => bare === prefix || bare.startsWith(`${prefix}/`));
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

  if (matches(bare, PROTECTED) && !hasSession(request)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = "";
    url.searchParams.set("next", bare);
    return NextResponse.redirect(url);
  }

  return intl(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
