# How to View Expo Logs

## The Issue
When Expo runs in the background, you can't see the logs in the terminal. Here's how to find them:

## Solution 1: View Log File
The logs are being written to:
```
mobile/expo-live-logs.txt
```

You can view them anytime by running:
```bash
tail -f mobile/expo-live-logs.txt
```

Or just open the file in your editor.

## Solution 2: Run Expo in Foreground
To see logs in real-time, run Expo in your terminal:

```bash
cd mobile
npm start
```

This will show all logs directly in your terminal window, and you can copy them from there.

## Solution 3: Check Logs After Errors
If you see an error in the app:
1. Check the terminal where you ran `npm start`
2. The error will appear there
3. You can copy/paste it from that terminal window

## Current Log Location
- **Live logs**: `mobile/expo-live-logs.txt` (continuously updating)
- **Status check**: Run `./check-logs.sh` for a quick status

## To Restart with Visible Logs
```bash
cd mobile
npm start
```
Then watch the terminal for any errors!



