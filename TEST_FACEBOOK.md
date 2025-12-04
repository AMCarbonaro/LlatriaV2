# Testing Facebook Marketplace Automation

## Quick Test Steps

### 1. Start the Desktop App

```bash
cd desktop
npm run dev
```

This will:
- Start Vite dev server
- Launch Electron app
- Open the desktop application

### 2. Create a Test Item

1. Click "Create Listing" or select an existing item
2. Make sure the item has:
   - ✅ Title
   - ✅ Description  
   - ✅ Price
   - ✅ At least one image
   - ✅ Facebook platform selected (check the checkbox)

### 3. Fill Facebook Details

In the item details panel:
- Scroll to "Facebook Marketplace" section
- Fill in:
  - **Title**: (or leave blank to use item title)
  - **Description**: (or leave blank to use item description)
  - **Price**: (or leave blank to use item price)
  - **Location**: **REQUIRED** - Enter a location (e.g., "San Francisco, CA")

### 4. Test the Automation

1. Click the **"Post"** button in the Facebook section
2. **What should happen:**
   - A new Electron window opens
   - Navigates to Facebook Marketplace create page
   - Waits 3 seconds for page to load
   - Automatically fills in form fields
   - Saves images to `~/Downloads/llatria-facebook-images/`
   - Highlights the image upload area
   - Shows a notification with image location

### 5. Complete Manually

**You'll need to:**
1. **Log in** to Facebook (if not already logged in)
2. **Drag images** from Downloads folder to Facebook upload area
3. **Click "Publish"** button manually
4. Close the Facebook window
5. Status should update in main app

## What to Look For

### ✅ Success Indicators:
- Facebook window opens automatically
- Form fields get filled (title, price, description)
- Images saved to Downloads folder
- Upload area highlighted with blue border
- Notification appears showing image location

### ⚠️ Common Issues:

**"Please log in to Facebook first"**
- Solution: Log in to Facebook in the opened window
- The automation will detect when you're logged in

**"Could not find title field"**
- Facebook may have updated their UI
- Check DevTools console for debugging info
- May need to update selectors in code

**Form not filling**
- Facebook may be loading slowly
- Wait a few more seconds
- Check DevTools for errors

**Images not appearing**
- Check `~/Downloads/llatria-facebook-images/` folder
- Images should be there as JPG files
- Drag them manually to Facebook

## Debugging

### Enable DevTools

DevTools should already be enabled in development mode. You'll see:
- Console logs showing automation progress
- Network requests
- Element inspector

### Check Console Logs

Look for:
- `[Facebook Automation] Navigating to: ...`
- `[Facebook Automation] Page loaded, waiting for form...`
- `[Facebook Automation] Current URL: ...`
- Any error messages

### Test Selectors Manually

If form fields aren't being found:
1. Open Facebook Marketplace create page in regular browser
2. Inspect the form fields
3. Note their selectors (IDs, classes, attributes)
4. Update selectors in `facebook-automation.js`

## Expected Behavior

1. **Window Opens**: New Electron window appears
2. **Page Loads**: Facebook Marketplace create page loads
3. **Form Fills**: Fields populate automatically (2-5 seconds)
4. **Images Ready**: Images saved to Downloads folder
5. **User Action**: You drag images and click Publish
6. **Status Updates**: Main app shows "posted" status

## Troubleshooting

### Window doesn't open
- Check Electron is running (not just Vite)
- Look for errors in terminal
- Verify `window.electron.postToFacebook` is available

### Form fields not filling
- Facebook UI may have changed
- Check DevTools console for selector errors
- Try waiting longer (Facebook is slow)

### Images not saving
- Check file permissions
- Verify Downloads folder exists
- Check terminal for file system errors

### Can't find upload area
- Facebook may use different selectors
- Try clicking upload area manually
- Images are still in Downloads folder

## Next Steps After Testing

If everything works:
- ✅ Automation is ready for use
- Consider adding more robust selectors
- Add retry logic for failed field detection

If issues found:
- Update selectors based on current Facebook UI
- Add better error messages
- Improve field detection logic



