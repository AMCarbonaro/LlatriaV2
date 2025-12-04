import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'llatria_inventory';

export const storageService = {
  getInventory: async (): Promise<any[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading inventory from storage:', error);
      return [];
    }
  },

  saveInventory: async (inventory: any[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    } catch (error) {
      console.error('Error saving inventory to storage:', error);
    }
  },

  clearInventory: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing inventory from storage:', error);
    }
  },
};

