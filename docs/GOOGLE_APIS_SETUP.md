# Google APIs Setup Guide

This guide covers setting up Google Vision API (for image recognition/Lens-like functionality) and Google Custom Search API (for Shopping search).

## Required APIs

1. **Google Cloud Vision API** - For image recognition and object detection
2. **Google Custom Search API** - For product search and price comparison

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for API usage)

## Step 2: Enable Required APIs

### Enable Vision API

1. Navigate to **APIs & Services** > **Library**
2. Search for "Cloud Vision API"
3. Click **Enable**

### Enable Custom Search API

1. In **APIs & Services** > **Library**
2. Search for "Custom Search API"
3. Click **Enable**

## Step 3: Create API Keys

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. (Recommended) Restrict the API key:
   - Click on the key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Vision API" and "Custom Search API"
   - Save

## Step 4: Set Up Custom Search Engine

For Google Shopping search, you need a Custom Search Engine:

1. Go to [Google Custom Search](https://programmablesearchengine.google.com/)
2. Click **Add** to create a new search engine
3. Configure:
   - **Sites to search**: Enter `*` (search entire web) or specific shopping sites
   - **Name**: Llatria Shopping Search
   - **Language**: English (or your preference)
4. Click **Create**
5. Go to **Setup** > **Basics**
6. Enable **Search the entire web**
7. Copy the **Search engine ID** (looks like: `012345678901234567890:abcdefghijk`)

## Step 5: Configure Environment Variables

Add to `backend/.env`:

```env
# Google API Configuration
GOOGLE_API_KEY=your-api-key-here
GOOGLE_VISION_API_KEY=your-api-key-here  # Can be same as GOOGLE_API_KEY
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your-search-engine-id-here
```

## Step 6: Test the APIs

### Test Vision API

```bash
curl -X POST \
  "https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [{
      "image": {
        "content": "BASE64_ENCODED_IMAGE"
      },
      "features": [{
        "type": "LABEL_DETECTION",
        "maxResults": 10
      }]
    }]
  }'
```

### Test Custom Search API

```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_SEARCH_ENGINE_ID&q=iPhone+13+price"
```

## API Limits & Pricing

### Vision API
- **Free tier**: 1,000 requests/month
- **Pricing**: $1.50 per 1,000 requests (after free tier)
- **Rate limits**: 1,800 requests/minute

### Custom Search API
- **Free tier**: 100 requests/day
- **Pricing**: $5 per 1,000 requests (after free tier)
- **Rate limits**: 10 requests/second

## Usage Tips

1. **Cache results**: Store recognition results to avoid repeated API calls
2. **Batch requests**: When possible, batch multiple images in one request
3. **Error handling**: Implement retry logic with exponential backoff
4. **Rate limiting**: Monitor usage and implement client-side rate limiting

## Troubleshooting

### "API key not valid" error
- Verify API key is correct
- Check API restrictions allow Vision API and Custom Search API
- Ensure billing is enabled

### "Quota exceeded" error
- Check usage in Google Cloud Console
- Implement caching to reduce API calls
- Consider upgrading quota if needed

### "Search engine not found" error
- Verify Custom Search Engine ID is correct
- Ensure search engine is set to search entire web
- Check search engine is active

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables** for all keys
3. **Restrict API keys** to specific APIs and IPs (for production)
4. **Rotate keys periodically**
5. **Monitor usage** in Google Cloud Console
6. **Set up alerts** for unusual activity

## Alternative: Using Google Lens (No Direct API)

Google Lens doesn't have a public API. Our implementation uses:
- **Vision API** for image recognition (similar to Lens)
- **Custom Search API** for visual product search

This provides similar functionality to Google Lens for product identification.

## Next Steps

After setup:
1. Test image recognition endpoint: `POST /api/ai/recognize`
2. Test price search: `GET /api/ai/search?query=iPhone+13`
3. Test price comparison: `GET /api/ai/price-comparison?productName=iPhone+13&brand=Apple`



