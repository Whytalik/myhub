import { signedFetch, type OAuth1Token } from "./oauth1";
import { fatsecretFetch } from "./proxy-fetch";

const REQUEST_TOKEN_URL = "https://authentication.fatsecret.com/oauth/request_token";
const AUTHORIZE_URL = "https://authentication.fatsecret.com/oauth/authorize";
const ACCESS_TOKEN_URL = "https://authentication.fatsecret.com/oauth/access_token";
const REST_API_URL = "https://platform.fatsecret.com/rest/server.api";
const OAUTH2_TOKEN_URL = "https://oauth.fatsecret.com/connect/token";

function parseOAuthResponse(body: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(body));
}

export interface RequestTokenResult {
  oauthToken: string;
  oauthTokenSecret: string;
}

/** Step 1 of the 3-legged flow: get an unauthorized request token. */
export async function getRequestToken(callbackUrl: string): Promise<RequestTokenResult> {
  const body = await signedFetch(REQUEST_TOKEN_URL, { oauth_callback: callbackUrl });
  const parsed = parseOAuthResponse(body);
  if (!parsed.oauth_token || !parsed.oauth_token_secret) {
    throw new Error(`Unexpected FatSecret request_token response: ${body}`);
  }
  return { oauthToken: parsed.oauth_token, oauthTokenSecret: parsed.oauth_token_secret };
}

/** Step 2: URL to redirect the user to for approval. */
export function getAuthorizeUrl(oauthToken: string): string {
  return `${AUTHORIZE_URL}?oauth_token=${encodeURIComponent(oauthToken)}`;
}

export interface AccessTokenResult {
  accessToken: string;
  accessTokenSecret: string;
}

/** Step 3: exchange the approved request token for a durable access token. */
export async function getAccessToken(
  requestToken: OAuth1Token,
  oauthVerifier: string,
): Promise<AccessTokenResult> {
  const body = await signedFetch(ACCESS_TOKEN_URL, { oauth_verifier: oauthVerifier }, requestToken);
  const parsed = parseOAuthResponse(body);
  if (!parsed.oauth_token || !parsed.oauth_token_secret) {
    throw new Error(`Unexpected FatSecret access_token response: ${body}`);
  }
  return { accessToken: parsed.oauth_token, accessTokenSecret: parsed.oauth_token_secret };
}

export type FatSecretMealType = "breakfast" | "lunch" | "dinner" | "other";

export interface CreateFoodEntryInput {
  accessToken: OAuth1Token;
  foodId: string;
  servingId: string;
  numberOfUnits: number;
  meal: FatSecretMealType;
  entryName: string;
  /** Defaults to today (UTC). */
  date?: Date;
}

function daysSinceEpoch(date: Date): number {
  return Math.floor(date.getTime() / 86_400_000);
}

/** Writes one entry into the user's FatSecret food diary (delegated, OAuth1). */
export async function createFoodEntry(input: CreateFoodEntryInput): Promise<void> {
  const body = await signedFetch(
    REST_API_URL,
    {
      method: "food_entry.create",
      format: "json",
      food_id: input.foodId,
      food_entry_name: input.entryName,
      serving_id: input.servingId,
      number_of_units: String(input.numberOfUnits),
      meal: input.meal,
      date: String(daysSinceEpoch(input.date ?? new Date())),
    },
    input.accessToken,
  );

  const parsed = JSON.parse(body) as { error?: { message?: string } };
  if (parsed.error) {
    throw new Error(parsed.error.message ?? "FatSecret food_entry.create failed");
  }
}

interface OAuth2TokenCache {
  accessToken: string;
  expiresAt: number;
}

let oauth2Cache: OAuth2TokenCache | null = null;

/** App-level (non-delegated) OAuth2 token — used for read-only food search/lookup. */
async function getOAuth2Token(): Promise<string> {
  if (oauth2Cache && oauth2Cache.expiresAt > Date.now()) {
    return oauth2Cache.accessToken;
  }

  const key = process.env.FATSECRET_CONSUMER_KEY;
  const secret = process.env.FATSECRET_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error("FATSECRET_CONSUMER_KEY / FATSECRET_CONSUMER_SECRET not configured");
  }

  const response = await fatsecretFetch(OAUTH2_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "basic" }).toString(),
  });

  if (!response.ok) {
    throw new Error(`FatSecret OAuth2 token request failed (${response.status})`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  oauth2Cache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export interface FoodSearchResultItem {
  food_id: string;
  food_name: string;
  food_description?: string;
}

function assertNoFatSecretError(data: unknown, context?: string): void {
  const error = (data as { error?: { message?: string; code?: number } } | undefined)?.error;
  if (error) {
    const ctx = context ? ` [${context}]` : "";
    throw new Error(
      `FatSecret API error ${error.code ?? "?"}: ${error.message ?? "unknown"}${ctx}`,
    );
  }
}

/** Read-only food search (OAuth2 client-credentials, no per-user auth needed). */
export async function searchFoods(query: string): Promise<FoodSearchResultItem[]> {
  const token = await getOAuth2Token();
  const url = new URL(REST_API_URL);
  url.searchParams.set("method", "foods.search");
  url.searchParams.set("format", "json");
  url.searchParams.set("search_expression", query);

  const response = await fatsecretFetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await response.json()) as {
    foods?: { food?: FoodSearchResultItem | FoodSearchResultItem[] };
  };
  assertNoFatSecretError(data, `foods.search query="${query}"`);
  const food = data.foods?.food;
  if (!food) return [];
  return Array.isArray(food) ? food : [food];
}

export interface FoodServing {
  serving_id: string;
  serving_description: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  /** "g"/"ml" for continuous gram/millilitre servings — FatSecret then treats
   *  food_entry.create's number_of_units as the raw quantity, not a multiple
   *  of metric_serving_amount. Anything else (oz, cup, serving...) is discrete. */
  measurement_description?: string;
  calories?: string;
  protein?: string;
  fat?: string;
  carbohydrate?: string;
}

export interface FoodDetail {
  food_id: string;
  food_name: string;
  servings: { serving: FoodServing | FoodServing[] };
}

/** Read-only food detail lookup — used to find a gram-based serving to map to. */
export async function getFood(foodId: string, accessToken?: OAuth1Token): Promise<FoodDetail> {
  if (accessToken) {
    const body = await signedFetch(
      REST_API_URL,
      { method: "food.get.v5", food_id: foodId, format: "json" },
      accessToken,
    );
    const data = JSON.parse(body) as { food?: FoodDetail };
    assertNoFatSecretError(data, `food.get.v5 food_id=${foodId}`);
    if (!data.food) throw new Error(`FatSecret food.get.v5 returned no food for id ${foodId}`);
    return data.food;
  }

  const token = await getOAuth2Token();
  const url = new URL(REST_API_URL);
  url.searchParams.set("method", "food.get.v5");
  url.searchParams.set("format", "json");
  url.searchParams.set("food_id", foodId);

  const response = await fatsecretFetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await response.json()) as { food?: FoodDetail };
  assertNoFatSecretError(data, `food.get.v5 food_id=${foodId}`);
  if (!data.food) throw new Error(`FatSecret food.get.v5 returned no food for id ${foodId}`);
  return data.food;
}

export interface FavoriteFood {
  food_id: string;
  food_name: string;
  food_type: "Brand" | "Generic";
  food_description?: string;
  serving_id?: string;
  number_of_units?: string;
}

/**
 * Delegated (OAuth1) — foods the user favorited inside the actual FatSecret app.
 * This is how we get real branded products into the mapper: FatSecret's Basic-tier
 * search/food.get only surfaces generic USDA-style entries, and food.find_id_for_barcode
 * is Premier-exclusive (confirmed: this account's token never carries "barcode" scope
 * even when no scope is requested). Favoriting in-app sidesteps both limits.
 */
export async function getFavorites(accessToken: OAuth1Token): Promise<FavoriteFood[]> {
  const body = await signedFetch(
    REST_API_URL,
    { method: "foods.get_favorites.v2", format: "json" },
    accessToken,
  );
  const data = JSON.parse(body) as { foods?: { food?: FavoriteFood | FavoriteFood[] } };
  assertNoFatSecretError(data);
  const food = data.foods?.food;
  if (!food) return [];
  return Array.isArray(food) ? food : [food];
}

/** Delegated (OAuth1) — returns the most frequently eaten foods for the user. */
export async function getMostEaten(accessToken: OAuth1Token): Promise<FavoriteFood[]> {
  const body = await signedFetch(
    REST_API_URL,
    { method: "foods.get_most_eaten", format: "json" },
    accessToken,
  );
  const data = JSON.parse(body) as { foods?: { food?: FavoriteFood | FavoriteFood[] } };
  assertNoFatSecretError(data);
  const food = data.foods?.food;
  if (!food) return [];
  return Array.isArray(food) ? food : [food];
}

/** Delegated (OAuth1) — returns the most recently logged foods for the user. */
export async function getRecentlyEaten(accessToken: OAuth1Token): Promise<FavoriteFood[]> {
  const body = await signedFetch(
    REST_API_URL,
    { method: "foods.get_recently_eaten", format: "json" },
    accessToken,
  );
  const data = JSON.parse(body) as { foods?: { food?: FavoriteFood | FavoriteFood[] } };
  assertNoFatSecretError(data);
  const food = data.foods?.food;
  if (!food) return [];
  return Array.isArray(food) ? food : [food];
}

export interface FoodEntryItem {
  food_entry_id: string;
  food_entry_name: string;
  food_id: string;
  serving_id?: string;
}

/** Delegated (OAuth1) — returns the food diary entries for a given date. */
export async function getFoodEntriesForDate(
  date: Date,
  accessToken: OAuth1Token,
): Promise<FoodEntryItem[]> {
  const body = await signedFetch(
    REST_API_URL,
    {
      method: "food_entries.get.v2",
      date: String(daysSinceEpoch(date)),
      format: "json",
    },
    accessToken,
  );
  const data = JSON.parse(body) as {
    food_entries?: { food_entry?: FoodEntryItem | FoodEntryItem[] };
  };
  assertNoFatSecretError(data);
  const entry = data.food_entries?.food_entry;
  if (!entry) return [];
  return Array.isArray(entry) ? entry : [entry];
}
