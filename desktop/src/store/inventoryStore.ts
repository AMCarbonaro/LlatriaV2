import { create } from 'zustand';
import { InventoryItem, ItemStatus, Platform } from '@/types/inventory';
import { apiClient } from '@/services/api';
import { useHistoryStore } from './historyStore';

// Helper to convert API item to frontend format
function convertApiItemToInventoryItem(apiItem: any): InventoryItem {
  return {
    id: apiItem.id,
    title: apiItem.title,
    description: apiItem.description,
    price: typeof apiItem.price === 'string' ? parseFloat(apiItem.price) : apiItem.price,
    condition: apiItem.condition,
    category: apiItem.category,
    images: apiItem.images?.map((img: any) => img.url) || [],
    status: apiItem.status,
    platforms: apiItem.postings?.map((p: any) => p.platform) || [],
    createdAt: apiItem.createdAt,
    updatedAt: apiItem.updatedAt,
    aiData: apiItem.aiData ? {
      recognizedItem: apiItem.aiData.recognizedItem,
      confidence: typeof apiItem.aiData.confidence === 'string' ? parseFloat(apiItem.aiData.confidence) : apiItem.aiData.confidence,
      marketPrice: typeof apiItem.aiData.marketPrice === 'string' ? parseFloat(apiItem.aiData.marketPrice) : apiItem.aiData.marketPrice,
      suggestedPrice: typeof apiItem.aiData.suggestedPrice === 'string' ? parseFloat(apiItem.aiData.suggestedPrice) : apiItem.aiData.suggestedPrice,
      description: apiItem.aiData.description,
      category: apiItem.aiData.category,
      condition: apiItem.aiData.condition,
      brand: apiItem.aiData.brand,
      model: apiItem.aiData.model,
      year: apiItem.aiData.year,
      color: apiItem.aiData.color,
      size: apiItem.aiData.size,
      dimensions: apiItem.aiData.dimensions,
      specifications: apiItem.aiData.specifications,
      similarItems: apiItem.aiData.similarItems,
      researchNotes: apiItem.aiData.researchNotes,
    } : undefined,
    ebayListingId: apiItem.postings?.find((p: any) => p.platform === 'ebay')?.externalId,
    facebookListingId: apiItem.postings?.find((p: any) => p.platform === 'facebook')?.externalId,
    websiteListingId: apiItem.postings?.find((p: any) => p.platform === 'website')?.externalId,
    postingStatus: apiItem.postings?.reduce((acc: any, p: any) => {
      acc[p.platform] = p.status;
      return acc;
    }, {}) || {},
  };
}

interface InventoryState {
  items: InventoryItem[];
  filteredItems: InventoryItem[];
  searchQuery: string;
  statusFilter: ItemStatus | 'all';
  selectedPlatforms: Platform[];
  categoryFilter: string;
  selectedCategories: string[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  dateRange: { start: Date | null; end: Date | null };
  priceRange: { min: number | null; max: number | null };
  sortBy: 'date' | 'price' | 'name' | 'status' | 'category';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  loadInventory: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<InventoryItem>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  markAsSold: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ItemStatus | 'all') => void;
  togglePlatform: (platform: Platform) => void;
  setCategoryFilter: (category: string) => void;
  toggleCategory: (category: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  setPriceRange: (range: { min: number | null; max: number | null }) => void;
  setSortBy: (sortBy: 'date' | 'price' | 'name' | 'status' | 'category') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  applyFilters: () => void;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkMarkAsSold: (ids: string[]) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  filteredItems: [],
  searchQuery: '',
  statusFilter: 'all',
  selectedPlatforms: [],
  categoryFilter: 'all',
  selectedCategories: [],
  viewMode: 'grid',
  isLoading: false,
  dateRange: { start: null, end: null },
  priceRange: { min: null, max: null },
  sortBy: 'date',
  sortOrder: 'desc',

  loadInventory: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.getInventory();
      if (response.success && response.data) {
        const items = response.data.items.map(convertApiItemToInventoryItem);
    set({ items, isLoading: false });
    get().applyFilters();
      } else {
        set({ isLoading: false });
        throw new Error(response.error || 'Failed to load inventory');
      }
    } catch (error) {
      set({ isLoading: false });
      console.error('Error loading inventory:', error);
      throw error;
    }
  },

  addItem: async (item) => {
    try {
      const response = await apiClient.createInventoryItem({
        title: item.title,
        description: item.description,
        price: item.price,
        condition: item.condition,
        category: item.category,
        images: item.images,
        aiData: item.aiData,
      });
      
      if (response.success && response.data) {
        const newItem = convertApiItemToInventoryItem(response.data.item);
    set((state) => {
      const newItems = [...state.items, newItem];
      return { items: newItems };
    });
    // Track in history
    useHistoryStore.getState().addAction({ type: 'add', item: newItem });
    get().applyFilters();
    return newItem;
      }
      throw new Error(response.error || 'Failed to create item');
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  updateItem: async (id, updates) => {
    const oldItem = get().items.find(item => item.id === id);
    try {
      const response = await apiClient.updateInventoryItem(id, updates);
      if (response.success && response.data && oldItem) {
        const updated = convertApiItemToInventoryItem(response.data.item);
      set((state) => ({
        items: state.items.map(item => item.id === id ? updated : item),
      }));
      // Track in history
      useHistoryStore.getState().addAction({ 
        type: 'update', 
        itemId: id, 
        oldItem, 
        newItem: updated 
      });
      get().applyFilters();
      } else {
        throw new Error(response.error || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  deleteItem: async (id) => {
    const itemToDelete = get().items.find(item => item.id === id);
    try {
      const response = await apiClient.deleteInventoryItem(id);
      if (response.success && itemToDelete) {
      set((state) => ({
        items: state.items.filter(item => item.id !== id),
      }));
      // Track in history
      useHistoryStore.getState().addAction({ type: 'delete', item: itemToDelete });
      get().applyFilters();
      } else {
        throw new Error(response.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  markAsSold: async (id) => {
    try {
      const response = await apiClient.markAsSold(id);
      if (response.success && response.data) {
        const updated = convertApiItemToInventoryItem(response.data.item);
      set((state) => ({
        items: state.items.map(item => item.id === id ? updated : item),
      }));
      get().applyFilters();
      } else {
        throw new Error(response.error || 'Failed to mark item as sold');
      }
    } catch (error) {
      console.error('Error marking item as sold:', error);
      throw error;
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().applyFilters();
  },

  togglePlatform: (platform) => {
    set((state) => {
      const isSelected = state.selectedPlatforms.includes(platform);
      const newPlatforms = isSelected
        ? state.selectedPlatforms.filter(p => p !== platform)
        : [...state.selectedPlatforms, platform];
      return { selectedPlatforms: newPlatforms };
    });
    get().applyFilters();
  },

  setCategoryFilter: (category) => {
    set({ categoryFilter: category });
    get().applyFilters();
  },

  toggleCategory: (category) => {
    set((state) => {
      const isSelected = state.selectedCategories.includes(category);
      const newCategories = isSelected
        ? state.selectedCategories.filter(c => c !== category)
        : [...state.selectedCategories, category];
      return { selectedCategories: newCategories };
    });
    get().applyFilters();
  },

  setDateRange: (range) => {
    set({ dateRange: range });
    get().applyFilters();
  },

  setPriceRange: (range) => {
    set({ priceRange: range });
    get().applyFilters();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().applyFilters();
  },

  setSortOrder: (order) => {
    set({ sortOrder: order });
    get().applyFilters();
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  bulkDelete: async (ids) => {
    const itemsToDelete: InventoryItem[] = [];
    for (const id of ids) {
      const itemToDelete = get().items.find(item => item.id === id);
      if (itemToDelete) {
        itemsToDelete.push(itemToDelete);
      }
    }
    
    try {
      const response = await apiClient.bulkOperation('delete', ids);
      if (response.success) {
        // Track all deletions in history
        itemsToDelete.forEach(item => {
          useHistoryStore.getState().addAction({ type: 'delete', item });
    });
        
    set((state) => ({
      items: state.items.filter(item => !ids.includes(item.id)),
    }));
    get().applyFilters();
      } else {
        throw new Error(response.error || 'Failed to delete items');
      }
    } catch (error) {
      console.error('Error bulk deleting items:', error);
      throw error;
    }
  },

  bulkMarkAsSold: async (ids) => {
    const oldItems = ids.map(id => get().items.find(item => item.id === id)).filter(Boolean) as InventoryItem[];
    
    try {
      const response = await apiClient.bulkOperation('mark-sold', ids);
      if (response.success) {
        // Reload inventory to get updated items
        await get().loadInventory();
        
        // Track all updates in history
        oldItems.forEach(oldItem => {
          const updatedItem = get().items.find(item => item.id === oldItem.id);
          if (updatedItem) {
        useHistoryStore.getState().addAction({ 
          type: 'update', 
              itemId: oldItem.id, 
          oldItem, 
              newItem: updatedItem 
        });
      }
    });
      } else {
        throw new Error(response.error || 'Failed to mark items as sold');
      }
    } catch (error) {
      console.error('Error bulk marking items as sold:', error);
      throw error;
    }
  },

  applyFilters: () => {
    const { 
      items, 
      searchQuery, 
      statusFilter, 
      selectedPlatforms, 
      categoryFilter,
      selectedCategories,
      dateRange,
      priceRange,
      sortBy,
      sortOrder
    } = get();
    
    let filtered = [...items];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Platform filter - show items that have been POSTED to ALL selected platforms
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(item => 
        selectedPlatforms.every(platform => 
          item.postingStatus?.[platform] === 'posted'
        )
      );
    }
    
    // Category filter (legacy single category)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Multiple category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => selectedCategories.includes(item.category));
    }
    
    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= dateRange.start!;
      });
    }
    if (dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        const endDate = new Date(dateRange.end!);
        endDate.setHours(23, 59, 59, 999); // Include entire end date
        return itemDate <= endDate;
      });
    }
    
    // Price range filter
    if (priceRange.min !== null) {
      filtered = filtered.filter(item => item.price >= priceRange.min!);
    }
    if (priceRange.max !== null) {
      filtered = filtered.filter(item => item.price <= priceRange.max!);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    set({ filteredItems: filtered });
  },
}));

