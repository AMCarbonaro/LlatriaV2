# How to Find/Create Your API Key

## The API Key is Separate from the Service Account

The service account you just created is different from the API key. You need to create the API key separately.

## Steps to Create API Key

### Method 1: Direct Path (Easiest)

1. In Google Cloud Console, go to:
   **APIs & Services** → **Credentials**

2. At the top of the page, click the big blue button:
   **"+ CREATE CREDENTIALS"**

3. From the dropdown menu, select:
   **"API key"** (NOT "OAuth client ID" or "Service account")

4. A popup will appear with your API key (starts with `AIzaSy...`)

5. **Copy the API key immediately** - you can't see it again after closing!

6. (Recommended) Click **"RESTRICT KEY"** to secure it:
   - Under "API restrictions", select "Restrict key"
   - Check these boxes:
     - ✅ Cloud Vision API
     - ✅ Custom Search API
   - Click "SAVE"

### Method 2: If You Don't See "Create Credentials" Button

1. Go to **APIs & Services** → **Credentials**
2. Look for a section called **"API keys"** 
3. If you see any existing API keys listed, you can:
   - Click on one to view/edit it
   - Or click **"+ CREATE CREDENTIALS"** at the top to make a new one

### Method 3: Via API Library

1. Go to **APIs & Services** → **Library**
2. Search for "Cloud Vision API"
3. Click on it
4. Click **"ENABLE"** (if not already enabled)
5. After enabling, you'll see a button: **"CREATE CREDENTIALS"**
6. Select **"API key"** from the options

## What the API Key Looks Like

Your API key will look like this:
```
AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

It starts with `AIzaSy` and is about 39 characters long.

## After You Get the API Key

1. Copy it
2. Add to `backend/.env`:
   ```env
   GOOGLE_API_KEY=AIzaSy...your-key-here
   GOOGLE_VISION_API_KEY=AIzaSy...your-key-here
   ```
3. Restart your backend

## Still Can't Find It?

If you're still having trouble:
1. Make sure you're in the correct Google Cloud project
2. Check the top of the page - it should show your project name
3. Try refreshing the page
4. The API key creation might be in a different section depending on your Google Cloud Console version

## Quick Check: Are APIs Enabled?

Before creating the API key, make sure these are enabled:
1. Go to **APIs & Services** → **Library**
2. Search for "Cloud Vision API" - should show "ENABLED"
3. Search for "Custom Search API" - should show "ENABLED"

If they're not enabled, enable them first, then create the API key.



