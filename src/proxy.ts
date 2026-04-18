import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = !!req.auth;
  const { nextUrl } = req;

  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/favicon.ico" ||
    nextUrl.pathname.startsWith("/api/auth");

  if (isPublicRoute) return NextResponse.next();

  if (isAuthRoute) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/home", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Admin and Role Restrictions
  const user = req.auth?.user as any;
  const role = user?.role;
  const isAdmin = role === "ADMIN";

  const restrictedPrefixes = ["/food", "/languages", "/library", "/fitness"];
  const isRestrictedRoute = restrictedPrefixes.some(prefix => nextUrl.pathname.startsWith(prefix));

  if (!isAdmin && isRestrictedRoute) {
    return NextResponse.redirect(new URL("/life/journal", nextUrl));
  }

  // Allow everyone to see the root "/" and base "/life"
  // No forced redirects from allowed base pages

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
