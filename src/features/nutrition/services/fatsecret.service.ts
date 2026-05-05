import { unstable_cache } from 'next/cache';

const FATSECRET_CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const FATSECRET_CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;
const TOKEN_URL = 'https://oauth.api.fatsecret.com/connect/token';
const API_URL = 'https://platform.fatsecret.com/rest/server.api';

interface FatSecretToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Service to interact with the FatSecret Platform API.
 */
export class FatSecretService {
  private static async getAccessToken(): Promise<string> {
    if (!FATSECRET_CLIENT_ID || !FATSECRET_CLIENT_SECRET) {
      throw new Error('FATSECRET_CLIENT_ID or FATSECRET_CLIENT_SECRET is not defined in environment variables.');
    }

    const credentials = btoa(`${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`);
    
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=basic',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch FatSecret access token: ${error}`);
    }

    const data = (await response.json()) as FatSecretToken;
    return data.access_token;
  }

  /**
   * Cached version of the token getter.
   */
  private static getCachedToken = unstable_cache(
    async () => this.getAccessToken(),
    ['fatsecret-token'],
    { revalidate: 3000 } // Revalidate slightly before 3600s expiration
  );

  private static async apiRequest(method: string, params: Record<string, string>) {
    const token = await this.getCachedToken();
    
    const searchParams = new URLSearchParams({
      method,
      format: 'json',
      ...params,
    });

    const response = await fetch(`${API_URL}?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`FatSecret API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search for food products.
   */
  static async searchProducts(query: string) {
    const data = await this.apiRequest('foods.search.v2', {
      search_expression: query,
      max_results: '20',
    });

    // FatSecret search results are nested under foods.food
    const foods = data.foods?.food || [];
    return Array.isArray(foods) ? foods : [foods];
  }

  /**
   * Get detailed nutrition information for a food item.
   */
  static async getProductDetails(foodId: string) {
    const data = await this.apiRequest('food.get.v2', {
      food_id: foodId,
    });

    if (!data.food) {
      throw new Error('Food product not found in FatSecret database.');
    }

    return data.food;
  }
}
