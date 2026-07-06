import crypto from "crypto";
import OAuth from "oauth-1.0a";
import { fatsecretFetch } from "./proxy-fetch";

function getOAuth(): OAuth {
  // Separate from FATSECRET_CONSUMER_KEY/SECRET (used for OAuth2 client-credentials
  // search) — FatSecret issues a distinct OAuth 1.0 Consumer Key/Secret pair
  // specifically for signing 3-legged requests.
  const key = process.env.FATSECRET_OAUTH1_CONSUMER_KEY;
  const secret = process.env.FATSECRET_OAUTH1_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error(
      "FATSECRET_OAUTH1_CONSUMER_KEY / FATSECRET_OAUTH1_CONSUMER_SECRET not configured",
    );
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
  const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

  const response = await fatsecretFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...authHeader },
    body: new URLSearchParams(params).toString(),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`FatSecret OAuth1 request failed (${response.status}): ${text}`);
  }
  return text;
}
