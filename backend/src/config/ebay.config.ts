export interface eBayConfig {
  appId: string;
  devId: string;
  certId: string;
  environment: 'sandbox' | 'production';
  redirectUri: string;
  apiBaseUrl: string;
  oauthUrl: string;
  tokenUrl: string;
}

export function getEBayConfig(): eBayConfig {
  const environment = (process.env.EBAY_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
  
  const isProduction = environment === 'production';
  
  return {
    appId: process.env.EBAY_APP_ID || '',
    devId: process.env.EBAY_DEV_ID || '',
    certId: process.env.EBAY_CERT_ID || '',
    environment,
    redirectUri: process.env.EBAY_REDIRECT_URI || 'http://localhost:3000/api/platforms/ebay/callback',
    apiBaseUrl: isProduction 
      ? 'https://api.ebay.com'
      : 'https://api.sandbox.ebay.com',
    oauthUrl: isProduction
      ? 'https://auth.ebay.com/oauth2/authorize'
      : 'https://auth.sandbox.ebay.com/oauth2/authorize',
    tokenUrl: isProduction
      ? 'https://api.ebay.com/identity/v1/oauth2/token'
      : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
  };
}

export function validateEBayConfig(config: eBayConfig): void {
  // Only validate if credentials are actually being used
  // Allow server to start without eBay credentials (they're optional)
  if (!config.appId) {
    console.warn('EBAY_APP_ID not configured. eBay features will be disabled.');
    return;
  }
  if (!config.devId) {
    console.warn('EBAY_DEV_ID not configured. eBay features will be disabled.');
    return;
  }
  if (!config.certId) {
    console.warn('EBAY_CERT_ID not configured. eBay features will be disabled.');
    return;
  }
  if (!config.redirectUri) {
    console.warn('EBAY_REDIRECT_URI not configured. Using default.');
    return;
  }
}

export function isEBayConfigured(): boolean {
  const config = getEBayConfig();
  return !!(
    config.appId &&
    config.devId &&
    config.certId
  );
}

