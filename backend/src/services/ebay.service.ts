import axios, { AxiosInstance } from 'axios';
import { getEBayConfig, validateEBayConfig, eBayConfig } from '../config/ebay.config';
import {
  eBayToken,
  eBayListingRequest,
  eBayListingResponse,
  eBayListingStatus,
  eBayOAuthUrlParams,
  eBayError,
} from '../types/ebay.types';
import { InventoryItem, eBayListing } from '../types/inventory.types';

export class eBayService {
  private config: eBayConfig;
  private apiClient: AxiosInstance;
  private tokenCache: Map<string, { token: eBayToken; expiresAt: number }> = new Map();

  constructor() {
    this.config = getEBayConfig();
    // Don't throw on validation - just warn (allows server to start without eBay)
    validateEBayConfig(this.config);
    
    this.apiClient = axios.create({
      baseURL: this.config.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private ensureConfigured() {
    if (!this.config.appId || !this.config.devId || !this.config.certId) {
      throw new Error('eBay is not configured. Please set EBAY_APP_ID, EBAY_DEV_ID, and EBAY_CERT_ID in environment variables.');
    }
  }

  /**
   * Generate OAuth authorization URL
   */
  getOAuthUrl(state?: string): string {
    this.ensureConfigured();
    const params: eBayOAuthUrlParams = {
      clientId: this.config.appId,
      redirectUri: this.config.redirectUri,
      scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account',
      state: state || this.generateState(),
    };

    const queryString = new URLSearchParams({
      client_id: params.clientId,
      redirect_uri: params.redirectUri,
      response_type: 'code',
      scope: params.scope,
      ...(params.state && { state: params.state }),
    }).toString();

    return `${this.config.oauthUrl}?${queryString}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<eBayToken> {
    this.ensureConfigured();
    try {
      const credentials = Buffer.from(`${this.config.appId}:${this.config.certId}`).toString('base64');
      
      const response = await axios.post(
        this.config.tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      return response.data as eBayToken;
    } catch (error: any) {
      throw new Error(`Failed to exchange code for token: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Get access token (client credentials for application-only access)
   * Note: For user-specific operations, use OAuth tokens stored per user
   */
  async getApplicationToken(): Promise<eBayToken> {
    this.ensureConfigured();
    const cacheKey = 'application';
    const cached = this.tokenCache.get(cacheKey);
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }

    try {
      const credentials = Buffer.from(`${this.config.appId}:${this.config.certId}`).toString('base64');
      
      const response = await axios.post(
        this.config.tokenUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      const token = response.data as eBayToken;
      const expiresAt = Date.now() + (token.expires_in * 1000) - 60000; // Refresh 1 minute before expiry

      this.tokenCache.set(cacheKey, { token, expiresAt });
      return token;
    } catch (error: any) {
      throw new Error(`Failed to get application token: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Refresh user access token
   */
  async refreshUserToken(refreshToken: string): Promise<eBayToken> {
    try {
      const credentials = Buffer.from(`${this.config.appId}:${this.config.certId}`).toString('base64');
      
      const response = await axios.post(
        this.config.tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      return response.data as eBayToken;
    } catch (error: any) {
      throw new Error(`Failed to refresh token: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Convert InventoryItem to eBay listing format
   */
  private convertToEBayListing(item: InventoryItem, listingData: eBayListing): eBayListingRequest {
    // Map condition from our format to eBay format
    const conditionMap: Record<string, string> = {
      new: 'NEW',
      like_new: 'NEW_OTHER',
      used: 'USED',
      fair: 'USED_ACCEPTABLE',
      poor: 'FOR_PARTS_OR_NOT_WORKING',
    };

    // Map category (simplified - in production, use eBay category API)
    const categoryMap: Record<string, string> = {
      Electronics: '58058', // Electronics category ID (example)
      Jewelry: '281',
      Tools: '11700',
      'Musical Instruments': '619',
    };

    const ebayCondition = conditionMap[item.condition] || 'USED';
    const categoryId = categoryMap[item.category] || '58058'; // Default to Electronics

    // Build item specifics from AI data
    const aspects: Record<string, string[]> = {};
    if (item.aiData) {
      if (item.aiData.brand) aspects.Brand = [item.aiData.brand];
      if (item.aiData.model) aspects.Model = [item.aiData.model];
      if (item.aiData.color) aspects.Color = [item.aiData.color];
      if (item.aiData.size) aspects.Size = [item.aiData.size];
      
      // Add custom specifics from listingData
      if (listingData.itemSpecifics) {
        Object.entries(listingData.itemSpecifics).forEach(([key, value]) => {
          aspects[key] = [value];
        });
      }
    }

    return {
      marketplaceId: 'EBAY_US', // Default to US marketplace
      format: 'FIXED_PRICE',
      listingDescription: listingData.description || item.description,
      listingPolicies: {
        fulfillmentPolicyId: 'default', // Should be created/retrieved from user's policies
        paymentPolicyId: 'default',
        returnPolicyId: listingData.returnPolicy ? `RETURN_${listingData.returnPolicy}DAYS` : 'RETURN_30DAYS',
      },
      merchantLocationKey: 'default', // Should be user's location key
      pricingSummary: {
        price: {
          value: listingData.price.toString(),
          currency: 'USD',
        },
      },
      quantity: 1,
      categoryId,
      condition: ebayCondition,
      product: {
        title: listingData.title || item.title,
        description: listingData.description || item.description,
        imageUrls: listingData.images || item.images,
        aspects: Object.keys(aspects).length > 0 ? aspects : undefined,
        brand: item.aiData?.brand,
        mpn: item.aiData?.model,
      },
    };
  }

  /**
   * Create a listing on eBay
   */
  async createListing(
    accessToken: string,
    item: InventoryItem,
    listingData: eBayListing
  ): Promise<eBayListingResponse> {
    try {
      const listingRequest = this.convertToEBayListing(item, listingData);

      const response = await this.apiClient.post<eBayListingResponse>(
        '/sell/inventory/v1/offer',
        listingRequest,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const ebayError = error.response?.data as eBayError;
      if (ebayError?.errors) {
        const errorMessages = ebayError.errors.map(e => e.message).join(', ');
        throw new Error(`eBay API Error: ${errorMessages}`);
      }
      throw new Error(`Failed to create eBay listing: ${error.message}`);
    }
  }

  /**
   * Publish a draft listing
   */
  async publishListing(accessToken: string, offerId: string): Promise<eBayListingResponse> {
    try {
      const response = await this.apiClient.post<eBayListingResponse>(
        `/sell/inventory/v1/offer/${offerId}/publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const ebayError = error.response?.data as eBayError;
      if (ebayError?.errors) {
        const errorMessages = ebayError.errors.map(e => e.message).join(', ');
        throw new Error(`eBay API Error: ${errorMessages}`);
      }
      throw new Error(`Failed to publish eBay listing: ${error.message}`);
    }
  }

  /**
   * Update an existing listing
   */
  async updateListing(
    accessToken: string,
    offerId: string,
    updates: Partial<eBayListing>
  ): Promise<eBayListingResponse> {
    try {
      // First, get the current listing
      const currentListing = await this.getListing(accessToken, offerId);
      
      // Merge updates
      const updatedRequest: Partial<eBayListingRequest> = {};
      if (updates.title) {
        updatedRequest.product = { ...currentListing.product, title: updates.title };
      }
      if (updates.description) {
        updatedRequest.listingDescription = updates.description;
      }
      if (updates.price !== undefined) {
        updatedRequest.pricingSummary = {
          price: {
            value: updates.price.toString(),
            currency: 'USD',
          },
        };
      }

      const response = await this.apiClient.put<eBayListingResponse>(
        `/sell/inventory/v1/offer/${offerId}`,
        updatedRequest,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const ebayError = error.response?.data as eBayError;
      if (ebayError?.errors) {
        const errorMessages = ebayError.errors.map(e => e.message).join(', ');
        throw new Error(`eBay API Error: ${errorMessages}`);
      }
      throw new Error(`Failed to update eBay listing: ${error.message}`);
    }
  }

  /**
   * Get listing details
   */
  async getListing(accessToken: string, offerId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(
        `/sell/inventory/v1/offer/${offerId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get eBay listing: ${error.message}`);
    }
  }

  /**
   * Get listing status
   */
  async getListingStatus(accessToken: string, offerId: string): Promise<eBayListingStatus> {
    try {
      const response = await this.apiClient.get<eBayListingStatus>(
        `/sell/inventory/v1/offer/${offerId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get eBay listing status: ${error.message}`);
    }
  }

  /**
   * Delete/End a listing
   */
  async deleteListing(accessToken: string, offerId: string): Promise<void> {
    try {
      await this.apiClient.delete(
        `/sell/inventory/v1/offer/${offerId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );
    } catch (error: any) {
      const ebayError = error.response?.data as eBayError;
      if (ebayError?.errors) {
        const errorMessages = ebayError.errors.map(e => e.message).join(', ');
        throw new Error(`eBay API Error: ${errorMessages}`);
      }
      throw new Error(`Failed to delete eBay listing: ${error.message}`);
    }
  }

  /**
   * Generate random state for OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export const ebayService = new eBayService();

