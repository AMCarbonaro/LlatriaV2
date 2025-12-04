#!/bin/bash
# Script to check Expo/Metro bundler logs

echo "=== Expo Server Status ==="
lsof -ti:8081 > /dev/null 2>&1 && echo "✅ Expo server is running on port 8081" || echo "❌ Expo server is not running"

echo ""
echo "=== Metro Bundler Status ==="
curl -s http://localhost:8081/status 2>/dev/null && echo "" || echo "❌ Cannot reach Metro bundler"

echo ""
echo "=== TypeScript Errors ==="
cd "/Users/amcarbonaro/Desktop/DESKTOP 1/Carbonaro Media 2/llatria/mobile"
npx tsc --noEmit 2>&1 | head -20 || echo "No TypeScript errors found"

echo ""
echo "=== Recent npm Errors ==="
find ~/.npm/_logs -name "*-debug-*.log" -mtime -1 2>/dev/null | tail -1 | xargs tail -30 2>/dev/null || echo "No recent npm error logs"

echo ""
echo "=== React Version Check ==="
npm list react react-native 2>&1 | grep -E "react@|react-native@" | head -3



