# Debugging White Screen Issue

## What I've Fixed
✅ Added loading state - Shows "Loading..." while app initializes
✅ Added error handling - Catches initialization errors
✅ Added error display - Shows error messages if something fails

## Next Steps to Debug

### 1. Check Browser Console
Open your browser's developer console (F12 or Cmd+Option+I) and check for:
- Red error messages
- JavaScript errors
- Failed network requests

### 2. Check the Logs File
The logs are saved to: `mobile/expo-live-logs.txt`

View recent logs:
```bash
tail -50 mobile/expo-live-logs.txt
```

### 3. Common Causes of White Screen

#### A. Initialization Errors
- Auth store initialization failing
- Theme store initialization failing
- AsyncStorage errors on web

#### B. Component Compatibility
Some React Native components don't work on web:
- `GestureHandlerRootView` - May need web wrapper
- Native modules that aren't web-compatible

#### C. Routing Issues
- Expo Router not initializing properly
- Auth redirect logic stuck

### 4. Quick Fixes to Try

**Option 1: Add Web Error Boundary**
The app should now show a loading screen, but if you still see white:
- Check browser console for errors
- Share the console error messages

**Option 2: Check Network Tab**
- Open browser DevTools > Network tab
- Look for failed requests (red entries)
- Check if JavaScript files are loading

**Option 3: Clear Browser Cache**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or clear browser cache completely

### 5. To Get Error Details

**In Browser Console:**
1. Press F12 or Cmd+Option+I
2. Click "Console" tab
3. Look for red error messages
4. Copy and share them

**From Terminal:**
```bash
# View full logs
cat mobile/expo-live-logs.txt

# Or follow in real-time
tail -f mobile/expo-live-logs.txt
```

## Expected Behavior Now
1. **Loading screen** appears first (with spinner)
2. **Login screen** should appear after initialization
3. If error occurs, **error message** is shown

If you still see white screen, the browser console will have the specific error!



