# Verify Your API Setup

## ✅ What You Have

You've created a Google API key: `AIzaSyAKIs0XJ6WJvqPUHdxAwrMKc0xgkiMx2jY`

This API key can work for **both** Cloud Vision API and Custom Search API (they can share the same key).

## 🔍 What You Still Need

### 1. Custom Search Engine ID (for price search)

You need to create a Custom Search Engine to search for products and prices:

1. Go to: https://programmablesearchengine.google.com/
2. Click **"Add"** to create a new search engine
3. Fill in:
   - **Sites to search**: Enter `*` (just an asterisk - this searches the entire web)
   - **Name**: `Llatria Shopping Search` (or any name you like)
4. Click **"Create"**
5. After creation, go to **"Setup"** → **"Basics"**
6. Enable **"Search the entire web"** (important!)
7. Copy the **Search engine ID** (looks like: `012345678901234567890:abcdefghijk`)

### 2. Verify APIs Are Enabled

Make sure these APIs are enabled in Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/library
2. Search for **"Cloud Vision API"** - should show "ENABLED" ✅
3. Search for **"Custom Search API"** - should show "ENABLED" ✅

If not enabled, click on each one and click the "ENABLE" button.

## 📝 Add to Backend

Once you have the Custom Search Engine ID, add it to `backend/.env`:

```env
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your-search-engine-id-here
```

## 🧪 Test Your Setup

After adding everything, restart the backend and try creating a listing:

```bash
cd backend
npm run build
PORT=3001 node dist/index.js
```

Then in the app:
1. Create a new listing
2. Upload an image
3. AI should recognize the item
4. Price suggestions should appear

## ❓ Which API Key Did You Create?

The API key you provided (`AIzaSyAKIs0XJ6WJvqPUHdxAwrMKc0xgkiMx2jY`) should work for both:
- ✅ Cloud Vision API (image recognition)
- ✅ Custom Search API (product search)

To verify which APIs it's restricted to:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click on your API key
3. Check "API restrictions" section
4. It should list "Cloud Vision API" and "Custom Search API"

If it says "Don't restrict key", that's okay too - it will work for all enabled APIs.

## 🚀 Quick Checklist

- [x] API Key created: `AIzaSyAKIs0XJ6WJvqPUHdxAwrMKc0xgkiMx2jY`
- [x] API Key added to `backend/.env`
- [ ] Cloud Vision API enabled
- [ ] Custom Search API enabled  
- [ ] Custom Search Engine created
- [ ] Custom Search Engine ID added to `backend/.env`
- [ ] Backend restarted






