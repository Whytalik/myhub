import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getAccessToken } from "@/lib/fatsecret/client";
import { prisma } from "@/lib/db/prisma";

const PENDING_COOKIE = "fatsecret-pending-link";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const oauthToken = request.nextUrl.searchParams.get("oauth_token");
  const oauthVerifier = request.nextUrl.searchParams.get("oauth_verifier");

  const cookieStore = await cookies();
  const pendingRaw = cookieStore.get(PENDING_COOKIE)?.value;
  cookieStore.delete(PENDING_COOKIE);

  if (!oauthToken || !oauthVerifier || !pendingRaw) {
    return redirectWithStatus(request, "error", "missing_params");
  }

  const pending = JSON.parse(pendingRaw) as {
    profileId: string;
    oauthToken: string;
    oauthTokenSecret: string;
  };

  if (pending.oauthToken !== oauthToken) {
    return redirectWithStatus(request, "error", "token_mismatch");
  }

  try {
    const accessToken = await getAccessToken(
      { key: pending.oauthToken, secret: pending.oauthTokenSecret },
      oauthVerifier,
    );

    await prisma.fatSecretAccount.upsert({
      where: { profileId: pending.profileId },
      create: {
        profileId: pending.profileId,
        accessToken: accessToken.accessToken,
        accessTokenSecret: accessToken.accessTokenSecret,
      },
      update: {
        accessToken: accessToken.accessToken,
        accessTokenSecret: accessToken.accessTokenSecret,
      },
    });

    return redirectWithStatus(request, "linked", pending.profileId);
  } catch (error) {
    console.error("FatSecret access token exchange failed", error);
    return redirectWithStatus(request, "error", "exchange_failed");
  }
}

function redirectWithStatus(request: NextRequest, status: string, detail: string) {
  const url = new URL("/health/nutrition", request.url);
  url.searchParams.set("fatsecret", status);
  url.searchParams.set("profile", detail);
  return NextResponse.redirect(url);
}
