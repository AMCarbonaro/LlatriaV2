const STORAGE_KEY = 'llatria_inventory';

export const storageService = {
  getInventory: async (): Promise<any[]> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading inventory from storage:', error);
      return [];
    }
  },

  saveInventory: async (inventory: any[]): Promise<void> => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    } catch (error) {
      console.error('Error saving inventory to storage:', error);
    }
  },

  clearInventory: async (): Promise<void> => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing inventory from storage:', error);
    }
  },
};


