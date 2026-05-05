/**
 * Core Logic for Product Data Extraction (Scraper)
 */

export interface ScrapedProduct {
  name?: string;
  price?: number;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  image?: string;
}

export async function scrapeProductUrl(url: string): Promise<ScrapedProduct> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) throw new Error("Failed to fetch page");
    
    const html = await response.text();
    const result: ScrapedProduct = {};

    // 1. Extract Basic Metadata (Title, Image)
    const titleMatch = html.match(/<meta property="og:title" content="(.*?)"/i);
    if (titleMatch) result.name = decodeHtml(titleMatch[1]);

    const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/i);
    if (imageMatch) result.image = imageMatch[1];

    // 2. Extract Price (Improved for ATB and Zakaz)
    const priceMatch = 
      html.match(/"price":\s*"?([\d.]+)"?/i) || 
      html.match(/itemprop="price" content="([\d.]+)"/i) ||
      html.match(/data-price="([\d.]+)"/i) ||
      html.match(/class="[^"]*price[^"]*">([\d.]+)</i);
    
    if (priceMatch) result.price = parseFloat(priceMatch[1]);

    // 3. Extract Macros (More robust patterns)
    const textContext = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

    const calories = textContext.match(/(?:енергетична цінність|калорійність|енергет\. цінність).*?(\d+(?:[.,]\d+)?)\s*ккал/i);
    if (calories) result.calories = parseNum(calories[1]);

    const protein = textContext.match(/(?:білки|білків|білок).*?(\d+(?:[.,]\d+)?)\s*г/i);
    if (protein) result.protein = parseNum(protein[1]);

    const fat = textContext.match(/(?:жири|жирів|жиру).*?(\d+(?:[.,]\d+)?)\s*г/i);
    if (fat) result.fat = parseNum(fat[1]);

    const carbs = textContext.match(/(?:вуглеводи|вуглеводів).*?(\d+(?:[.,]\d+)?)\s*г/i);
    if (carbs) result.carbs = parseNum(carbs[1]);

    return result;
  } catch (error) {
    console.error("[Scraper Error]:", error);
    throw error;
  }
}

function parseNum(str: string): number {
  return parseFloat(str.replace(',', '.'));
}

function decodeHtml(html: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'"
  };
  return html.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => map[m]);
}
