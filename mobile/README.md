# Llatria Mobile App

React Native mobile application for Llatria pawn shop inventory management.

## Features

- 📸 **Camera Integration**: Take photos of inventory items directly from the app
- 🤖 **AI Recognition**: Automatic item recognition and data generation
- 📱 **Inventory View**: Browse your inventory on mobile
- 🔄 **Sync**: Data syncs with desktop app (when backend is implemented)

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Camera**: Expo Camera

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device/simulator:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
mobile/
├── app/                  # Expo Router pages
│   ├── (tabs)/          # Tab navigation
│   │   ├── index.tsx    # Inventory list
│   │   ├── camera.tsx   # Camera screen
│   │   └── settings.tsx # Settings
│   └── item/[id].tsx    # Item detail page
├── src/
│   ├── types/           # TypeScript types
│   ├── services/        # API/services
│   └── store/           # Zustand stores
└── package.json
```

## Development Notes

- Uses AsyncStorage for local data persistence
- Camera requires device permissions
- AI recognition is simulated (mock service)
- Will sync with backend when implemented

