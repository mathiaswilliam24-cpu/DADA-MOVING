import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/fleet",
  "/pricing",
  "/how-it-works",
  "/booking",
  "/auth",
  "/api/auth",
  "/api/vans",
  "/api/taxes",
];

const ADMIN_PATHS = ["/admin"];
const CUSTOMER_PATHS = ["/dashboard", "/profile", "/bookings"];
const DRIVER_PATHS = ["/driver"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?"));
}

// Optimistic edge check — full auth is enforced server-side
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const sessionCookie =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionCookie) {
    if (
      ADMIN_PATHS.some((p) => pathname.startsWith(p)) ||
      CUSTOMER_PATHS.some((p) => pathname.startsWith(p)) ||
      DRIVER_PATHS.some((p) => pathname.startsWith(p))
    ) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
