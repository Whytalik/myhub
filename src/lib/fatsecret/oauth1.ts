import crypto from "crypto";
import OAuth from "oauth-1.0a";

function getOAuth(): OAuth {
  const key = process.env.FATSECRET_CONSUMER_KEY;
  const secret = process.env.FATSECRET_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error("FATSECRET_CONSUMER_KEY / FATSECRET_CONSUMER_SECRET not configured");
  }

  return new OAuth({
    consumer: { key, secret },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, signingKey) {
      return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
    },
  });
}

export interface OAuth1Token {
  key: string;
  secret: string;
}

/**
 * Signs and executes a FatSecret OAuth 1.0a request (3-legged: request token,
 * access token exchange, and delegated diary writes all go through this).
 */
export async function signedFetch(
  url: string,
  params: Record<string, string>,
  token?: OAuth1Token,
): Promise<string> {
  const oauth = getOAuth();
  const requestData = { url, method: "POST", data: params };
  const authorized = oauth.authorize(requestData, token);
  const body = new URLSearchParams({ ...params, ...pickOAuthParams(authorized) });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`FatSecret OAuth1 request failed (${response.status}): ${text}`);
  }
  return text;
}

function pickOAuthParams(authorized: OAuth.Authorization): Record<string, string> {
  const entries = Object.entries(authorized).filter(([k]) => k.startsWith("oauth_"));
  return Object.fromEntries(entries.map(([k, v]) => [k, String(v)]));
}
