// Shared types between backend and frontend
export type ItemStatus = 'active' | 'sold' | 'draft';
export type ItemCondition = 'new' | 'like_new' | 'used' | 'fair' | 'poor';
export type Platform = 'facebook' | 'ebay' | 'website';
export type PostingStatus = 'idle' | 'posting' | 'posted' | 'error';

export interface PlatformPostingStatus {
  facebook?: PostingStatus;
  ebay?: PostingStatus;
  website?: PostingStatus;
}

export interface InventoryItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  condition: ItemCondition;
  category: string;
  images: string[];
  status: ItemStatus;
  platforms: Platform[];
  createdAt: string;
  updatedAt: string;
  aiData?: AIData;
  facebookListingId?: string;
  ebayListingId?: string;
  websiteListingId?: string;
  postingStatus?: PlatformPostingStatus;
}

export interface AIData {
  recognizedItem: string;
  confidence: number;
  marketPrice: number;
  suggestedPrice: number;
  description: string;
  category: string;
  condition: ItemCondition;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  size?: string;
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
    weight?: string;
    diameter?: string;
    thickness?: string;
  };
  operatingSystem?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  screenSize?: string;
  resolution?: string;
  batteryLife?: string;
  instrumentType?: string;
  numberOfStrings?: number;
  finish?: string;
  metalType?: string;
  stoneType?: string;
  carat?: string;
  powerSource?: string;
  voltage?: string;
  sensorSize?: string;
  megapixels?: string;
  videoResolution?: string;
  specifications?: Record<string, string>;
  similarItems?: Array<{
    title: string;
    price: number;
    platform: string;
    url?: string;
  }>;
  researchNotes?: string;
}

export interface eBayListing {
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  images: string[];
  shippingCost?: number;
  shippingMethod?: string;
  returnPolicy?: string;
  itemSpecifics?: Record<string, string>;
}



