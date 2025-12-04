export interface GoogleConfig {
  apiKey: string;
  lensApiKey?: string;
  shoppingApiKey?: string;
  visionApiKey?: string;
  customSearchEngineId?: string; // For Google Custom Search API
}

export function getGoogleConfig(): GoogleConfig {
  return {
    apiKey: process.env.GOOGLE_API_KEY || '',
    lensApiKey: process.env.GOOGLE_LENS_API_KEY || process.env.GOOGLE_API_KEY || '',
    shoppingApiKey: process.env.GOOGLE_SHOPPING_API_KEY || process.env.GOOGLE_API_KEY || '',
    visionApiKey: process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_API_KEY || '',
    customSearchEngineId: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '',
  };
}

export function validateGoogleConfig(config: GoogleConfig): void {
  // Don't throw - just warn (allows server to start without Google APIs)
  if (!config.apiKey) {
    console.warn('GOOGLE_API_KEY not configured. Google AI features will be disabled.');
    return;
  }
}

export function isGoogleConfigured(): boolean {
  const config = getGoogleConfig();
  return !!config.apiKey;
}

