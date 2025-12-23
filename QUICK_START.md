# Quick Start - Get Running in 5 Minutes

## Prerequisites Check

1. **Docker Desktop** - Must be running
2. **Node.js** - Should be installed (check with `node --version`)

## Setup Steps

### 1. Start Docker Desktop
- Open Docker Desktop app
- Wait for it to start (whale icon in menu bar)

### 2. Start Database (One Command)
```bash
docker-compose up -d postgres
```

### 3. Configure Backend
```bash
cd backend

# Create .env file (copy this exactly)
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:password@localhost:5432/llatria
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=local-dev-secret-change-in-production-min-32-chars-long
JWT_REFRESH_SECRET=local-dev-refresh-secret-change-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
EOF

# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Start server
npm run dev
```

### 4. Start Frontend (New Terminal)
```bash
cd desktop
npm install  # If not already done
npm run dev
```

### 5. Open App
- Browser should open automatically
- Or go to: `http://localhost:3000` (or next available port)

## That's It! 🎉

You can now:
- Register a new account
- Create inventory items
- Test the app

## Need Help?

See `DOCKER_SETUP.md` for detailed troubleshooting.






