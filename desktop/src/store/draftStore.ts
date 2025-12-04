import { create } from 'zustand';
import { ListingFormData } from '@/types/listing';

interface DraftState {
  draft: ListingFormData | null;
  hasUnsavedChanges: boolean;
  setDraft: (draft: ListingFormData) => void;
  clearDraft: () => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  loadDraft: () => ListingFormData | null;
}

const DRAFT_STORAGE_KEY = 'llatria-draft';

export const useDraftStore = create<DraftState>((set, get) => ({
  draft: null,
  hasUnsavedChanges: false,
  setDraft: (draft) => {
    set({ draft, hasUnsavedChanges: true });
    // Auto-save to localStorage
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  },
  clearDraft: () => {
    set({ draft: null, hasUnsavedChanges: false });
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  },
  setUnsavedChanges: (hasChanges) => {
    set({ hasUnsavedChanges: hasChanges });
  },
  loadDraft: () => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
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

