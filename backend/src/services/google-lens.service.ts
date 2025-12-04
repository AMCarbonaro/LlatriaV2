import axios from 'axios';
import { getGoogleConfig, validateGoogleConfig } from '../config/google.config';
import { AIData } from '../types/inventory.types';
import { googleShoppingService } from './google-shopping.service';

/**
 * Google Lens API Service
 * 
 * Note: Google Lens doesn't have a direct public API.
 * We'll use Google Vision API for image recognition and
 * Google Custom Search API for visual search capabilities.
 */
export class GoogleLensService {
  private config = getGoogleConfig();
  private visionApiUrl = 'https://vision.googleapis.com/v1/images:annotate';
  private customSearchUrl = 'https://www.googleapis.com/customsearch/v1';

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
   * Analyze image using Google Vision API
   * This provides object detection, label detection, text recognition, web detection, and logo detection
   */
  async analyzeImage(imageBase64: string): Promise<{
    labels: Array<{ description: string; score: number }>;
    objects: Array<{ name: string; score: number }>;
    text: string;
    webEntities: Array<{ description: string; score: number }>;
    bestGuessLabels: Array<string>;
    pagesWithMatchingImages: Array<{ url: string; pageTitle: string }>;
    logos: Array<{ description: string; score: number }>;
  }> {
    this.ensureConfigured();
    try {
      const response = await axios.post(
        `${this.visionApiUrl}?key=${this.config.visionApiKey}`,
        {
          requests: [
            {
              image: {
                content: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 20 },
                { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
                { type: 'TEXT_DETECTION', maxResults: 10 },
                { type: 'WEB_DETECTION', maxResults: 10 },
                { type: 'LOGO_DETECTION', maxResults: 5 },
              ],
            },
          ],
        }
      );

      const result = response.data.responses[0];
      const webDetection = result.webDetection || {};
      
      return {
        labels: result.labelAnnotations?.map((label: any) => ({
          description: label.description,
          score: label.score,
        })) || [],
        objects: result.localizedObjectAnnotations?.map((obj: any) => ({
          name: obj.name,
          score: obj.score,
        })) || [],
        text: result.textAnnotations?.[0]?.description || '',
        webEntities: webDetection.webEntities?.map((entity: any) => ({
          description: entity.description,
          score: entity.score || 0,
        })) || [],
        bestGuessLabels: webDetection.bestGuessLabels?.map((label: any) => label.label) || [],
        pagesWithMatchingImages: webDetection.pagesWithMatchingImages?.map((page: any) => ({
          url: page.url,
          pageTitle: page.pageTitle,
        })) || [],
        logos: result.logoAnnotations?.map((logo: any) => ({
          description: logo.description,
          score: logo.score,
        })) || [],
      };
    } catch (error: any) {
      throw new Error(`Google Vision API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Visual search using Google Custom Search API
   * This allows searching for similar products/images with better query strategies
   */
  async visualSearch(imageUrl: string, query?: string, brand?: string): Promise<Array<{
    title: string;
    link: string;
    snippet: string;
    price?: number;
  }>> {
    if (!this.config.customSearchEngineId) {
      throw new Error('GOOGLE_CUSTOM_SEARCH_ENGINE_ID is required for visual search');
    }

    try {
      // Build better search queries
      const queries = brand 
        ? [
            `${brand} ${query} for sale price`,
            `${brand} ${query} used marketplace`,
            `${query} ${brand} buy`,
          ]
        : [
            `${query} for sale price`,
            `${query} used marketplace`,
            `buy ${query}`,
          ];

      const allResults: Array<{
        title: string;
        link: string;
        snippet: string;
        price?: number;
      }> = [];

      // Search with multiple queries for better results
      for (const searchQuery of queries.slice(0, 2)) { // Limit to 2 queries to avoid rate limits
        try {
          const response = await axios.get(this.customSearchUrl, {
            params: {
              key: this.config.apiKey,
              cx: this.config.customSearchEngineId,
              q: searchQuery,
              num: 5, // Get fewer results per query but from multiple queries
            },
          });

          const items = response.data.items?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet || item.title,
            price: this.extractPrice(item.snippet || item.title),
          })) || [];

          allResults.push(...items);
        } catch (err) {
          // Continue with next query if one fails
          console.warn(`Search query failed: ${searchQuery}`, err);
        }
      }

      // Deduplicate by URL
      const seen = new Set<string>();
      const uniqueResults = allResults.filter(item => {
        if (seen.has(item.link)) {
          return false;
        }
        seen.add(item.link);
        return true;
      });

      // Filter out items with no price or very low prices (likely not products)
      const filteredResults = uniqueResults.filter(item => {
        if (!item.price || item.price < 1) {
          // Still include if it has a good title/snippet match
          return item.title.toLowerCase().includes(query?.toLowerCase() || '');
        }
        return item.price > 0 && item.price < 1000000; // Sanity check
      });

      // Sort by price relevance (prefer items with prices)
      return filteredResults.sort((a, b) => {
        if (a.price && !b.price) return -1;
        if (!a.price && b.price) return 1;
        return 0;
      }).slice(0, 10);
    } catch (error: any) {
      throw new Error(`Google Custom Search API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Recognize item from image and generate AIData
   */
  async recognizeItem(imageBase64: string): Promise<AIData> {
    try {
      // Analyze image with Vision API
      const analysis = await this.analyzeImage(imageBase64);

      // Extract brand from logos first, then from text/labels
      const topLogo = analysis.logos[0];
      let brand = topLogo?.description || this.extractBrand(analysis.labels, analysis.text);

      // Extract product name from text (highest priority - most accurate)
      const productFromText = this.extractProductFromText(analysis.text, brand);
      
      // Extract model from text
      let model = this.extractModel(analysis.text) || productFromText?.model;

      // Get all recognition sources
      const bestGuess = analysis.bestGuessLabels[0];
      const webEntities = analysis.webEntities || [];
      const topWebEntity = webEntities[0];
      const topObject = analysis.objects[0];
      const topLabel = analysis.labels[0];

      // Try to extract product info from web entities (often more accurate than bestGuess)
      const productFromWeb = this.extractProductFromWebEntities(webEntities, brand);
      if (productFromWeb) {
        if (!brand && productFromWeb.brand) brand = productFromWeb.brand;
        if (!model && productFromWeb.model) model = productFromWeb.model;
      }

      let recognizedItem: string;
      let confidence: number;

      if (productFromText?.name) {
        // Use product name extracted from text - most reliable
        recognizedItem = productFromText.name;
        confidence = 0.95;
      } else if (productFromWeb?.name) {
        // Use product from web entities (often very accurate)
        recognizedItem = productFromWeb.name;
        confidence = 0.90;
      } else if (brand && this.isAppleProduct(analysis)) {
        // If brand is Apple and we detect laptop/computer, construct MacBook
        const appleProduct = this.constructAppleProduct(analysis, brand, model);
        if (appleProduct) {
          recognizedItem = appleProduct;
          confidence = 0.85;
        } else if (bestGuess && !bestGuess.toLowerCase().includes('netbook')) {
          // Use best guess but avoid generic terms like "netbook"
          recognizedItem = bestGuess;
          confidence = 0.80;
        } else if (topWebEntity?.description) {
          recognizedItem = topWebEntity.description;
          confidence = topWebEntity.score || 0.75;
        } else {
          recognizedItem = brand ? `${brand} Laptop` : 'Laptop';
          confidence = 0.70;
        }
      } else if (bestGuess && !this.isGenericTerm(bestGuess)) {
        // Use web detection best guess if it's not too generic
        recognizedItem = bestGuess;
        confidence = 0.85;
      } else if (topWebEntity?.description) {
        recognizedItem = topWebEntity.description;
        confidence = topWebEntity.score || 0.75;
      } else if (topObject?.name) {
        recognizedItem = topObject.name;
        confidence = topObject.score || 0.7;
      } else if (topLabel?.description) {
        recognizedItem = topLabel.description;
        confidence = topLabel.score || 0.6;
      } else {
        recognizedItem = 'Unknown Item';
        confidence = 0.5;
      }

      // Update brand if we found it from web entities
      if (!brand && productFromWeb?.brand) {
        brand = productFromWeb.brand;
      }

      // Build search query with brand + model + product name for better results
      const searchQuery = this.buildSearchQuery(recognizedItem, brand, model);
      
      // Try to get better prices using Google Shopping API if we have specific product info
      let averagePrice = 0;
      let allSimilarItems: Array<{
        title: string;
        link: string;
        snippet: string;
        price?: number;
      }> = [];

      try {
        // Use Google Shopping service for better price research when we have specific product
        if (productFromText || (brand && model) || confidence > 0.8) {
          const shoppingQuery = model ? `${brand || ''} ${model}`.trim() : searchQuery;
          const shoppingResults = await googleShoppingService.searchProducts(shoppingQuery, {
            maxResults: 10,
            condition: 'used',
          });

          // Convert shopping results to similar items format
          allSimilarItems = shoppingResults.map(item => ({
            title: item.title,
            link: item.link,
            snippet: `${item.merchant} - ${item.condition || 'used'}`,
            price: item.price,
          }));

          // Calculate average from shopping results
          const shoppingPrices = shoppingResults
            .map(item => item.price)
            .filter(price => price > 0);
          
          if (shoppingPrices.length > 0) {
            averagePrice = shoppingPrices.reduce((sum, price) => sum + price, 0) / shoppingPrices.length;
          }
        }
      } catch (error) {
        console.warn('Google Shopping API failed, falling back to visual search:', error);
      }

      // Fallback to visual search if shopping didn't work or didn't return enough results
      if (allSimilarItems.length < 3) {
        const visualSearchItems = await this.visualSearch('', searchQuery, brand);
        allSimilarItems = [...allSimilarItems, ...visualSearchItems];
      }

      // Also use web detection pages as additional similar items
      const webSimilarItems = analysis.pagesWithMatchingImages
        .slice(0, 3)
        .map(page => ({
          title: page.pageTitle,
          link: page.url,
          snippet: '',
          price: undefined,
        }));

      // Combine and deduplicate
      allSimilarItems = [...allSimilarItems, ...webSimilarItems];
      const seen = new Set<string>();
      const uniqueSimilarItems = allSimilarItems.filter(item => {
        if (seen.has(item.link)) return false;
        seen.add(item.link);
        return true;
      });

      // Recalculate average price from all sources if we didn't get good results from shopping
      if (averagePrice === 0 || averagePrice < 10) {
        const prices = uniqueSimilarItems
          .map(item => item.price)
          .filter((price): price is number => price !== undefined && price > 0);
        
        if (prices.length > 0) {
          averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        }
      }

      // Generate better description
      const description = this.generateDescription(analysis, recognizedItem, brand);

      return {
        recognizedItem,
        confidence,
        marketPrice: averagePrice || 0,
        suggestedPrice: averagePrice > 0 ? Math.round(averagePrice * 0.9 * 100) / 100 : 0, // Suggest 10% below market
        description,
        category: this.inferCategory(analysis.labels, analysis.webEntities),
        condition: this.inferCondition(analysis.labels, analysis.text), // Better condition detection
        brand: brand,
        model: this.extractModel(analysis.text),
        specifications: this.extractSpecifications(analysis.text),
        similarItems: uniqueSimilarItems.slice(0, 8).map(item => ({
          title: item.title,
          price: item.price || 0,
          platform: this.extractPlatform(item.link),
          url: item.link,
        })),
      };
    } catch (error: any) {
      throw new Error(`Failed to recognize item: ${error.message}`);
    }
  }

  /**
   * Extract price from text snippet with improved patterns
   */
  private extractPrice(text: string): number | undefined {
    if (!text) return undefined;

    // More comprehensive price patterns
    const patterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/, // $99.99 or $1,999.99
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(USD|dollars?)/i, // 99.99 USD
      /price[:\s]*\$?(\d+\.?\d*)/i, // price: 99.99
      /(\d+\.?\d*)\s*(?:USD|dollars?)/i, // 99.99 USD
      /listed.*?\$(\d+\.?\d*)/i, // "listed for $99"
      /selling.*?\$(\d+\.?\d*)/i, // "selling for $99"
      /(\d+\.?\d*)\s*(?:for sale|on sale)/i, // "99.99 for sale"
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

    return undefined;
  }

  /**
   * Generate better description from analysis results
   */
  private generateDescription(
    analysis: { 
      labels: Array<{ description: string }>; 
      text: string;
      webEntities: Array<{ description: string }>;
      bestGuessLabels: Array<string>;
    },
    recognizedItem: string,
    brand?: string
  ): string {
    // Start with the recognized item
    let description = recognizedItem;

    // Add brand if available
    if (brand) {
      description = `${brand} ${description}`;
    }

    // Use top 3 most confident labels for key features
    const topLabels = analysis.labels
      .slice(0, 3)
      .map(label => label.description)
      .filter(label => {
        // Filter out generic labels
        const generic = ['product', 'object', 'thing', 'item', 'goods'];
        return !generic.includes(label.toLowerCase());
      });

    if (topLabels.length > 0) {
      description += ` - ${topLabels.join(', ')}`;
    }

    // Add web entity descriptions if available (often more specific)
    if (analysis.webEntities.length > 0) {
      const topWebEntity = analysis.webEntities[0].description;
      if (topWebEntity && topWebEntity !== recognizedItem) {
        description += `. ${topWebEntity}`;
      }
    }

    // Add detected text if it looks like product info (not just random text)
    if (analysis.text && analysis.text.length > 10) {
      const textPreview = analysis.text.substring(0, 150);
      // Only add if it doesn't look like random OCR noise
      if (textPreview.split(' ').length > 3) {
        description += `. ${textPreview}`;
      }
    }

    // Add condition/quality indicators from labels
    const qualityIndicators = analysis.labels
      .filter(l => {
        const desc = l.description.toLowerCase();
        return ['new', 'used', 'vintage', 'modern', 'antique', 'refurbished', 'excellent', 'good'].includes(desc);
      })
      .map(l => l.description);

    if (qualityIndicators.length > 0) {
      description += ` Condition: ${qualityIndicators[0]}`;
    }

    // Clean up and format
    description = description.replace(/\s+/g, ' ').trim();
    
    // Ensure it's not too long
    if (description.length > 500) {
      description = description.substring(0, 497) + '...';
    }

    return description || `${recognizedItem} - Product for sale`;
  }

  /**
   * Infer category from labels and web entities
   */
  private inferCategory(
    labels: Array<{ description: string }>,
    webEntities: Array<{ description: string }> = []
  ): string {
    const allText = [
      ...labels.map(l => l.description.toLowerCase()),
      ...webEntities.map(e => e.description.toLowerCase())
    ].join(' ');

    // Electronics
    if (allText.includes('phone') || allText.includes('smartphone') || allText.includes('iphone') || 
        allText.includes('android') || allText.includes('tablet') || allText.includes('ipad')) {
      return 'Electronics';
    }
    if (allText.includes('laptop') || allText.includes('computer') || allText.includes('macbook') ||
        allText.includes('desktop') || allText.includes('pc')) {
      return 'Electronics';
    }
    if (allText.includes('camera') || allText.includes('lens') || allText.includes('dslr') ||
        allText.includes('mirrorless')) {
      return 'Electronics';
    }
    if (allText.includes('headphone') || allText.includes('earbud') || allText.includes('speaker') ||
        allText.includes('audio')) {
      return 'Electronics';
    }
    if (allText.includes('tv') || allText.includes('television') || allText.includes('monitor') ||
        allText.includes('display')) {
      return 'Electronics';
    }

    // Jewelry & Watches
    if (allText.includes('watch') || allText.includes('timepiece') || allText.includes('rolex') ||
        allText.includes('omega')) {
      return 'Jewelry';
    }
    if (allText.includes('ring') || allText.includes('necklace') || allText.includes('bracelet') ||
        allText.includes('jewelry') || allText.includes('gold') || allText.includes('silver') ||
        allText.includes('diamond')) {
      return 'Jewelry';
    }

    // Musical Instruments
    if (allText.includes('guitar') || allText.includes('piano') || allText.includes('violin') ||
        allText.includes('instrument') || allText.includes('drum') || allText.includes('bass')) {
      return 'Musical Instruments';
    }

    // Tools
    if (allText.includes('drill') || allText.includes('tool') || allText.includes('saw') ||
        allText.includes('wrench') || allText.includes('screwdriver')) {
      return 'Tools';
    }

    // Clothing & Accessories
    if (allText.includes('shirt') || allText.includes('pants') || allText.includes('dress') ||
        allText.includes('shoe') || allText.includes('jacket') || allText.includes('bag') ||
        allText.includes('purse')) {
      return 'Clothing & Accessories';
    }

    // Furniture
    if (allText.includes('chair') || allText.includes('table') || allText.includes('sofa') ||
        allText.includes('couch') || allText.includes('desk') || allText.includes('bed')) {
      return 'Furniture';
    }

    // Sports & Outdoors
    if (allText.includes('bike') || allText.includes('bicycle') || allText.includes('skateboard') ||
        allText.includes('snowboard') || allText.includes('ski') || allText.includes('golf')) {
      return 'Sports & Outdoors';
    }

    // Books & Media
    if (allText.includes('book') || allText.includes('dvd') || allText.includes('cd') ||
        allText.includes('vinyl') || allText.includes('record')) {
      return 'Books & Media';
    }

    return 'Electronics'; // Default fallback
  }

  /**
   * Infer condition from labels and text
   */
  private inferCondition(
    labels: Array<{ description: string }>,
    text: string
  ): string {
    const allText = [
      ...labels.map(l => l.description.toLowerCase()),
      text.toLowerCase()
    ].join(' ');

    if (allText.includes('new') || allText.includes('unopened') || allText.includes('sealed')) {
      return 'new';
    }
    if (allText.includes('like new') || allText.includes('excellent') || allText.includes('mint')) {
      return 'like new';
    }
    if (allText.includes('very good') || allText.includes('great condition')) {
      return 'very good';
    }
    if (allText.includes('good') || allText.includes('decent')) {
      return 'good';
    }
    if (allText.includes('fair') || allText.includes('acceptable')) {
      return 'fair';
    }
    if (allText.includes('poor') || allText.includes('damaged') || allText.includes('broken')) {
      return 'poor';
    }

    return 'used'; // Default
  }

  /**
   * Extract platform from URL
   */
  private extractPlatform(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (hostname.includes('ebay')) return 'eBay';
      if (hostname.includes('facebook') || hostname.includes('marketplace')) return 'Facebook';
      if (hostname.includes('amazon')) return 'Amazon';
      if (hostname.includes('mercari')) return 'Mercari';
      if (hostname.includes('offerup')) return 'OfferUp';
      if (hostname.includes('craigslist')) return 'Craigslist';
      if (hostname.includes('etsy')) return 'Etsy';
      
      return 'Google';
    } catch {
      return 'Google';
    }
  }

  /**
   * Extract product information from web entities
   */
  private extractProductFromWebEntities(
    webEntities: Array<{ description: string; score: number }>,
    brand?: string
  ): { name: string; brand?: string; model?: string } | null {
    if (!webEntities || webEntities.length === 0) return null;

    // Look for product names in web entities
    for (const entity of webEntities.slice(0, 5)) {
      const desc = entity.description;
      const lowerDesc = desc.toLowerCase();

      // Apple products
      if (lowerDesc.includes('macbook')) {
        const macbookMatch = desc.match(/(MacBook\s+(?:Pro|Air)(?:\s+\d+)?(?:\s+M\d+)?(?:\s+Pro)?)/i);
        if (macbookMatch) {
          const modelMatch = desc.match(/(M\d+(?:\s+Pro|\s+Max)?)/i);
          return {
            name: macbookMatch[1].trim(),
            brand: 'Apple',
            model: modelMatch?.[1],
          };
        }
        return { name: 'MacBook Pro', brand: 'Apple' };
      }

      if (lowerDesc.includes('iphone')) {
        const iphoneMatch = desc.match(/(iPhone\s+(?:\d+|SE|Pro|Pro Max|Plus|Mini)(?:\s+\d+)?)/i);
        if (iphoneMatch) {
          return { name: iphoneMatch[1].trim(), brand: 'Apple', model: iphoneMatch[1].trim() };
        }
        return { name: 'iPhone', brand: 'Apple' };
      }

      if (lowerDesc.includes('ipad')) {
        const ipadMatch = desc.match(/(iPad\s+(?:Pro|Air|Mini)?(?:\s+\d+)?)/i);
        if (ipadMatch) {
          return { name: ipadMatch[1].trim(), brand: 'Apple', model: ipadMatch[1].trim() };
        }
        return { name: 'iPad', brand: 'Apple' };
      }

      // Look for brand + product combinations
      if (brand && lowerDesc.includes(brand.toLowerCase())) {
        // Extract product name that includes brand
        const brandProductMatch = desc.match(new RegExp(`(${brand}[^,]+)`, 'i'));
        if (brandProductMatch && brandProductMatch[1].split(' ').length <= 6) {
          return { name: brandProductMatch[1].trim(), brand };
        }
      }
    }

    return null;
  }

  /**
   * Check if this is likely an Apple product based on visual cues
   */
  private isAppleProduct(analysis: {
    labels: Array<{ description: string }>;
    objects: Array<{ name: string }>;
    webEntities: Array<{ description: string }>;
    text: string;
  }): boolean {
    const allText = [
      ...analysis.labels.map(l => l.description.toLowerCase()),
      ...analysis.objects.map(o => o.name.toLowerCase()),
      ...analysis.webEntities.map(e => e.description.toLowerCase()),
      analysis.text.toLowerCase(),
    ].join(' ');

    return (
      allText.includes('macbook') ||
      allText.includes('apple') ||
      allText.includes('iphone') ||
      allText.includes('ipad') ||
      (allText.includes('laptop') && allText.includes('apple'))
    );
  }

  /**
   * Construct Apple product name from analysis
   */
  private constructAppleProduct(
    analysis: {
      labels: Array<{ description: string }>;
      objects: Array<{ name: string }>;
      webEntities: Array<{ description: string }>;
      text: string;
    },
    brand: string,
    model?: string
  ): string | null {
    const allText = [
      ...analysis.labels.map(l => l.description),
      ...analysis.objects.map(o => o.name),
      ...analysis.webEntities.map(e => e.description),
      analysis.text,
    ].join(' ').toLowerCase();

    // MacBook detection
    if (allText.includes('macbook')) {
      let product = 'MacBook';
      
      if (allText.includes('pro')) {
        product = 'MacBook Pro';
      } else if (allText.includes('air')) {
        product = 'MacBook Air';
      }

      // Add model if found
      if (model) {
        product += ` ${model}`;
      } else {
        // Try to extract M1/M2/M3 from text
        const chipMatch = allText.match(/(m\d+(?:\s+pro|\s+max)?)/i);
        if (chipMatch) {
          product += ` ${chipMatch[1]}`;
        }
      }

      // Add screen size if mentioned
      const sizeMatch = allText.match(/(\d+["']?\s*(?:inch|in))/i);
      if (sizeMatch) {
        product += ` ${sizeMatch[1]}`;
      }

      // Add memory if mentioned
      const memoryMatch = allText.match(/(\d+gb\s*(?:ram|memory))/i);
      if (memoryMatch) {
        product += ` ${memoryMatch[1]}`;
      }

      return product;
    }

    // iPhone detection
    if (allText.includes('iphone')) {
      const iphoneMatch = allText.match(/iphone\s+(\d+|se|pro|pro max|plus|mini)/i);
      if (iphoneMatch) {
        return `iPhone ${iphoneMatch[1]}`;
      }
      return 'iPhone';
    }

    // iPad detection
    if (allText.includes('ipad')) {
      const ipadMatch = allText.match(/ipad\s+(pro|air|mini|\d+)/i);
      if (ipadMatch) {
        return `iPad ${ipadMatch[1]}`;
      }
      return 'iPad';
    }

    return null;
  }

  /**
   * Check if a term is too generic to be useful
   */
  private isGenericTerm(term: string): boolean {
    const genericTerms = [
      'netbook',
      'laptop',
      'computer',
      'device',
      'electronic',
      'product',
      'item',
      'object',
      'thing',
    ];

    const lowerTerm = term.toLowerCase();
    return genericTerms.some(generic => lowerTerm === generic || lowerTerm.includes(generic + ' '));
  }

  /**
   * Extract brand from labels and text
   */
  private extractBrand(labels: Array<{ description: string }>, text: string): string | undefined {
    const commonBrands = [
      'Apple', 'Samsung', 'Google', 'Microsoft', 'Sony', 'Canon', 'Nikon',
      'Rolex', 'Omega', 'Fender', 'Gibson', 'Dewalt', 'Makita', 'Tiffany',
      'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'LG', 'Panasonic', 'Bose',
      'JBL', 'Beats', 'Nike', 'Adidas', 'Gucci', 'Prada', 'Louis Vuitton'
    ];

    const searchText = (labels.map(l => l.description).join(' ') + ' ' + text).toLowerCase();

    // Check for Apple products first (MacBook, iPhone, iPad indicate Apple)
    if (searchText.includes('macbook') || searchText.includes('iphone') || 
        searchText.includes('ipad') || searchText.includes('apple')) {
      return 'Apple';
    }

    // Check for Samsung products
    if (searchText.includes('galaxy') || searchText.includes('samsung')) {
      return 'Samsung';
    }

    // Check for Google products
    if (searchText.includes('pixel') || (searchText.includes('google') && 
        (searchText.includes('phone') || searchText.includes('tablet')))) {
      return 'Google';
    }

    // Check other brands
    for (const brand of commonBrands) {
      if (searchText.includes(brand.toLowerCase())) {
        return brand;
      }
    }

    return undefined;
  }

  /**
   * Extract product name and model from text (highest priority for accuracy)
   */
  private extractProductFromText(text: string, brand?: string): { name: string; model?: string } | null {
    if (!text || text.length < 5) return null;

    const upperText = text.toUpperCase();
    const lowerText = text.toLowerCase();

    // Apple products
    if (lowerText.includes('macbook') || brand?.toLowerCase() === 'apple') {
      // MacBook Pro/Air patterns
      const macbookMatch = text.match(/(MacBook\s+(?:Pro|Air)(?:\s+\d+)?(?:\s+M\d+)?(?:\s+Pro)?)/i);
      if (macbookMatch) {
        const modelMatch = text.match(/(M\d+\s*(?:Pro|Max)?)/i);
        const memoryMatch = text.match(/(\d+GB)/i);
        const sizeMatch = text.match(/(\d+["'])/i);
        
        let name = macbookMatch[1];
        if (modelMatch) name += ` ${modelMatch[1]}`;
        if (sizeMatch) name += ` ${sizeMatch[1]}`;
        if (memoryMatch) name += ` ${memoryMatch[1]}`;
        
        return { name: name.trim(), model: modelMatch?.[1] };
      }
    }

    if (lowerText.includes('iphone') || (brand?.toLowerCase() === 'apple' && lowerText.includes('phone'))) {
      const iphoneMatch = text.match(/(iPhone\s+(?:\d+|SE|Pro|Pro Max|Plus|Mini)(?:\s+\d+)?)/i);
      if (iphoneMatch) {
        return { name: iphoneMatch[1].trim(), model: iphoneMatch[1].trim() };
      }
    }

    if (lowerText.includes('ipad')) {
      const ipadMatch = text.match(/(iPad\s+(?:Pro|Air|Mini)?(?:\s+\d+)?)/i);
      if (ipadMatch) {
        return { name: ipadMatch[1].trim(), model: ipadMatch[1].trim() };
      }
    }

    // Samsung products
    if (lowerText.includes('galaxy') || brand?.toLowerCase() === 'samsung') {
      const galaxyMatch = text.match(/(Galaxy\s+(?:S|Note|Tab|Z|Fold)\d+)/i);
      if (galaxyMatch) {
        return { name: galaxyMatch[1].trim(), model: galaxyMatch[1].trim() };
      }
    }

    // Google Pixel
    if (lowerText.includes('pixel') || brand?.toLowerCase() === 'google') {
      const pixelMatch = text.match(/(Pixel\s+\d+)/i);
      if (pixelMatch) {
        return { name: pixelMatch[1].trim(), model: pixelMatch[1].trim() };
      }
    }

    // Look for common product patterns with brand
    if (brand) {
      const brandProductMatch = text.match(new RegExp(`(${brand}\\s+[A-Za-z0-9\\s]+)`, 'i'));
      if (brandProductMatch && brandProductMatch[1].split(' ').length <= 5) {
        return { name: brandProductMatch[1].trim() };
      }
    }

    return null;
  }

  /**
   * Extract model from text
   */
  private extractModel(text: string): string | undefined {
    if (!text) return undefined;

    // Look for model patterns like "iPhone 13", "MacBook Pro", "M1 Pro", etc.
    const modelPatterns = [
      /(iPhone\s+\d+[A-Z]?(?:\s+Pro(?:\s+Max)?)?)/i,
      /(MacBook\s+(?:Pro|Air)(?:\s+\d+)?)/i,
      /(M\d+(?:\s+Pro|\s+Max)?)/i, // Apple Silicon chips
      /(Galaxy\s+S\d+)/i,
      /(Galaxy\s+Note\s+\d+)/i,
      /(Pixel\s+\d+)/i,
      /(iPad\s+(?:Pro|Air|Mini)?(?:\s+\d+)?)/i,
    ];

    for (const pattern of modelPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * Build optimized search query from product info
   */
  private buildSearchQuery(recognizedItem: string, brand?: string, model?: string): string {
    // Clean up recognized item - remove generic terms
    let cleanItem = recognizedItem;
    if (this.isGenericTerm(recognizedItem)) {
      cleanItem = '';
    }

    // If we have brand and model, use them for precise search
    if (brand && model) {
      return `${brand} ${model} used for sale`;
    }
    
    // If we have brand and a specific product name
    if (brand && cleanItem && !cleanItem.toLowerCase().includes(brand.toLowerCase())) {
      // Check if it's already a complete product name (like "MacBook Pro")
      if (cleanItem.split(' ').length >= 2) {
        return `${brand} ${cleanItem} used for sale`;
      }
      return `${brand} ${cleanItem} for sale`;
    }
    
    // If we have brand but generic item name, try to construct better query
    if (brand && (!cleanItem || this.isGenericTerm(cleanItem))) {
      if (brand === 'Apple') {
        // For Apple, try to infer product type from context
        return `${brand} MacBook Pro used for sale`;
      }
      return `${brand} laptop used for sale`;
    }
    
    // If we have a specific product name without brand
    if (cleanItem && !this.isGenericTerm(cleanItem)) {
      return `${cleanItem} used for sale`;
    }
    
    // Fallback
    return recognizedItem || 'laptop for sale';
  }

  /**
   * Extract specifications from text
   */
  private extractSpecifications(text: string): Record<string, string> {
    const specs: Record<string, string> = {};

    // Look for common spec patterns
    const patterns = {
      storage: /(\d+)\s*(GB|TB|MB)/i,
      ram: /(\d+)\s*GB\s*(RAM|memory)/i,
      screen: /(\d+\.?\d*)\s*(inch|")/i,
      color: /(black|white|silver|gold|blue|red|green|yellow|pink)/i,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        specs[key] = match[0];
      }
    }

    return specs;
  }
}

export const googleLensService = new GoogleLensService();

