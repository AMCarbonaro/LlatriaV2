# Launch iOS Simulator - Step by Step

## Quick Launch (Recommended)

Open a terminal and run:

```bash
cd "/Users/amcarbonaro/Desktop/DESKTOP 1/Carbonaro Media 2/llatria/mobile"
npx expo start --ios
```

This should automatically:
1. Start the Expo dev server
2. Open the iOS Simulator
3. Build and install the app
4. Launch the app in the simulator

## Manual Launch (If automatic doesn't work)

1. **Start Expo:**
   ```bash
   cd "/Users/amcarbonaro/Desktop/DESKTOP 1/Carbonaro Media 2/llatria/mobile"
   npx expo start
   ```

2. **Wait for Expo to start** - You'll see:
   - Metro bundler running
   - QR code
   - Options menu

3. **Press `i`** on your keyboard to launch iOS simulator

## Troubleshooting

### If simulator doesn't open:
- Make sure Xcode is installed: `xcode-select --install`
- Check if simulator is available: `xcrun simctl list devices`

### If app doesn't build:
- Make sure dependencies are installed: `npm install`
- Clear cache: `npx expo start --clear`

### If you see errors:
- Check that backend is running on `http://localhost:3001`
- Make sure all services are running (Docker, backend, etc.)

## Current Status

- ✅ iOS Simulator: Booted (iPhone 17 Pro Max)
- ✅ Expo: Ready to start
- ✅ Dependencies: Should be installed

Run the command above in your terminal to launch!


