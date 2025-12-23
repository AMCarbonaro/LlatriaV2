# eBay API Setup Guide

This guide will walk you through setting up eBay API credentials for Llatria.

## Prerequisites

- eBay seller account (active)
- Valid email address
- Access to eBay Developer Portal

## Step 1: Register as eBay Developer

1. Go to [eBay Developers Program](https://developer.ebay.com/)
2. Click "Join" or "Sign In" if you already have an account
3. Sign in with your eBay account credentials
4. Complete the developer registration form

## Step 2: Create an Application

1. Navigate to "My Account" > "Keys & Tokens"
2. Click "Create an App Key"
3. Fill in the application details:
   - **App Name**: Llatria Inventory Manager
   - **App Purpose**: Select "Sell items on eBay"
   - **OAuth Redirect URI**: `https://your-backend-domain.com/api/platforms/ebay/callback`
   - **App Type**: Select "Web Application"
4. Accept the terms and conditions
5. Click "Create App"

## Step 3: Get Your Credentials

After creating the app, you'll receive:

- **App ID (Client ID)**: Used for OAuth authentication
- **Dev ID**: Developer identifier
- **Cert ID (Client Secret)**: Secret key for OAuth (keep this secure!)

**Important**: Save these credentials immediately. The Cert ID is only shown once.

## Step 4: Choose Environment

eBay provides two environments:

### Sandbox (Testing)
- **Base URL**: `https://api.sandbox.ebay.com`
- **OAuth URL**: `https://auth.sandbox.ebay.com/oauth2/authorize`
- **Use for**: Development and testing
- **Limitations**: Test listings only, no real transactions

### Production (Live)
- **Base URL**: `https://api.ebay.com`
- **OAuth URL**: `https://auth.ebay.com/oauth2/authorize`
- **Use for**: Real listings and transactions
- **Requirements**: Production approval from eBay

**Recommendation**: Start with Sandbox for development.

## Step 5: Configure OAuth Redirect URI

1. In your app settings, add the callback URL:
   ```
   https://your-backend-domain.com/api/platforms/ebay/callback
   ```
2. For local development, you can use:
   ```
   http://localhost:3000/api/platforms/ebay/callback
   ```

## Step 6: Set Up Environment Variables

Add these to your backend `.env` file:

```env
# eBay API Credentials
EBAY_APP_ID=YourAppIdHere
EBAY_DEV_ID=YourDevIdHere
EBAY_CERT_ID=YourCertIdHere

# eBay Environment (sandbox or production)
EBAY_ENVIRONMENT=sandbox

# OAuth Redirect URI
EBAY_REDIRECT_URI=https://your-backend-domain.com/api/platforms/ebay/callback

# eBay API Base URLs
EBAY_API_BASE_URL=https://api.sandbox.ebay.com
EBAY_OAUTH_URL=https://auth.sandbox.ebay.com/oauth2/authorize
EBAY_TOKEN_URL=https://api.sandbox.ebay.com/identity/v1/oauth2/token
```

For production, change to:
```env
EBAY_ENVIRONMENT=production
EBAY_API_BASE_URL=https://api.ebay.com
EBAY_OAUTH_URL=https://auth.ebay.com/oauth2/authorize
EBAY_TOKEN_URL=https://api.ebay.com/identity/v1/oauth2/token
```

## Step 7: Request Production Access (Optional)

For production use:

1. Go to "My Account" > "Production Keys"
2. Click "Request Production Keys"
3. Fill out the production request form:
   - Business information
   - Use case description
   - Expected API call volume
4. Submit for review (typically takes 1-3 business days)

## Step 8: Test Your Credentials

Use the eBay API Explorer or test with a simple API call:

```bash
curl -X POST https://api.sandbox.ebay.com/identity/v1/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope/sell.inventory"
```

## API Scopes Required

For listing management, you'll need these OAuth scopes:

- `https://api.ebay.com/oauth/api_scope/sell.inventory` - Create and manage listings
- `https://api.ebay.com/oauth/api_scope/sell.account` - Access account information
- `https://api.ebay.com/oauth/api_scope/sell.fulfillment` - Manage orders and fulfillment

## Troubleshooting

### "Invalid Client ID" Error
- Verify your App ID is correct
- Check that you're using the right environment (sandbox vs production)

### "Invalid Redirect URI" Error
- Ensure the redirect URI in your app settings matches exactly
- Check for trailing slashes or protocol mismatches

### "Access Denied" Error
- Verify your Cert ID is correct
- Check that your app has the required scopes
- Ensure your eBay account is in good standing

## Additional Resources

- [eBay Developers Documentation](https://developer.ebay.com/docs)
- [eBay Sell API Reference](https://developer.ebay.com/api-docs/sell/inventory/overview.html)
- [eBay OAuth Guide](https://developer.ebay.com/api-docs/static/oauth-auth-code-grant.html)
- [eBay API Support](https://developer.ebay.com/support)

## Security Best Practices

1. **Never commit credentials to version control**
2. **Use environment variables for all credentials**
3. **Rotate credentials periodically**
4. **Use different credentials for sandbox and production**
5. **Store Cert ID securely (consider using a secrets manager)**

## Next Steps

After completing this setup:

1. Configure the backend eBay service (see `backend/src/services/ebay.service.ts`)
2. Test OAuth flow
3. Create a test listing in sandbox
4. Verify listing appears on eBay
5. Proceed to production when ready






