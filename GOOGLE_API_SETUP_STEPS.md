# Google API Setup - Step by Step

## Current Step: Creating Credentials

You're at the credential creation screen. Here's what to do:

### Step 1: Select "Application data"

✅ **Select: "Application data"**

**Why?** 
- We're processing images uploaded to our app (application data)
- We're not accessing Google user accounts (like Gmail, Drive, etc.)
- This is server-to-server API access, not user-facing OAuth

### Step 2: Complete the Service Account Creation

After selecting "Application data":
1. You'll be asked to create a service account
2. Give it a name like "llatria-vision-api"
3. Click "Create and Continue"
4. Skip role assignment (not needed for API keys)
5. Click "Done"

### Step 3: Create API Key (This is what we actually need)

The service account is created, but our code uses **API keys**, not service accounts.

1. Go back to **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"API key"** (not OAuth client or Service account)
4. Copy the generated API key
5. (Recommended) Click on the API key to edit it:
   - Under "API restrictions", select "Restrict key"
   - Under "Restrict key", select:
     - ✅ Cloud Vision API
     - ✅ Custom Search API
   - Click "Save"

### Step 4: Enable the APIs

Make sure both APIs are enabled:
1. Go to **APIs & Services** > **Library**
2. Search for "Cloud Vision API" - click it and click **Enable**
3. Search for "Custom Search API" - click it and click **Enable**

### Step 5: Add API Key to Backend

Edit `backend/.env`:

```env
GOOGLE_API_KEY=AIzaSy...your-api-key-here
GOOGLE_VISION_API_KEY=AIzaSy...your-api-key-here  # Can be same as above
```

### Step 6: Create Custom Search Engine

1. Go to [Google Custom Search](https://programmablesearchengine.google.com/)
2. Click **"Add"**
3. Configure:
   - **Sites to search**: `*` (asterisk to search entire web)
   - **Name**: Llatria Shopping Search
4. Click **"Create"**
5. Go to **Setup** > **Basics**
6. Enable **"Search the entire web"**
7. Copy the **Search engine ID** (looks like: `012345678901234567890:abcdefghijk`)

Add to `backend/.env`:
```env
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your-search-engine-id-here
```

### Step 7: Restart Backend

```bash
cd backend
npm run build
PORT=3001 node dist/index.js
```

## Quick Reference

**What we need:**
- ✅ API Key (not service account key)
- ✅ Cloud Vision API enabled
- ✅ Custom Search API enabled
- ✅ Custom Search Engine ID

**What we don't need:**
- ❌ Service account JSON file
- ❌ OAuth client credentials
- ❌ User consent screens

## Troubleshooting

**"API key not valid"**
- Make sure you copied the full API key (starts with `AIzaSy`)
- Check API restrictions allow Vision API and Custom Search API
- Verify both APIs are enabled in the Library

**"Quota exceeded"**
- Free tier: 1,000 Vision requests/month, 100 Custom Search requests/day
- Check usage in Google Cloud Console > APIs & Services > Dashboard



