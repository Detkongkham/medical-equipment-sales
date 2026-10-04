import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n";

// Send requests without a locale prefix to the default locale (Lao).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))) return;
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, the admin area and any path with a file extension (images, sitemap.xml, robots.txt).
  matcher: ["/((?!_next|admin|.*\\..*).*)"],
};
