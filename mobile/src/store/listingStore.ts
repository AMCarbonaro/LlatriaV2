import { create } from 'zustand';
import { ListingFormData } from '../types/listing';
import { AIData, Platform } from '../types/inventory';

interface ListingState {
  currentListing: ListingFormData | null;
  uploadedImages: string[];
  aiData: AIData | null;
  isProcessingAI: boolean;
  currentStep: number;
  
  // Actions
  setCurrentListing: (listing: ListingFormData | null) => void;
  setUploadedImages: (images: string[]) => void;
  addImage: (image: string) => void;
  removeImage: (index: number) => void;
  setAIData: (data: AIData | null) => void;
  setIsProcessingAI: (processing: boolean) => void;
  updateListingField: <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialListing: ListingFormData = {
  title: '',
  description: '',
  price: 0,
  condition: 'used',
  category: '',
  images: [],
  platforms: [],
};

export const useListingStore = create<ListingState>((set) => ({
  currentListing: null,
  uploadedImages: [],
  aiData: null,
  isProcessingAI: false,
  currentStep: 1,

  setCurrentListing: (listing) => set({ currentListing: listing }),

  setUploadedImages: (images) => set({ uploadedImages: images }),

  addImage: (image) => set((state) => ({
    uploadedImages: [...state.uploadedImages, image],
  })),

  removeImage: (index) => set((state) => ({
    uploadedImages: state.uploadedImages.filter((_, i) => i !== index),
  })),

  setAIData: (data) => set({ aiData: data }),

  setIsProcessingAI: (processing) => set({ isProcessingAI: processing }),

  updateListingField: (field, value) => set((state) => ({
    currentListing: state.currentListing
      ? { ...state.currentListing, [field]: value }
      : { ...initialListing, [field]: value },
  })),

  setCurrentStep: (step) => set({ currentStep: step }),

  reset: () => set({
    currentListing: null,
    uploadedImages: [],
    aiData: null,
    isProcessingAI: false,
    currentStep: 1,
  }),
}));






