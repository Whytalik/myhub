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

  // All authorized users have full access to all modules

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
