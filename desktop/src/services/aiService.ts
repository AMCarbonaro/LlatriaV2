import { AIData } from '@/types/inventory';
import { apiClient } from './api';

/**
 * AI Service - Uses real Google APIs via backend
 */
export const aiService = {
  /**
   * Recognize item from image using Google Vision API
   */
  async recognizeItem(imageFile: File): Promise<AIData> {
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      // Call backend API
      const response = await apiClient.recognizeItem(base64);
      
      if (response.success && response.data) {
        return response.data.data;
      }

      throw new Error(response.error || 'Failed to recognize item');
    } catch (error: any) {
      console.error('AI recognition error:', error);
      throw error;
    }
  },

  /**
   * Search for similar items online
   */
  async searchOnline(itemName: string, brand?: string): Promise<AIData['similarItems']> {
    try {
      const response = await apiClient.searchProducts(itemName, {
        maxResults: 10,
      });

      if (response.success && response.data) {
        return response.data.results.map(item => ({
          title: item.title,
          price: item.price || 0,
          platform: item.merchant || 'Google',
          url: item.link,
        }));
      }

      return [];
    } catch (error: any) {
      console.error('Online search error:', error);
      return [];
    }
  },

  /**
   * Get price suggestions for an item
   */
  async getPriceSuggestions(itemName: string, brand?: string): Promise<{
    suggestedPrice: number;
    marketPrice: number;
    priceDistribution: Array<{ price: number; count: number }>;
    topMerchants: Array<{ merchant: string; averagePrice: number }>;
  }> {
    try {
      const response = await apiClient.getPriceSuggestions(itemName, brand);

      if (response.success && response.data) {
        return response.data.data;
      }

      throw new Error(response.error || 'Failed to get price suggestions');
    } catch (error: any) {
      console.error('Price suggestions error:', error);
      throw error;
    }
  },

  /**
   * Get price comparison for a product
   */
  async getPriceComparison(productName: string, brand?: string): Promise<{
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    results: Array<{
      title: string;
      price: number;
      currency: string;
      link: string;
      merchant: string;
    }>;
  }> {
    try {
      const response = await apiClient.getPriceComparison(productName, brand);

      if (response.success && response.data) {
        return response.data.data;
      }

      throw new Error(response.error || 'Failed to get price comparison');
    } catch (error: any) {
      console.error('Price comparison error:', error);
      throw error;
    }
  },
};






