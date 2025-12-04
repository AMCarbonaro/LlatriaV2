# Restart App - Manual Steps

## 1. Start Backend (Terminal 1)

```bash
cd backend
PORT=3001 npm run dev
```

Wait for: `Backend server running on port 3001`

## 2. Start Frontend (Terminal 2)

```bash
cd desktop
npm run dev
```

This will:
- Start Vite dev server (usually on port 3000 or next available)
- Launch Electron app automatically

## 3. Verify

**Backend:**
```bash
curl http://localhost:3001/health
```
Should return: `{"status":"ok",...}`

**Frontend:**
- Electron app should open automatically
- Or open browser to the URL shown in terminal (usually http://localhost:3000)

## 4. Login

Use test credentials:
- **Email:** `test@llatria.com`
- **Password:** `test1234`

## Quick Restart Script

Save this as `restart.sh`:

```bash
#!/bin/bash
# Kill existing processes
pkill -f "tsx.*index.ts"
pkill -f "vite"
pkill -f "electron"

# Start backend
cd backend
PORT=3001 npm run dev &
BACKEND_PID=$!

# Wait for backend
sleep 5

# Start frontend
cd ../desktop
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend: http://localhost:3001"
echo "Frontend: Check terminal for URL"
```

Run with: `chmod +x restart.sh && ./restart.sh`



