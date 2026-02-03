import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryItem, AIData } from '../types/inventory';

// API base URL - update this for production
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3002/api' 
  : 'https://api.llatria.com/api';

class ApiService {
  private accessToken: string | null = null;

  async init() {
    this.accessToken = await AsyncStorage.getItem('accessToken');
  }

  private async getHeaders(): Promise<HeadersInit> {
    if (!this.accessToken) {
      this.accessToken = await AsyncStorage.getItem('accessToken');
    }
    
    return {
      'Content-Type': 'application/json',
      ...(this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error ${response.status}`);
    }
    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await this.handleResponse<{ accessToken: string; refreshToken: string; user: any }>(response);
    
    this.accessToken = data.accessToken;
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  }

  async register(email: string, password: string, name?: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    
    const data = await this.handleResponse<{ accessToken: string; refreshToken: string; user: any }>(response);
    
    this.accessToken = data.accessToken;
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  }

  async logout(): Promise<void> {
    this.accessToken = null;
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  }

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/inventory`, { headers });
    const data = await this.handleResponse<{ items: InventoryItem[] }>(response);
    return data.items || [];
  }

  async getItem(id: string): Promise<InventoryItem> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, { headers });
    return this.handleResponse<InventoryItem>(response);
  }

  async createItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers,
      body: JSON.stringify(item),
    });
    return this.handleResponse<InventoryItem>(response);
  }

  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    return this.handleResponse<InventoryItem>(response);
  }

  async deleteItem(id: string): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: 'DELETE',
      headers,
    });
    await this.handleResponse<void>(response);
  }

  async markAsSold(id: string): Promise<InventoryItem> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/inventory/${id}/sold`, {
      method: 'POST',
      headers,
    });
    return this.handleResponse<InventoryItem>(response);
  }

  // AI Recognition
  async recognizeItem(imageBase64: string, productName?: string): Promise<AIData> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/ai/recognize`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        image: imageBase64,
        productName,
      }),
    });
    const data = await this.handleResponse<{ data: AIData }>(response);
    return data.data;
  }

  async generateListing(imageBase64: string, productName: string): Promise<AIData> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/ai/generate-listing`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        image: imageBase64,
        productName,
      }),
    });
    const data = await this.handleResponse<{ data: AIData }>(response);
    return data.data;
  }

  // Platform Posting
  async postToPlatform(itemId: string, platform: 'facebook' | 'ebay' | 'website'): Promise<{ success: boolean; listingId?: string; url?: string }> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/platforms/inventory/${itemId}/post/${platform}`, {
      method: 'POST',
      headers,
    });
    return this.handleResponse<{ success: boolean; listingId?: string; url?: string }>(response);
  }

  async removeFromPlatform(itemId: string, platform: 'facebook' | 'ebay' | 'website'): Promise<{ success: boolean }> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}/platforms/inventory/${itemId}/post/${platform}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse<{ success: boolean }>(response);
  }
}

export const apiService = new ApiService();
