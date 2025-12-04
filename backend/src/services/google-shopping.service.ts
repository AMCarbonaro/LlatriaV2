import axios from 'axios';
import { getGoogleConfig, validateGoogleConfig } from '../config/google.config';

export interface ShoppingResult {
  title: string;
  price: number;
  currency: string;
  link: string;
  image?: string;
  merchant: string;
  condition?: string;
  rating?: number;
  reviews?: number;
}

/**
 * Google Shopping API Service
 * 
 * Note: Google Shopping API (Merchant Center API) requires merchant account setup.
 * For price research, we'll use:
 * 1. Google Custom Search API with shopping-specific queries
 * 2. Google Shopping results via Custom Search
 * 3. Price comparison from multiple sources
 */
export class GoogleShoppingService {
  private config = getGoogleConfig();
  private customSearchUrl = 'https://www.googleapis.com/customsearch/v1';
  private shoppingApiUrl = 'https://www.googleapis.com/content/v2.1';

  constructor() {
    // Don't throw on validation - just warn (allows server to start without Google APIs)
    validateGoogleConfig(this.config);
  }

  private ensureConfigured() {
    if (!this.config.apiKey) {
      throw new Error('Google APIs are not configured. Please set GOOGLE_API_KEY in environment variables.');
    }
  }

  /**
   * Search for products on Google Shopping
   * Uses Custom Search API with shopping-focused queries and multiple search strategies
   */
  async searchProducts(query: string, options?: {
    maxResults?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
  }): Promise<ShoppingResult[]> {
    this.ensureConfigured();
    if (!this.config.customSearchEngineId) {
      throw new Error('GOOGLE_CUSTOM_SEARCH_ENGINE_ID is required for shopping search');
    }

    try {
      // Build multiple search queries for better results
      const baseQueries = [
        `${query} for sale`,
        `${query} price`,
        `buy ${query}${options?.condition ? ` ${options.condition}` : ''}`,
        `${query} marketplace`,
      ];

      const allResults: ShoppingResult[] = [];
      const seenUrls = new Set<string>();

      // Search with multiple queries
      for (const searchQuery of baseQueries.slice(0, 3)) { // Limit to 3 queries
        try {
          const response = await axios.get(this.customSearchUrl, {
            params: {
              key: this.config.apiKey,
              cx: this.config.customSearchEngineId,
              q: searchQuery,
              num: Math.min((options?.maxResults || 10) / 2, 5), // Split results across queries
              safe: 'active',
            },
          });

          for (const item of response.data.items || []) {
            // Skip duplicates
            if (seenUrls.has(item.link)) continue;
            seenUrls.add(item.link);

            const price = this.extractPriceFromSnippet(item.snippet || item.title);
            const currency = this.extractCurrency(item.snippet || item.title);

            // Filter by price range if specified
            if (options?.minPrice && price < options.minPrice) continue;
            if (options?.maxPrice && price > options.maxPrice) continue;

            // Only include items that seem like actual products
            if (price === 0 && !item.title.toLowerCase().includes(query.toLowerCase().split(' ')[0])) {
              continue; // Skip if no price and title doesn't match query
            }

            allResults.push({
              title: item.title,
              price: price || 0,
              currency: currency || 'USD',
              link: item.link,
              image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.['og:image'],
              merchant: this.extractMerchant(item.displayLink || item.link),
              condition: this.extractCondition(item.snippet || item.title),
              rating: this.extractRating(item.snippet),
              reviews: this.extractReviewCount(item.snippet),
            });
          }
        } catch (err) {
          // Continue with next query if one fails
          console.warn(`Shopping search query failed: ${searchQuery}`, err);
        }
      }

      // Sort by price relevance (prefer items with prices)
      allResults.sort((a, b) => {
        if (a.price > 0 && b.price === 0) return -1;
        if (a.price === 0 && b.price > 0) return 1;
        return 0;
      });

      return allResults.slice(0, options?.maxResults || 10);
    } catch (error: any) {
      throw new Error(`Google Shopping search error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get price comparison for a specific product
   */
  async getPriceComparison(productName: string, brand?: string): Promise<{
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    results: ShoppingResult[];
    priceRange: { min: number; max: number };
  }> {
    const query = brand ? `${brand} ${productName}` : productName;
    const results = await this.searchProducts(query, { maxResults: 20 });

    if (results.length === 0) {
      return {
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        results: [],
        priceRange: { min: 0, max: 0 },
      };
    }

    const prices = results
      .map(r => r.price)
      .filter(p => p > 0)
      .sort((a, b) => a - b);

    const minPrice = prices[0] || 0;
    const maxPrice = prices[prices.length - 1] || 0;
    const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    return {
      averagePrice,
      minPrice,
      maxPrice,
      results,
      priceRange: { min: minPrice, max: maxPrice },
    };
  }

  /**
   * Get market analysis for pricing
   */
  async getMarketAnalysis(itemName: string, brand?: string): Promise<{
    suggestedPrice: number;
    marketPrice: number;
    priceDistribution: Array<{ price: number; count: number }>;
    topMerchants: Array<{ merchant: string; averagePrice: number }>;
  }> {
    const comparison = await this.getPriceComparison(itemName, brand);

    if (comparison.results.length === 0) {
      return {
        suggestedPrice: 0,
        marketPrice: 0,
        priceDistribution: [],
        topMerchants: [],
      };
    }

    // Calculate price distribution
    const priceRanges = [
      { min: 0, max: 50 },
      { min: 50, max: 100 },
      { min: 100, max: 200 },
      { min: 200, max: 500 },
      { min: 500, max: 1000 },
      { min: 1000, max: Infinity },
    ];

    const priceDistribution = priceRanges.map(range => ({
      price: range.max === Infinity ? 1000 : range.max,
      count: comparison.results.filter(r => r.price >= range.min && r.price < range.max).length,
    }));

    // Group by merchant
    const merchantPrices: Record<string, number[]> = {};
    comparison.results.forEach(result => {
      if (!merchantPrices[result.merchant]) {
        merchantPrices[result.merchant] = [];
      }
      merchantPrices[result.merchant].push(result.price);
    });

    const topMerchants = Object.entries(merchantPrices)
      .map(([merchant, prices]) => ({
        merchant,
        averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      }))
      .sort((a, b) => b.averagePrice - a.averagePrice)
      .slice(0, 5);

    // Suggest price at 10% below average for competitive listing
    const suggestedPrice = comparison.averagePrice * 0.9;

    return {
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      marketPrice: Math.round(comparison.averagePrice * 100) / 100,
      priceDistribution,
      topMerchants,
    };
  }

  /**
   * Extract price from text with improved patterns
   */
  private extractPriceFromSnippet(text: string): number {
    if (!text) return 0;

    // More comprehensive price patterns
    const patterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/, // $99.99 or $1,999.99
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(USD|dollars?)/i, // 99.99 USD
      /price[:\s]*\$?(\d+\.?\d*)/i, // price: 99.99
      /(\d+\.?\d*)\s*(?:USD|dollars?)/i, // 99.99 USD
      /listed.*?\$(\d+\.?\d*)/i, // "listed for $99"
      /selling.*?\$(\d+\.?\d*)/i, // "selling for $99"
      /(\d+\.?\d*)\s*(?:for sale|on sale)/i, // "99.99 for sale"
      /only\s*\$?(\d+\.?\d*)/i, // "only $99"
      /\$(\d+)\s*(?:obo|or best offer)/i, // "$99 obo"
    ];

    // Try all patterns and return the most reasonable price
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const priceStr = match[1].replace(/,/g, '');
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price > 0 && price < 1000000) { // Sanity check
          return price;
        }
      }
    }

    return 0;
  }

  /**
   * Extract currency from text
   */
  private extractCurrency(text: string): string {
    if (text.includes('$') || text.toLowerCase().includes('usd') || text.toLowerCase().includes('dollar')) {
      return 'USD';
    }
    if (text.includes('€') || text.toLowerCase().includes('eur') || text.toLowerCase().includes('euro')) {
      return 'EUR';
    }
    if (text.includes('£') || text.toLowerCase().includes('gbp') || text.toLowerCase().includes('pound')) {
      return 'GBP';
    }
    return 'USD'; // Default
  }

  /**
   * Extract merchant name from URL or display link
   */
  private extractMerchant(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      // Remove www. and get domain
      return hostname.replace(/^www\./, '').split('.')[0] || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Extract condition from text
   */
  private extractCondition(text: string): string | undefined {
    const conditions = ['new', 'used', 'refurbished', 'like new', 'excellent', 'good', 'fair'];
    const lowerText = text.toLowerCase();
    
    for (const condition of conditions) {
      if (lowerText.includes(condition)) {
        return condition;
      }
    }
    
    return undefined;
  }

  /**
   * Extract rating from text
   */
  private extractRating(text: string): number | undefined {
    const ratingMatch = text.match(/(\d\.?\d*)\s*(?:out of|\/)\s*5|rating[:\s]+(\d\.?\d*)/i);
    if (ratingMatch) {
      const rating = parseFloat(ratingMatch[1] || ratingMatch[2]);
      if (!isNaN(rating) && rating >= 0 && rating <= 5) {
        return rating;
      }
    }
    return undefined;
  }

  /**
   * Extract review count from text
   */
  private extractReviewCount(text: string): number | undefined {
    const reviewMatch = text.match(/(\d+)\s*(?:reviews?|ratings?)/i);
    if (reviewMatch) {
      return parseInt(reviewMatch[1]);
    }
    return undefined;
  }
}

export const googleShoppingService = new GoogleShoppingService();

