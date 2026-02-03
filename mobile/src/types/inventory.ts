export type ItemStatus = 'unposted' | 'posting' | 'active' | 'sold';

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
  };
  specifications?: Record<string, string>;
  similarItems?: Array<{
    title: string;
    price: number;
    platform: string;
    url?: string;
  }>;
  researchNotes?: string;
}
