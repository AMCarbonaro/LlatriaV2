export interface eBayToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

export interface eBayListingRequest {
  offerId?: string;
  sku?: string;
  marketplaceId: string;
  format: 'FIXED_PRICE' | 'AUCTION';
  listingDescription: string;
  listingPolicies: {
    fulfillmentPolicyId: string;
    paymentPolicyId: string;
    returnPolicyId: string;
  };
  merchantLocationKey: string;
  pricingSummary: {
    price: {
      value: string;
      currency: string;
    };
  };
  quantity: number;
  categoryId?: string;
  tax?: {
    applyTax: boolean;
    vatPercentage?: number;
  };
  storeCategoryNames?: string[];
  listing?: {
    listingFormat: 'FIXED_PRICE' | 'AUCTION';
    listingType: 'CHINESE' | 'LEAD_GENERATION' | 'EXPRESS' | 'FIXED_PRICE' | 'AUCTION';
    quantity: number;
    startPrice?: {
      value: string;
      currency: string;
    };
    reservePrice?: {
      value: string;
      currency: string;
    };
    buyItNowPrice?: {
      value: string;
      currency: string;
    };
  };
  condition?: string;
  product?: {
    title: string;
    description?: string;
    imageUrls?: string[];
    aspects?: Record<string, string[]>;
    brand?: string;
    mpn?: string;
    ean?: string[];
    isbn?: string[];
    upc?: string[];
  };
  hideBuyerDetails?: boolean;
  includeCatalogProductDetails?: boolean;
}

export interface eBayListingResponse {
  offerId: string;
  listingId?: string;
  sku?: string;
  warnings?: Array<{
    category: string;
    domain: string;
    errorId: number;
    inputRefIds?: string[];
    longMessage: string;
    message: string;
    outputRefIds?: string[];
    parameters?: Array<{
      name: string;
      value: string;
    }>;
    subdomain: string;
  }>;
}

export interface eBayListingStatus {
  offerId: string;
  sku?: string;
  listingId?: string;
  listingStatus: 'PUBLISHED' | 'PUBLISHED_IN_PROGRESS' | 'PUBLISHED_PENDING' | 'UNPUBLISHED' | 'UNPUBLISHED_IN_PROGRESS';
  marketplaceId: string;
  categoryId?: string;
  format?: 'FIXED_PRICE' | 'AUCTION';
  listingDescription?: string;
  quantity?: number;
  pricingSummary?: {
    price?: {
      value: string;
      currency: string;
    };
  };
  warnings?: Array<{
    category: string;
    message: string;
  }>;
}

export interface eBayOAuthUrlParams {
  clientId: string;
  redirectUri: string;
  scope: string;
  state?: string;
}

export interface eBayError {
  errors: Array<{
    errorId: number;
    domain: string;
    subdomain: string;
    category: string;
    message: string;
    longMessage: string;
    parameters?: Array<{
      name: string;
      value: string;
    }>;
  }>;
  warnings?: Array<{
    category: string;
    message: string;
  }>;
}



