# Llatria - Pawn Shop Inventory Management

A modern desktop application for managing pawn shop inventory with AI-powered item recognition and multi-platform listing capabilities.

## Features

- 📸 **Photo Upload & AI Recognition**: Upload photos and automatically recognize items using AI
- 💰 **Market Price Analysis**: Get suggested prices based on market data
- 📱 **Multi-Platform Posting**: Post to Facebook Marketplace, eBay, and your website
- 🎨 **Modern UI**: Clean, minimal design with light/dark mode support
- 📊 **Inventory Management**: View, edit, search, and filter your inventory
- 🖥️ **Desktop-First**: Optimized for desktop use with Electron

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev:desktop
```

This will:
- Start the Vite dev server on http://localhost:3000
- Launch the Electron app

### Building

To build the application for production:

```bash
npm run build:desktop
```

## Project Structure

```
llatria/
├── desktop/              # Desktop application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── services/     # Mock services (AI, inventory, storage)
│   │   ├── types/         # TypeScript type definitions
│   │   └── styles/        # Global styles
│   ├── electron/         # Electron main process
│   └── package.json
└── package.json          # Root package.json
```

## Development Notes

- Currently uses mock data and services (no backend)
- AI recognition is simulated with delays
- Inventory is stored in localStorage
- Platform posting is UI-only (no actual API integration yet)

## Next Steps

- Backend API integration
- Real AI/ML services integration
- Facebook Marketplace API integration
- eBay API integration
- Website generation and hosting


