# Enable Google Cloud Billing

## The Issue

Google Cloud Vision API requires billing to be enabled, even for the free tier. You won't be charged for free tier usage.

## Quick Fix

**Click this link to enable billing:**
https://console.developers.google.com/billing/enable?project=486109703352

Or manually:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **Billing** → **Link a billing account**
4. Add a payment method (you won't be charged for free tier)

## Free Tier Limits

- **Vision API**: 1,000 requests/month FREE
- **Custom Search**: 100 requests/day FREE

You won't be charged unless you exceed these limits.

## After Enabling

1. Wait 2-3 minutes for billing to propagate
2. Try uploading an image again
3. AI recognition should work

## Current Status

✅ **Item creation**: Working (images upload successfully)
✅ **Image compression**: Working (136 KB is good)
❌ **AI recognition**: Waiting for billing to be enabled

The item will still be created even if AI fails - it just won't have AI-generated data until billing is enabled.






