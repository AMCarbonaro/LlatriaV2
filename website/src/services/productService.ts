import { InventoryItem } from '@/types/inventory';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Product Service - Fetches products from backend API
 */
export const productService = {
  /**
   * Get all products for website (public endpoint)
   */
  async getProducts(options?: {
    storeId?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<InventoryItem[]> {
    try {
      const params = new URLSearchParams();
      if (options?.storeId) params.append('storeId', options.storeId);
      if (options?.category) params.append('category', options.category);
      if (options?.search) params.append('search', options.search);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      // Use storeId in path if provided, otherwise use query param
      const url = options?.storeId
        ? `${API_BASE_URL}/website/${options.storeId}/products?${params.toString()}`
        : `${API_BASE_URL}/website/products?${params.toString()}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.products) {
        return data.products;
      }

      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  /**
   * Get single product by ID (public endpoint)
   */
  async getProduct(id: string, storeId?: string): Promise<InventoryItem | null> {
    try {
      // Use storeId in path if provided, otherwise use query param
      const url = storeId
        ? `${API_BASE_URL}/website/${storeId}/products/${id}`
        : `${API_BASE_URL}/website/products/${id}${storeId ? `?storeId=${storeId}` : ''}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.product) {
        return data.product;
      }

      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },
};

