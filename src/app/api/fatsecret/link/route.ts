import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getRequestToken, getAuthorizeUrl } from "@/lib/fatsecret/client";

const PENDING_COOKIE = "fatsecret-pending-link";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const profileId = request.nextUrl.searchParams.get("profile");
  if (profileId !== "vitalii" && profileId !== "olesia") {
    return NextResponse.json({ error: "Invalid or missing profile" }, { status: 400 });
  }

  const callbackUrl = new URL("/api/fatsecret/callback", request.url).toString();
  const requestToken = await getRequestToken(callbackUrl);

  const cookieStore = await cookies();
  cookieStore.set(PENDING_COOKIE, JSON.stringify({ profileId, ...requestToken }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(getAuthorizeUrl(requestToken.oauthToken));
}
