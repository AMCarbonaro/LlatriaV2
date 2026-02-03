import { create } from 'zustand';
import { InventoryItem, ItemStatus, Platform } from '../types/inventory';
import { apiService } from '../services/apiService';
import { mockInventoryService } from '../services/mockInventoryService';
import { useHistoryStore } from './historyStore';

// Use real API if available, fallback to mock
const useRealApi = true; // Set to false for offline development

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
      const items = useRealApi 
        ? await apiService.getInventory()
        : await mockInventoryService.getAll();
      set({ items, isLoading: false });
    } catch (error) {
      console.error('Failed to load inventory, using mock:', error);
      const items = await mockInventoryService.getAll();
      set({ items, isLoading: false });
    }
    get().applyFilters();
  },

  addItem: async (item) => {
    let newItem: InventoryItem;
    try {
      newItem = useRealApi
        ? await apiService.createItem(item)
        : await mockInventoryService.create(item);
    } catch (error) {
      console.error('Failed to create item via API, using mock:', error);
      newItem = await mockInventoryService.create(item);
    }
    set((state) => {
      const newItems = [...state.items, newItem];
      return { items: newItems };
    });
    // Track in history
    useHistoryStore.getState().addAction({ type: 'add', item: newItem });
    get().applyFilters();
    return newItem;
  },

  updateItem: async (id, updates) => {
    const oldItem = get().items.find(item => item.id === id);
    let updated: InventoryItem | null;
    try {
      updated = useRealApi
        ? await apiService.updateItem(id, updates)
        : await mockInventoryService.update(id, updates);
      if (updated && oldItem) {
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
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  },

  deleteItem: async (id) => {
    const itemToDelete = get().items.find(item => item.id === id);
    const success = await mockInventoryService.delete(id);
    if (success && itemToDelete) {
      set((state) => ({
        items: state.items.filter(item => item.id !== id),
      }));
      // Track in history
      useHistoryStore.getState().addAction({ type: 'delete', item: itemToDelete });
      get().applyFilters();
    }
  },

  markAsSold: async (id) => {
    const updated = await mockInventoryService.markAsSold(id);
    if (updated) {
      set((state) => ({
        items: state.items.map(item => item.id === id ? updated : item),
      }));
      get().applyFilters();
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
        await mockInventoryService.delete(id);
      }
    }
    
    // Track all deletions in history
    itemsToDelete.forEach(item => {
      useHistoryStore.getState().addAction({ type: 'delete', item });
    });
    
    set((state) => ({
      items: state.items.filter(item => !ids.includes(item.id)),
    }));
    get().applyFilters();
  },

  bulkMarkAsSold: async (ids) => {
    const updates: Array<{ oldItem: InventoryItem; newItem: InventoryItem; itemId: string }> = [];
    
    for (const id of ids) {
      const oldItem = get().items.find(item => item.id === id);
      if (oldItem) {
        const updated = await mockInventoryService.markAsSold(id);
        if (updated) {
          updates.push({ oldItem, newItem: updated, itemId: id });
        }
      }
    }
    
    // Track all updates in history
    updates.forEach(({ oldItem, newItem, itemId }) => {
      useHistoryStore.getState().addAction({ 
        type: 'update', 
        itemId, 
        oldItem, 
        newItem 
      });
    });
    
    // Update state with all sold items
    set((state) => ({
      items: state.items.map(item => {
        const update = updates.find(u => u.itemId === item.id);
        return update ? update.newItem : item;
      }),
    }));
    get().applyFilters();
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
