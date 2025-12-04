import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListingFormData } from '../types/listing';

interface DraftState {
  draft: ListingFormData | null;
  hasUnsavedChanges: boolean;
  setDraft: (draft: ListingFormData) => Promise<void>;
  clearDraft: () => Promise<void>;
  setUnsavedChanges: (hasChanges: boolean) => void;
  loadDraft: () => Promise<ListingFormData | null>;
}

const DRAFT_STORAGE_KEY = 'llatria-draft';

export const useDraftStore = create<DraftState>((set, get) => ({
  draft: null,
  hasUnsavedChanges: false,
  setDraft: async (draft) => {
    set({ draft, hasUnsavedChanges: true });
    // Auto-save to AsyncStorage
    try {
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  },
  clearDraft: async () => {
    set({ draft: null, hasUnsavedChanges: false });
    try {
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  },
  setUnsavedChanges: (hasChanges) => {
    set({ hasUnsavedChanges: hasChanges });
  },
  loadDraft: async () => {
    try {
      const stored = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const draft = JSON.parse(stored) as ListingFormData;
        set({ draft, hasUnsavedChanges: true });
        return draft;
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return null;
  },
}));



