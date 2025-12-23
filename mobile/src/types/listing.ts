import { Platform } from './inventory';

export interface ListingData {
  title: string;
  description: string;
  price: number;
  condition: string;
  images: string[];
  category: string;
}

export interface FacebookListing extends ListingData {
  location?: string;
  tags?: string[];
}

export interface eBayListing extends ListingData {
  shippingCost?: number;
  shippingMethod?: string;
  returnPolicy?: string;
  itemSpecifics?: Record<string, string>;
}

export interface WebsiteListing extends ListingData {
  seoTitle?: string;
  seoDescription?: string;
}

export interface PlatformListing {
  facebook?: FacebookListing;
  ebay?: eBayListing;
  website?: WebsiteListing;
}

export interface ListingFormData {
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  images: string[];
  platforms: Platform[];
  facebook?: Partial<FacebookListing>;
  ebay?: Partial<eBayListing>;
  website?: Partial<WebsiteListing>;
}






