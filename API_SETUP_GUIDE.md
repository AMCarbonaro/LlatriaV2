# API Setup Guide

## Current Status

The listing generation feature requires Google APIs to be configured. Without them, the AI image recognition and price suggestions won't work.

## Quick Setup

### 1. Get Google API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable billing (required for API usage, but free tier available)
4. Enable these APIs:
   - **Cloud Vision API** (for image recognition)
   - **Custom Search API** (for product search)

### 2. Create API Key

**Option A: Direct API Key Creation (Recommended)**
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. (Optional) Click on the key to edit and restrict it:
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Vision API" and "Custom Search API"
   - Save

**Option B: If prompted for credential type**
1. When asked "What data will you be accessing?", select **"Application data"**
2. This creates a service account, but you still need an API key
3. Go back to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **API Key** (this is separate from the service account)
5. Copy the API key
6. Restrict it to Vision API and Custom Search API

### 3. Create Custom Search Engine (for Shopping search)

1. Go to [Google Custom Search](https://programmablesearchengine.google.com/)
2. Click **Add** to create new search engine
3. Configure:
   - **Sites to search**: Enter `*` (search entire web)
   - **Name**: Llatria Shopping Search
4. Click **Create**
5. Go to **Setup** > **Basics**
6. Enable **Search the entire web**
7. Copy the **Search engine ID** (looks like: `012345678901234567890:abcdefghijk`)

### 4. Add to Backend .env

Edit `backend/.env` and add:

```env
# Google API Configuration
GOOGLE_API_KEY=your-api-key-here
GOOGLE_VISION_API_KEY=your-api-key-here  # Can be same as GOOGLE_API_KEY
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your-search-engine-id-here
```

### 5. Restart Backend

```bash
# Stop current backend (Ctrl+C or pkill)
cd backend
npm run build
PORT=3001 node dist/index.js
```

## Testing

Once configured, try creating a listing again:
1. Upload an image
2. AI should recognize the item
3. Price suggestions should appear

## API Limits (Free Tier)

- **Vision API**: 1,000 requests/month free
- **Custom Search**: 100 requests/day free

## Troubleshooting

### "Google APIs are not configured" error
- Check `.env` file has `GOOGLE_API_KEY` set
- Restart backend after adding keys
- Verify API key is valid in Google Cloud Console

### "API key not valid" error
- Verify API key is correct
- Check API restrictions allow Vision API and Custom Search API
- Ensure billing is enabled

### "Quota exceeded" error
- Check usage in Google Cloud Console
- Wait for quota reset (daily/monthly)
- Consider upgrading quota if needed

## Next: eBay API Setup

After Google APIs are working, you can set up eBay API for direct listing posting. See `docs/EBAY_SETUP.md` for details.

