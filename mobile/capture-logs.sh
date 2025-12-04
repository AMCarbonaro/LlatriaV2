#!/bin/bash
# Script to capture Expo/Metro bundler logs

LOG_FILE="/Users/amcarbonaro/Desktop/DESKTOP 1/Carbonaro Media 2/llatria/mobile/expo-logs.txt"

echo "=== Capturing Expo Logs ===" > "$LOG_FILE"
echo "Timestamp: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

echo "=== Expo Process Info ===" >> "$LOG_FILE"
ps aux | grep "expo start" | grep -v grep >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE"

echo "=== Port Status ===" >> "$LOG_FILE"
lsof -i :8081 -i :19006 >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE"

echo "=== Metro Bundler Status ===" >> "$LOG_FILE"
curl -s http://localhost:8081/status >> "$LOG_FILE" 2>&1
echo "" >> "$LOG_FILE"

echo "=== React Version Check ===" >> "$LOG_FILE"
cd "/Users/amcarbonaro/Desktop/DESKTOP 1/Carbonaro Media 2/llatria/mobile"
npm list react react-native 2>&1 | grep -E "react@|react-native@" | head -5 >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

echo "✅ Logs saved to: $LOG_FILE"
echo "📋 You can now copy the contents of expo-logs.txt"



