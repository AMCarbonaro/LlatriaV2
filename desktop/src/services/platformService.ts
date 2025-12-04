import { eBayListing, FacebookListing } from '@/types/listing';
import { InventoryItem } from '@/types/inventory';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Error types
export class PlatformError extends Error {
  constructor(
    message: string,
    public code?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'PlatformError';
  }
}

export interface PostingResult {
  success: boolean;
  listingId?: string;
  offerId?: string;
  url?: string;
  error?: string;
}

export interface EBayConnectionResult {
  success: boolean;
  authUrl?: string;
  error?: string;
}

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {};
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
};

export const platformService = {
  /**
   * Initiate eBay OAuth connection
   */
  async connectEBay(): Promise<EBayConnectionResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/platforms/ebay/connect`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to connect to eBay',
      };
    }
  },

  /**
   * Post item to eBay
   */
  async postToEBay(itemId: string, listingData: eBayListing): Promise<PostingResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/platforms/inventory/${itemId}/post/ebay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(listingData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error codes
        if (data.code === 'EBAY_NOT_CONNECTED') {
          throw new PlatformError(
            'eBay account not connected. Please connect your eBay account in settings.',
            'EBAY_NOT_CONNECTED',
            false
          );
        }
        
        if (data.code === 'EBAY_RATE_LIMIT') {
          throw new PlatformError(
            'eBay rate limit exceeded. Please try again in a few minutes.',
            'EBAY_RATE_LIMIT',
            true
          );
        }
        
        if (data.code === 'EBAY_VALIDATION_ERROR') {
          throw new PlatformError(
            `eBay validation error: ${data.error}`,
            'EBAY_VALIDATION_ERROR',
            false
          );
        }
        
        return {
          success: false,
          error: data.error || 'Failed to post to eBay',
        };
      }

      return {
        success: true,
        listingId: data.listingId,
        offerId: data.offerId,
        url: data.url,
      };
    } catch (error: any) {
      if (error instanceof PlatformError) {
        throw error;
      }
      
      // Network errors are retryable
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new PlatformError(
          'Network error. Please check your connection and try again.',
          'NETWORK_ERROR',
          true
        );
      }
      
      return {
        success: false,
        error: error.message || 'Failed to post to eBay',
      };
    }
  },

  /**
   * Update eBay listing
   */
  async updateEBayListing(
    itemId: string,
    listingId: string,
    updates: Partial<eBayListing>
  ): Promise<PostingResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/platforms/inventory/${itemId}/post/ebay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to update eBay listing',
        };
      }

      return {
        success: true,
        listingId,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update eBay listing',
      };
    }
  },

  /**
   * Remove item from eBay
   */
  async removeFromEBay(itemId: string, listingId: string): Promise<PostingResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/platforms/inventory/${itemId}/post/ebay`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to remove from eBay',
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to remove from eBay',
      };
    }
  },

  /**
   * Get eBay listing status
   */
  async getEBayListingStatus(itemId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/platforms/inventory/${itemId}/post/ebay/status`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      return data.status;
    } catch (error: any) {
      console.error('Failed to get eBay listing status:', error);
      return null;
    }
  },

  /**
   * Post item to Facebook Marketplace (via Electron)
   */
  async postToFacebook(
    itemId: string,
    listingData: FacebookListing,
    images: string[]
  ): Promise<PostingResult> {
    try {
      // Check if Electron is available
      if (typeof window !== 'undefined' && (window as any).electron?.postToFacebook) {
        // Prepare itemData object for Electron
        const itemData = {
          itemId,
          title: listingData.title,
          description: listingData.description,
          price: listingData.price,
          condition: listingData.condition,
          category: listingData.category,
          location: listingData.location,
        };
        
        const result = await (window as any).electron.postToFacebook(itemData, images);
        
        if (!result.success) {
          // Handle specific Facebook errors
          if (result.error?.includes('login') || result.error?.includes('logged in')) {
            throw new PlatformError(
              'Please log in to Facebook first. The login window should open automatically.',
              'FACEBOOK_NOT_LOGGED_IN',
              false
            );
          }
          
          if (result.error?.includes('rate limit') || result.error?.includes('too quickly')) {
            throw new PlatformError(
              'Facebook rate limit exceeded. Please wait a few minutes before posting again.',
              'FACEBOOK_RATE_LIMIT',
              true
            );
          }
          
          throw new PlatformError(
            result.error || 'Failed to post to Facebook Marketplace',
            'FACEBOOK_POST_ERROR',
            false
          );
        }
        
        return {
          success: true,
          listingId: result.listingId,
          url: result.url,
          requiresManualSubmit: result.requiresManualSubmit,
        };
      }

      throw new PlatformError(
        'Electron API not available. This feature only works in the desktop app.',
        'ELECTRON_NOT_AVAILABLE',
        false
      );
    } catch (error: any) {
      if (error instanceof PlatformError) {
        throw error;
      }
      
      return {
        success: false,
        error: error.message || 'Failed to post to Facebook',
      };
    }
  },

  /**
   * Open Facebook authentication window
   */
  async openFacebookAuth(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).electron?.openFacebookAuth) {
      await (window as any).electron.openFacebookAuth();
    }
  },

  /**
   * Post item to website
   */
  async postToWebsite(
    itemId: string,
    listingData: { seoTitle?: string; seoDescription?: string }
  ): Promise<PostingResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/website/inventory/${itemId}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(listingData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to post to website',
        };
      }

      return {
        success: true,
        listingId: data.listingId,
        url: data.url,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to post to website',
      };
    }
  },

  /**
   * Remove item from website
   */
  async removeFromWebsite(itemId: string): Promise<PostingResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/website/inventory/${itemId}/post`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to remove from website',
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to remove from website',
      };
    }
  },
};

