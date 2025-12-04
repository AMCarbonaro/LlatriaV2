export type ItemStatus = 'active' | 'sold' | 'draft';

export type ItemCondition = 'new' | 'like_new' | 'used' | 'fair' | 'poor';

export type Platform = 'facebook' | 'ebay' | 'website';

export interface InventoryItem {
  id: string;
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

