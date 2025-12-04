# Facebook Marketplace Automation - Testing Guide

## How It Works

The Facebook automation uses Electron's BrowserWindow to:
1. Open Facebook Marketplace create page
2. Automatically fill in form fields (title, price, description, location)
3. Prepare images for upload (saves to Downloads folder)
4. User manually clicks "Publish" (due to browser security)

## Testing Steps

### 1. Start the Desktop App

```bash
cd desktop
npm run dev
```

This will:
- Start Vite dev server
- Launch Electron app
- Open the desktop application

### 2. Create or Select an Inventory Item

- Go to Inventory page
- Either create a new item or select an existing one
- Make sure the item has:
  - Title
  - Description
  - Price
  - At least one image
  - Facebook platform selected

### 3. Fill Facebook Listing Details

In the item details sidebar:
- Scroll to "Facebook Marketplace" section
- Fill in:
  - Title (or use item title)
  - Description (or use item description)
  - Price (or use item price)
  - Location (required for Facebook)

### 4. Test Facebook Posting

1. Click the **"Post"** button in Facebook section
2. A new Electron window will open
3. Navigate to Facebook Marketplace create page
4. The automation will:
   - Fill in the form fields automatically
   - Save images to `~/Downloads/llatria-facebook-images/`
   - Highlight the image upload area
   - Show a notification with image location

### 5. Complete the Posting

**Manual Steps (required due to browser security):**
1. Review the filled form
2. Drag images from Downloads folder to Facebook upload area
3. Click "Publish" button manually
4. Close the Facebook window
5. Status will update in the main app

## What to Expect

### Success Flow:
1. ✅ Facebook window opens
2. ✅ Form fields are filled automatically
3. ✅ Images are saved to Downloads folder
4. ✅ Upload area is highlighted
5. ⚠️ User drags images manually
6. ⚠️ User clicks Publish manually
7. ✅ Status updates to "posted"

### Error Scenarios:

**"Please log in to Facebook first"**
- Solution: Log in to Facebook in the opened window
- The automation will detect login status

**"Could not find title field"**
- Facebook may have updated their UI
- Solution: Update selectors in `facebook-automation.js`

**"Electron API not available"**
- App is not running in Electron
- Solution: Use `npm run dev` (not just `npm run dev:react`)

## Debugging

### Enable DevTools in Facebook Window

Edit `desktop/electron/facebook-automation.js`:

```javascript
this.browserWindow = new BrowserWindow({
  // ... existing config
  webPreferences: {
    // ... existing config
    devTools: true, // Add this
  },
});

// Add this after creating window
this.browserWindow.webContents.openDevTools();
```

### Check Console Logs

The automation logs to Electron's console. Check terminal where you ran `npm run dev`.

### Test Form Field Detection

The automation tries multiple selectors. If Facebook updates their UI:
1. Open Facebook Marketplace create page manually
2. Inspect form fields
3. Update selectors in `facebook-automation.js`

## Known Limitations

1. **Image Upload**: Must be done manually (browser security prevents programmatic file uploads)
2. **Final Publish**: Must be clicked manually (same security reason)
3. **2FA**: If Facebook requires 2FA, user must complete it manually
4. **Rate Limiting**: Facebook may rate limit if posting too quickly

## Improving the Automation

### Better Selectors
Facebook uses dynamic class names. Consider:
- Using more specific selectors
- Waiting for elements with better detection
- Using data attributes if available

### Image Upload Alternative
- Could use Electron's file dialog
- Or clipboard paste if Facebook supports it
- Or drag-and-drop automation (more complex)

### Auto-Publish
- Not recommended (violates Facebook ToS)
- Current approach (manual publish) is safer

## Testing Checklist

- [ ] Electron app launches
- [ ] Facebook window opens when clicking Post
- [ ] Form fields are detected and filled
- [ ] Images are saved to Downloads folder
- [ ] Upload area is highlighted
- [ ] Can manually drag images
- [ ] Can manually click Publish
- [ ] Status updates after publishing
- [ ] Error handling works (login required, etc.)



