const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load tokens from localStorage
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // Handle token refresh on 401
      if (response.status === 401 && this.refreshToken && endpoint !== '/auth/refresh') {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
          const retryData = await retryResponse.json();
          return retryData;
        }
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      let data;
      if (text && contentType?.includes('application/json')) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          return {
            success: false,
            error: `Invalid JSON response: ${text.substring(0, 100)}`,
          };
        }
      } else if (text) {
        // Non-JSON response
        return {
          success: false,
          error: `Unexpected response format: ${text.substring(0, 100)}`,
        };
      } else {
        // Empty response
        return {
          success: false,
          error: `Empty response from server (${response.status}). Is the backend running?`,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      // Handle network errors
      if (error.message.includes('fetch')) {
        return {
          success: false,
          error: `Cannot connect to backend server. Make sure it's running on ${API_BASE_URL.replace('/api', '')}`,
        };
      }
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const text = await response.text();
      if (!text) {
        return false;
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return false;
      }

      if (data.success && data.accessToken) {
        this.accessToken = data.accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.accessToken);
        }
        return true;
      }

      // Refresh failed, clear tokens
      this.clearTokens();
      return false;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  async logout() {
    this.clearTokens();
    return { success: true };
  }

  // Inventory endpoints
  async getInventory(params?: {
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.request<{ items: any[]; count: number }>(
      `/inventory${query ? `?${query}` : ''}`
    );
  }

  async getInventoryItem(id: string) {
    return this.request<{ item: any }>(`/inventory/${id}`);
  }

  async createInventoryItem(item: any) {
    return this.request<{ item: any }>('/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateInventoryItem(id: string, updates: any) {
    return this.request<{ item: any }>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteInventoryItem(id: string) {
    return this.request(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  async markAsSold(id: string) {
    return this.request<{ item: any }>(`/inventory/${id}/sold`, {
      method: 'PATCH',
    });
  }

  async bulkOperation(operation: 'delete' | 'mark-sold', itemIds: string[]) {
    return this.request('/inventory/bulk', {
      method: 'POST',
      body: JSON.stringify({ operation, itemIds }),
    });
  }

  // AI/Recognition endpoints
  async recognizeItem(imageBase64: string) {
    return this.request<{ data: any }>('/ai/recognize', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64 }),
    });
  }

  async getPriceSuggestions(itemName: string, brand?: string) {
    const params = new URLSearchParams({ itemName });
    if (brand) params.append('brand', brand);
    return this.request<{ data: any }>(`/ai/suggestions?${params.toString()}`);
  }

  async searchProducts(query: string, options?: {
    maxResults?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
  }) {
    const params = new URLSearchParams({ query });
    if (options?.maxResults) params.append('maxResults', options.maxResults.toString());
    if (options?.minPrice) params.append('minPrice', options.minPrice.toString());
    if (options?.maxPrice) params.append('maxPrice', options.maxPrice.toString());
    if (options?.condition) params.append('condition', options.condition);
    return this.request<{ results: any[]; count: number }>(`/ai/search?${params.toString()}`);
  }

  async getPriceComparison(productName: string, brand?: string) {
    const params = new URLSearchParams({ productName });
    if (brand) params.append('brand', brand);
    return this.request<{ data: any }>(`/ai/price-comparison?${params.toString()}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

